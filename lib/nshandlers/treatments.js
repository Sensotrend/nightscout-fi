import moment from 'moment';
import _DataConverter from '../DataFormatConverter';
const DataConverter = _DataConverter();

function NSTreatments () {

   NSTreatments.getTreatments = async function (fhirserver, userid, token, query) {

      let dateQuery = [];

      function getDateString(d) {
         let _d = new Date(d);
         return _d.toISOString().replace(/T.+/, '');
      }

      if (query.find) {
         if (query.find.created_at) {
            const d = query.find.created_at;
            if (d["$eq"]) {
               dateQuery.push("eq" + getDateString(d["$eq"])); 
            }
            if (d["$gt"]) {
               dateQuery.push("gt" + getDateString(d["$gt"])); 
            }
            if (d["$lt"]) {
               dateQuery.push("lt" + getDateString(d["$lt"])); 
            }
            if (d["$ge"]) {
               dateQuery.push("ge" + getDateString(d["$ge"])); 
            }
            if (d["$le"]) {
               dateQuery.push("fe" + getDateString(d["$le"])); 
            }
         }
      }

      var count = 20;
      if (query.count && !isNaN(query.count)) { count = Math.min(query.count, 10000); }
      console.log('Requesting up to ' + count + ' treatments');

      var FHIRClient = new(require('../FHIRClient'))(fhirserver, userid, token);

      // carbs
      let s = {
         _count: count
         , _sort: 'date'
         , patient: userid
         , code: '9059-7'
      };

      if (dateQuery.length != 0) { s.date = dateQuery; }

      var records = await FHIRClient.search('Observation', s);
      console.log('Got Carb entries, count ' + records.body.total);

      // short acting insulin
      s = {
         _count: count
         , _sort: 'effective-time'
         , patient: userid
         , code: 'A10AC'
      };

      if (dateQuery.length != 0) { s["effective-time"] = dateQuery; }

      var records2 = await FHIRClient.search('MedicationAdministration', s);
      console.log('Got Insulin treatments, count ' + records2.body.total);

      records.body.entry = (records.body.total > 0) ? records.body.entry : [];
      records2.body.entry = (records2.body.total) ? records2.body.entry : [];

      let allRecords = records.body.entry.concat(records2.body.entry);

      let options = {
         source: 'fiphr'
         , target: 'nightscout'
         , datatypehint: 'treatments'
         , FHIR_userid: userid  // Needed for FHIR conversion
      };

      let r = await DataConverter.convert(allRecords, options);

      return r;
   };

   NSTreatments.postTreatments = async function (fhirserver, userid, token, treatments) {

      console.log('Uploading treatment data to FHIR server ' + fhirserver); //  + ' with patient id ' + userid);

      let options = {
         source: 'nightscout'
         , target: 'fiphr'
         , datatypehint: 'treatments'
         , FHIR_userid: userid  // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(treatments, options);

      var FHIRClient = new(require('../FHIRClient'))(fhirserver, userid, token);

      if (records.length > 0) {
         var uploadResults = await FHIRClient.createRecords(records);
         console.log('Converted and uploaded records: ' + await JSON.stringify(uploadResults));
      } else {
         console.log('Skipping uploading');
      }
      return true;
   };

   return NSTreatments;
}

export default NSTreatments;
