import moment from 'moment';
import _DataConverter from '../DataFormatConverter';
const DataConverter = _DataConverter();

function NSEntries () {

   NSEntries.getEntries = async function (fhirserver, userid, token, query) {

      var count = 20;
      if (query.count && !isNaN(query.count)) { count = Math.min(query.count, 10000); }
      console.log('Requesting up to ' + count + ' entries');

      var FHIRClient = new(require('../FHIRClient'))(fhirserver, userid, token);

      let s = {
         _count: count
         , _sort: 'date'
         , patient: userid
         , code: '14743-9'
      };

      var records = await FHIRClient.search('Observation', s);
      console.log('Got Glucometer entries, count ' + records.body.total);

      s = {
         _count: count
         , _sort: 'date'
         , patient: userid
         , code: '14745-4'
      };

      var records2 = await FHIRClient.search('Observation', s);
      console.log('Got CGM entries, count ' + records2.body.total);

      records.body.entry = (records.body.total > 0) ? records.body.entry : [];
      records2.body.entry = (records2.body.total) ? records2.body.entry : [];

      let allRecords = records.body.entry.concat(records2.body.entry);

      let options = {
         source: 'fiphr'
         , target: 'nightscout'
         , datatypehint: 'entries'
         , FHIR_userid: userid  // Needed for FHIR conversion
      };

      let r = await DataConverter.convert(allRecords, options);

      return r;
   };

   NSEntries.postEntries = async function (fhirserver, userid, token, entries) {

      console.log('Loading data from FHIR server ' + fhirserver + ' with patient id ' + userid);

      var operationOutcome = true;

      let options = {
         source: 'nightscout'
         , target: 'fiphr'
         , datatypehint: 'entries'
         , FHIR_userid: userid  // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(entries, options);

      var FHIRClient = new(require('../FHIRClient'))(fhirserver, userid, token);

      if (records.length > 0) {
         console.log('Uploading', records);
         var uploadResults = await FHIRClient.createRecords(records);
         console.log('Converted and uploaded records: ' + await JSON.stringify(uploadResults));
         if (uploadResults.errors != 0) {
            operationOutcome = false;
         }
      } else {
         console.log('Skipping uploading');
         console.log(JSON.stringify(records, null, 3));
      }
      return operationOutcome;
   };

   return NSEntries;
}

export default NSEntries;
