import _FHIRClient from '../FHIRClient';
import _DataConverter from '../DataFormatConverter';
const DataConverter = _DataConverter();

function NSTreatments (env) {

   NSTreatments.getTreatments = async function (fhirserver, userid, token, query) {

      let dateQuery = [];

      function getDateString(d) {
         const _d = new Date(d);
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
            if (d["$gte"]) {
               dateQuery.push("ge" + getDateString(d["$gte"])); 
            }
            if (d["$lte"]) {
               dateQuery.push("le" + getDateString(d["$lte"])); 
            }
         }
      }

      let count = 20;
      if (query.count && !isNaN(query.count)) { count = Math.min(query.count, 10000); }
      console.log('Requesting up to ' + count + ' treatments');

      const FHIRClient = new _FHIRClient(fhirserver, userid, token, env);

      // carbs
      let s = {
         _count: count
         , _sort: 'date'
         , patient: userid
         , code: '9059-7'
      };

      if (dateQuery.length != 0) { s.date = dateQuery; }

      const records = await FHIRClient.search('Observation', s);
      console.log('Got Carb entries, count ' + records.body.total);

      // short acting insulin
      s = {
         _count: count * 2
         , _sort: 'effective-time'
         , patient: userid
         , code: 'ins-short-fast' // note FIPHR doesn't yet implement this code and will return all MedicationAdministration records for the patient
      };

      if (dateQuery.length != 0) { s["effective-time"] = dateQuery; }

      const records2 = await FHIRClient.search('MedicationAdministration', s);
      console.log('Got MedicationAdministration records, count ' + records2.body.total);

      records.body.entry = (records.body.total) ? records.body.entry : [];
      records2.body.entry = (records2.body.total) ? records2.body.entry : [];

      /*

      function getMedicationCodes(record) {
         let codes = [];
         record.medicationCodeableConcept.coding.forEach(function (code) {
            codes.push(code.code);
         });
         return codes;
      }

      records2.body.entry.forEach(function (entry) {
         console.log('Got codes, ', getMedicationCodes(entry.resource));
      });  

     const filtered = records2.body.entry.filter(function(record) {
        return getMedicationCodes(record.resource).includes('ins-short-fast');
      });
      */

      const allRecords = records.body.entry.concat(records2.body.entry);

      const options = {
         source: 'fiphr'
         , target: 'nightscout'
         , datatypehint: 'treatments'
         , FHIR_userid: userid  // Needed for FHIR conversion
      };

      let r = await DataConverter.convert(allRecords, options);

      r.sort(function (a, b) { return b.date - a.date; });

      return r;
   };

   NSTreatments.postTreatments = async function (fhirserver, userid, token, treatments) {

      console.log('Uploading treatment data to FHIR server ' + fhirserver); //  + ' with patient id ' + userid);

      const options = {
         source: 'nightscout'
         , target: 'fiphr'
         , datatypehint: 'treatments'
         , FHIR_userid: userid  // Needed for FHIR conversion
      };

      const records = await DataConverter.convert(treatments, options);

      const FHIRClient = new _FHIRClient(fhirserver, userid, token, env);

      if (records.length > 0) {
         const uploadResults = await FHIRClient.createRecords(records);
         console.log('Converted and uploaded records: ' + await JSON.stringify(uploadResults));
      } else {
         console.log('Skipping uploading');
      }
      return true;
   };

   return NSTreatments;
}

export default NSTreatments;
