import _ from 'lodash';
import moment from 'moment';
import ST from 'stjs';
import FHIRTemplate from './FHIRTemplates';
import NightscoutProcessor from './templates/nightscout';
import FIPHRProcessor from './templates/fiphr';
import uuidv5 from 'uuid/v5';

const UUID_NAMESPACE = 'd040ecfe-2dd1-11e9-9178-f7b0f1a319bd';

function DataFormatConverter () {
   
   const supportedFormats = {
      'nightscout': NightscoutProcessor(), 
      'fiphr' : FIPHRProcessor()
   };

   DataFormatConverter.importRecords = async function (sourceData, options) {

      if (!options.source) {
         console.log('Trying to convert data without format spec');
         return;
      }

      let processor = supportedFormats[options.source];
      if (!processor) return false;
      return processor.importRecords(sourceData, options);
   };

   DataFormatConverter.exportRecords = async function (sourceData, options) {

      let processor = supportedFormats[options.source];
      if (!processor) return false;
      return processor.exportRecords(sourceData, options);
   };

   DataFormatConverter.convert = async function (sourceData, options) {

      let inputProcessor = supportedFormats[options.source];
      let outputProcessor = supportedFormats[options.target];
      
      if (!inputProcessor || !outputProcessor ) return false;

      let e = await inputProcessor.importRecords(sourceData, options);

      console.log('Intermediate representation', e);

      let r =  outputProcessor.exportRecords(e, options);

      console.log('Output representation', r);

      return r;

   };

   return DataFormatConverter;
}

export default DataFormatConverter;
