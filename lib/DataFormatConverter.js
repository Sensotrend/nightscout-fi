import _ from 'lodash';
import NightscoutProcessor from './templates/nightscout';
import FIPHRProcessor from './templates/fiphr';
import TidepoolProcessor from './templates/tidepool';

function DataFormatConverter (env) {

   const logger = env.logger;
   
   const supportedFormats = {
      'nightscout': NightscoutProcessor(env), 
      'fiphr' : FIPHRProcessor(env),
      'tidepool': TidepoolProcessor(env)
   };

   DataFormatConverter.importRecords = async function (sourceData, options) {

      if (!options.source) {
         logger.error('Trying to convert data without format spec');
         return;
      }

      let processor = supportedFormats[options.source];
      if (!processor) return false;
      return processor.importRecords(sourceData, options);
   };

   DataFormatConverter.exportRecords = async function (sourceData, options) {

      if (!options.target) {
         logger.error('Trying to convert data without format spec');
         return;
      }

      let processor = supportedFormats[options.target];
      if (!processor) return false;
      return processor.exportRecords(sourceData, options);
   };

   DataFormatConverter.convert = async function (sourceData, options) {

      const i = await DataFormatConverter.importRecords(sourceData, options);
      return DataFormatConverter.exportRecords(i, options);

   };

   return DataFormatConverter;
}

export default DataFormatConverter;
