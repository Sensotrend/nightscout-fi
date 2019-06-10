import _FHIRClient from '../FHIRClient';
import QueryBuilder from './queryBuilder';

function NSTreatments (env) {

   const logger = env.logger;
   const DataConverter = env.dataFormatConverter;

   NSTreatments.getTreatments = async function (fhirserver, userid, token, query) {

      // Treatments support "created_at" and "dateString" queries
      const { created_at, dateString } = query.find ? query.find : {};
      const dateQueryField = created_at ? created_at : dateString;
      let dateQuery = QueryBuilder.generateDateComponent(dateQueryField);
      logger.info('Query contains a date filter: ' + dateQuery);

      let count = 20;
      if (query.count && !isNaN(query.count)) { count = Math.min(query.count, 10000); }
      logger.info('Requesting up to ' + count + ' treatments');

      const FHIRClient = new _FHIRClient(fhirserver, { patient: userid, bearertoken: token, env });

      // carbs
      let s = {
         _count: count,
         _sort: 'date',
         patient: userid,
         code: '9059-7',
         date: dateQuery
      };

      const records = await FHIRClient.search('Observation', s);
      logger.info('Got Carb entries, count ' + records.total);

      if (records.total > 0) {
         records.entry.forEach(function (e) {
            logger.info('Result: ' + e.resource.resourceType + ' identifier ' + e.resource.identifier[0].value + ' ' + e.fullUrl);
         });
      }

      // short acting insulin
      s = {
         _count: count * 2,
         _sort: 'effective-time',
         patient: userid,
         code: 'ins-short-fast', // note FIPHR doesn't yet implement this code and will return all MedicationAdministration records for the patient
         "effective-time": dateQuery
      };

      const records2 = await FHIRClient.search('MedicationAdministration', s);
      logger.info('Got MedicationAdministration records, count ' + records2.total);

      if (records2.total > 0) {
         records2.entry.forEach(function (e) {
            logger.info('Result: ' + e.resource.resourceType + ' identifier ' + e.resource.identifier[0].value + ' ' + e.fullUrl);
         });
      }

      records.entry = (records.total) ? records.entry : [];
      records2.entry = (records2.total) ? records2.entry : [];

      const allRecords = records.entry.concat(records2.entry);

      const options = {
         source: 'fiphr',
         target: 'nightscout',
         datatypehint: 'treatments',
         FHIR_userid: userid // Needed for FHIR conversion
      };

      let r = await DataConverter.convert(allRecords, options);

      r.sort(function (a, b) { return b.date - a.date; });

      return r;
   };

   NSTreatments.postTreatments = async function (fhirserver, userid, token, treatments) {

      logger.info('Uploading treatment data to FHIR server ' + fhirserver); //  + ' with patient id ' + userid);

      const options = {
         source: 'nightscout',
         target: 'fiphr',
         datatypehint: 'treatments',
         FHIR_userid: userid // Needed for FHIR conversion
      };

      const records = await DataConverter.convert(treatments, options);

      const FHIRClient = new _FHIRClient(fhirserver, { patient: userid, bearertoken: token, env });

      if (records.length > 0) {
         const uploadResults = await FHIRClient.createRecords(records);
         logger.info('Converted and uploaded records: ' + await JSON.stringify(uploadResults));
      } else {
         logger.info('Skipping uploading');
      }
      return true;
   };

   return NSTreatments;
}

export default NSTreatments;
