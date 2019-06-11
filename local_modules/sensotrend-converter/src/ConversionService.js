/**
 * Data converter module
 */
export class ConversionService {

   #__sourceFormat;
   #__format;

   /**
    * @param {Logger} [logger] Optional, used for logging. If not provided, the Javascript
    * console will be used instead.
    */
   constructor(logger) {
      if (logger) {
         this.logger = logger;
      } else {
         this.logger = {};
         this.logger.error = console.error;
         this.logger.info = console.log;
         this.logger.debug = console.log;
      }
      this.supportedFormats = {};
      this.#__sourceFormat = Symbol('sourceFormat');
      this.#__format = Symbol('format');
      this.logger.info('New ConversionService instantiated');
   }

   log(message) {
      if (this.logger) this.logger.info(message);
   }

   error(message) {
      if (this.logger) this.logger.error(message);
   }

   /**
    * Used to register processors for data formats
    * @param {String} format Format identifier, for example `nightscout`
    * @param {DataFormatConverter} processor Data processor
    */
   registerFormatProcessor(format, processor) {
      this.log('Registerered format processor for ' + format);
      this.supportedFormats[format] = new processor(this.logger);
   };

   async importRecords(sourceData, options) {
      if (!options.source) {
         this.error('Trying to convert data without format spec');
         throw new Error('Trying to convert data without format spec');
      }

      let processor = this.supportedFormats[options.source];
      if (!processor) {
         this.error('No import processor found for format: ' + options.source);
         throw new Error('No import processor found for format: ' + options.source);
      }
      return processor.importRecords(sourceData, options);
   };

   async exportRecords(sourceData, options) {
      if (!options.target) {
         this.error('Trying to convert data without format spec');
         throw new Error('Trying to convert data without format spec');
      }

      let processor = this.supportedFormats[options.target];
      if (!processor) {
         this.error('No export processor found for format: ' + options.source);
         throw new Error('No export processor found for format: ' + options.source);
      }
      return processor.exportRecords(sourceData, options);
   };

   /**
    * @typedef {Object} DateFilter
    * @param {Object} sourceData array of device ID / date pairs
    */

   /**
    * Convert records 
    * @param {array} sourceData Source data to be converted
    * @param {Object} options Conversion options
    * @param {Object} options.source Source format for data ('nightscout', 'tidepool' or 'fiphr')
    * @param {Object} options.target Target format for data ('nightscout', 'tidepool' or 'fiphr')
    * @param {DateFilter} [options.skipRecordsUsingDates] Filtering instructions for skipping some records
    */
   async convert(sourceData, options) {

      let i = await this.importRecords(sourceData, options);

      // Filter records if requested
      if (options.skipRecordsUsingDates) {
         const filtered = [];
         let skipped = 0;

         i.forEach(function (r) {
            if (options.skipRecordsUsingDates[r.deviceId]) {
               const d = new Date(r.time);
               if (options.skipRecordsUsingDates[r.deviceId] <= d) {
                  filtered.push(r);
               } else {
                  skipped += 1;
               }
            }
         });
         i = filtered;
         if (skipped > 0) {
            this.logger.debug('Data converter skipped records: ' + skipped);
         }
      }

      const e = await this.exportRecords(i, options);

      // Store the original record format as a non-enumerable property
      const parent = this;
      e.forEach(function (record) {
         Object.defineProperty(record, parent.#__sourceFormat, {
            value: options.source,
            enumerable: false
         });
         Object.defineProperty(record, parent.#__format, {
            value: options.target,
            enumerable: false
         });
      });

      return e;
   };

   getRecordFormat(record) {
      return record[this.#__format];
   }

   getRecordSourceFormat(record) {
      return record[this.#__sourceFormat];
   }

   getRecordTime(record) {
      console.log('Record format is: ' + this.getRecordFormat(record));
      const processor = this.supportedFormats[this.getRecordFormat(record)];
      if (!processor) {
         this.error('No converter found for record, format ' + this.getRecordFormat(record));
         throw new Error('No converter found for record, format');
      }
      return processor.getRecordTime(record);
   }

}