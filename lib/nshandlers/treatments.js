import moment from 'moment';
import _DataConverter from '../DataFormatConverter';
const DataConverter = _DataConverter();

function NSTreatments () {

   NSTreatments.getTreatments = async function (fhirserver, userid, token) {

      var FHIRClient = new(require('../FHIRClient'))(fhirserver, userid, token);

      // carbs
      let s = {
         _count: 1
         , _sort: 'date'
         , patient: userid
         , code: '9059-7'
      };

      var records = await FHIRClient.search('Observation', s);
      console.log('Got Carb entries, count ' + records.body.total);

      // short acting insulin
      s = {
         _count: 1
         , _sort: 'effective-time'
         , patient: userid
         , code: 'A10AC'
      };

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

      console.log('Uploading treatment data to FHIR server ' + fhirserver + ' with patient id ' + userid);

      let options = {
         source: 'nightscout'
         , target: 'fiphr'
         , datatypehint: 'treatments'
         , FHIR_userid: userid  // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(treatments, options);

      var FHIRClient = new(require('../FHIRClient'))(fhirserver, userid, token);

      if (records.length > 0) {
         console.log('Uploading', records);
         var uploadResults = await FHIRClient.createRecords(records);
         console.log('Converted and uploaded records: ' + await JSON.stringify(uploadResults));
      } else {
         console.log('Skipping uploading');
         console.log(JSON.stringify(records, null, 3));
      }
      return true;
   };

   return NSTreatments;
}

export default NSTreatments;
