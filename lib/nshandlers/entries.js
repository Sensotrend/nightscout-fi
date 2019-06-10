import _FHIRClient from '../FHIRClient';
import QueryBuilder from './queryBuilder';

function NSEntries (env) {
   const logger = env.logger;
   const DataConverter = env.dataFormatConverter;

   NSEntries.getEntries = async function (fhirserver, userid, token, query) {

      // Entries support "date" and "dateString" queries
      const { date, dateString } = query.find ? query.find : {};
      const dateQueryField = date ? date : dateString;
      let dateQuery = QueryBuilder.generateDateComponent(dateQueryField);
      logger.info('Query contains a date filter: ' + dateQuery);

      // Also filter by count
      let count = 2000;
      if (query.count && !isNaN(query.count)) { count = Math.min(query.count, 20000); }
      logger.info('Requesting up to ' + count + ' entries');

      const FHIRClient = new _FHIRClient(fhirserver, { patient: userid, bearertoken: token, env });

      let s = {
         _count: count,
         _sort: 'date',
         patient: userid,
         code: '14743-9',
         date: dateQuery
      };

      const  records = await FHIRClient.search('Observation', s);

      logger.info('Got Glucometer entries, count ' + records.total);

      if (records.total > 0) {
         records.entry.forEach(function (e) {
            logger.info('Result: ' + e.resource.resourceType + ' identifier ' + e.resource.identifier[0].value + ' ' + e.fullUrl);
         });
      }

      s = {
         _count: count,
         _sort: 'date',
         patient: userid,
         code: '14745-4',
         date: dateQuery
      };

      const records2 = await FHIRClient.search('Observation', s);
      logger.info('Got CGM entries, count ' + records2.total);

      if (records2.total > 0) {
         records2.entry.forEach(function (e) {
            logger.info('Result: ' + e.resource.resourceType + ' identifier ' + e.resource.identifier[0].value + ' ' + e.fullUrl);
         });
      }

      records.entry = (records.total > 0) ? records.entry : [];
      records2.entry = (records2.total) ? records2.entry : [];

      const allRecords = records.entry.concat(records2.entry);

      const options = {
         source: 'fiphr',
         target: 'nightscout',
         datatypehint: 'entries',
         FHIR_userid: userid // Needed for FHIR conversion
      };

      let r = await DataConverter.convert(allRecords, options);

      r.sort(function (a, b) { return b.date - a.date; });

      return r;
   };

   NSEntries.getPebble = async function (fhirserver, userid, token, query) {

      logger.info('/pebble');

      let e = await NSEntries.getEntries(fhirserver, userid, token, query);

      e.forEach(element => {
         element.datetime = element.date;
      });

      e.sort(function (a, b) { return b.date - a.date; });

      // { "sgv": "236", "trend": 4, "direction": "Flat", "datetime": 1554885503994, "bgdelta": 0, "battery": "77", "iob": "1.93", "bwp": "-0.57", "bwpo": 2.5 }

      e[0].bgdelta = 0;
      e[0].battery = 0;
      e[0].iob = 0;
      e[0].bwp = 0;
      e[0].bwpo = 0;

      const d = new Date();

      let container = {
         "status": [
            { "now": d.getTime() }],
         "bgs": e,
         "cals": []
      };

      return container;
   };


   NSEntries.postEntries = async function (fhirserver, userid, token, entries) {

      logger.info('Loading data from FHIR server ' + fhirserver); // + ' with patient id ' + userid);

      let operationOutcome = true;

      const options = {
         source: 'nightscout',
         target: 'fiphr',
         datatypehint: 'entries',
         FHIR_userid: userid // Needed for FHIR conversion
      };

      const records = await DataConverter.convert(entries, options);

      var FHIRClient = new _FHIRClient(fhirserver, { patient: userid, bearertoken: token, env });

      if (records.length > 0) {
         const uploadResults = await FHIRClient.createRecords(records);
         logger.info('Converted and uploaded records: ' + await JSON.stringify(uploadResults));
         if (uploadResults.errors != 0) {
            operationOutcome = false;
         }
      } else {
         logger.info('Skipping uploading');
         logger.info(JSON.stringify(records, null, 3));
      }
      return operationOutcome;
   };

   return NSEntries;
}

export default NSEntries;
