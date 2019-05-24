// Class to convert Tidepool input data into intermediate Tidepool-like format

function TidepoolDataProcessor (env) {

   const logger = env.logger;

   function convertRecordToIntermediate (r, options) {

      if (!r._converter) {
         r._converter = options.converter ? options.converter : 'Sensotrend Connect';
      }
      
      if (options.skipRecordsUsingDates) {
         if (options.skipRecordsUsingDates[r.deviceId]) {
            const d = new Date(r.time);
            if (options.skipRecordsUsingDates[r.deviceId] >= d) {
               // Skip this record as we've seen newer data for this device
               return false;
            }
         }
      }
      return r;
   }

   function convertIntermediateToTidepool (r) {
      return r;
   }

   // Convert records to intermediate format
   TidepoolDataProcessor.importRecords = function (input, options) {

      logger.info('IMPORTING INTERMEDIATE');

      const data = input.constructor == Array ? input : [input];

      let r = [];
      let skipped = 0;

      data.forEach(function (e) {
         const _e = convertRecordToIntermediate(e, options);
         if (_e) {
            r.push(_e);
         } else {
            skipped += 1;
         }
      });

      if (skipped > 0) {
         logger.info('Data converter skipped records: ' + skipped);
      }
      return r;

   };

   // Convert records to intermediate format
   TidepoolDataProcessor.exportRecords = function (input, options) {

      logger.info('EXPORTING INTERMEDIATE')

      const data = input.constructor == Array ? input : [input];

      let r = [];
      data.forEach(function (e) {
         r.push(convertIntermediateToTidepool(e));
      });
      return r;

   };

   return TidepoolDataProcessor;
}

export default TidepoolDataProcessor;
