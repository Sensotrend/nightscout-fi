import _ from 'lodash';
import NightscoutProcessor from './templates/nightscout';
import FIPHRProcessor from './templates/fiphr';
import TidepoolProcessor from './templates/tidepool';
import { performance } from 'perf_hooks';

function DataFormatConverter () {
   
   const supportedFormats = {
      'nightscout': NightscoutProcessor(), 
      'fiphr' : FIPHRProcessor(),
      'tidepool': TidepoolProcessor()
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

      var t0 = performance.now();

      let inputProcessor = supportedFormats[options.source];
      let outputProcessor = supportedFormats[options.target];
      
      if (!inputProcessor || !outputProcessor ) return false;

      var t1 = performance.now();

      let e = await inputProcessor.importRecords(sourceData, options);

      //console.log('Intermediate representation', e);
      var t2 = performance.now();

      let r =  outputProcessor.exportRecords(e, options);

      //console.log('Output representation', r);

      var t3 = performance.now();

      console.log("Instantiating converters took " + (t1 - t0) + " milliseconds.");
      console.log("Converting to intermediate took " + (t2 - t1) + " milliseconds.");
      console.log("Converting to target took " + (t3 - t2) + " milliseconds.");

      return r;

   };

   return DataFormatConverter;
}

export default DataFormatConverter;
