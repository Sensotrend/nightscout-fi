import { DataFormatConverter } from '../../DataFormatConverter';

/**
 * Class to convert Tidepool input data into intermediate Tidepool-like format
 */
export class TidepoolDataProcessor extends DataFormatConverter {

   constructor(logger) {
      super(logger);
   }

   convertRecordToIntermediate(r, options) {
      if (!r._converter) {
         r._converter = options.converter ? options.converter : 'Sensotrend Connect';
      }
      return r;
   }

   /**
    * Returns a Date object representing the record date
    * @param {Object} record Tidepool format record
    */
   getRecordTime(record) {
      return new Date(record.time);
   }

   convertIntermediateToTidepool(r) {
      return r;
   }

   // Convert records to intermediate format
   importRecords(input, options) {

      this.logger.info('IMPORTING INTERMEDIATE');

      const data = input.constructor == Array ? input : [input];

      let r = [];
      let skipped = 0;

      const conversionFunction = this.convertRecordToIntermediate;
      data.forEach(function (e) {
         const _e = conversionFunction(e, options);
         r.push(_e);
      });

      return r;
   }

   // Convert records to intermediate format
   exportRecords(input, options) {

      this.logger.info('EXPORTING INTERMEDIATE')

      const data = input.constructor == Array ? input : [input];

      const r = [];
      const conversionFunction = this.convertIntermediateToTidepool;
      data.forEach(function (e) {
         r.push(conversionFunction(e));
      });
      return r;
   }

}