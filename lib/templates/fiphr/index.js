import moment from 'moment';
import ST from 'stjs';
import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import uuidv5 from 'uuid/v5';
import { EventEmitter } from 'events';

const UUID_NAMESPACE = 'd040ecfe-2dd1-11e9-9178-f7b0f1a319bd';

// Class to convert FIPHR input data into intermediate Tidepool-like format & back

function FIPHRDataProcessor () {

   async function loadTemplate (objectType) {

      let filePath = path.resolve(__dirname, objectType + '.json');
      let template;

      try {
         const result = await fs.stat(filePath); // will fail if file does not exist
         if (await fs.exists(filePath)) {
            template = await fs.readFile(filePath, 'utf8');
         }
      } catch (error) {
         console.error('FHIR conversion error: template for object type "' + objectType + '" not found');
         return;
      }

      return JSON.parse(template);
   }

   function enrichFHIRObject (sourceData) {

      let entry = _.cloneDeep(sourceData);

      if (sourceData.valueQuantity && sourceData.valueQuantity.unit) {
         if (sourceData.valueQuantity.unit == 'mmol/l') {
            entry._valuemgdl = (sourceData.valueQuantity.value * 18.0156).toFixed(0);
         }
      }

      if (sourceData.text && sourceData.text.div) {
         var rx = /Laite: (.*) \(via Sensotrend Connect\)/;
         var arr = rx.exec(sourceData.text.div);
         if (!arr) {
            rx = /Device: (.*) \(via Sensotrend Connect\)/;
            arr = rx.exec(sourceData.text.div);
         }
         if (arr) {
            entry.deviceId = arr[1];
         } else {
            entry.deviceId = 'Device Unknown';
         }
      }

      const d = moment(sourceData.effectiveDateTime);
      entry._timestamp = d.valueOf();
      entry._timezoneOffset = d.utcOffset();
      entry._ISODate = d.toISOString(false);

      console.log("FHIR OBJECT DATE", sourceData.effectiveDateTime);
      console.log("OUTPUTTING", entry._timestamp);
      console.log("OUTPUTTING", entry._timezoneOffset);
      console.log("OUTPUTTING", entry._ISODate);

      return entry;
   }

   async function _convertRecordFromFHIR (sourceData, context) {

      try {

         let code;
         let type = sourceData.resourceType;

         if (sourceData.code) {
            code = sourceData.code.coding[0].code;
         }
         
         if (sourceData.medicationCodeableConcept) {
            code = sourceData.medicationCodeableConcept.coding[0].code;
         }
         
         // var template = await FHIRTemplate.getTemplate(type + code, context);

         var template = await loadTemplate('export_' + type + code);

         if (!template) {
            console.error('ALERT! Record type ' + sourceData.type + ' not handled');
            return;
         }
         let data = enrichFHIRObject(sourceData);

         return ST.transform(template, data);
      } catch (error) {
         console.log('Hit an issue converting data on context: ', context, JSON.stringify(sourceData, null, 2), error);
      }
   }

   // Convert records to intermediate format
   FIPHRDataProcessor.importRecords = async function (input, options) {

      const data = input.constructor == Array ? input : [input];

      let convertedRecords = await Promise.all(data.map(async (record) => {
         let r = record;
         if (r.resource) r = r.resource;
         return _convertRecordFromFHIR(r, options);
      }));

      console.log('FIPHR OUTPUTTING', convertedRecords);

      return convertedRecords.filter(Boolean);

   };

   // Enrich the object with data needed by the templates
   function enrichObject (sourceData, patientReference) {
      let entry = _.cloneDeep(sourceData);
      entry.patientId = patientReference;
      let id = entry.type + ':' + entry.patientId + ':' + entry.deviceId + ':' + entry.time;
      entry.guid = uuidv5(id, UUID_NAMESPACE);

      console.log('E TIME', sourceData.time);
      console.log('E timezoneOffset', sourceData.timezoneOffset);      

      // TODO: Handle records with invalid date string
      entry.time_fhir = moment(sourceData.time).utcOffset(sourceData.timezoneOffset).toISOString(true); //.format('YYYY-MM-DDTHH:mm:ssZ');

      console.log(moment(sourceData.time));
      console.log('entry.time_fhir', entry.time_fhir);

      // ensure records with a BG value have mmol values available
      if (entry.value && entry.units) {
         if (entry.units == 'mg/dL') {
            entry.valueMmol = Math.round((entry.value / 18.0156) * 100) / 100;
         } else {
            entry.valueMmol = entry.value;
         }
      }
      return entry;
   }

   async function convertRecord (sourceData, patientReference) {

      if (!sourceData.type || !sourceData.time || !sourceData.deviceId) {
         console.error('ALERT! Record type, time or device missing, cannot convert data');
         return;
      }

      var template = await loadTemplate('import_' + sourceData.type);
      if (!template) {
         console.error('ALERT! Record type ' + sourceData.type + ' not handled');
         return;
      }
      let data = enrichObject(sourceData, patientReference);
      return ST.transform(template, data);
   }

   // Convert records to FHIR format
   FIPHRDataProcessor.exportRecords = async function (input, options) {

      if (!options.FHIR_userid) {
         console.log('options.FHIR_userid needed for FHIR exporting');
         return false;
      }

      const data = input.constructor == Array ? input : [input];

      var d = [];

      data.map((record) => {
         if (record.type == 'wizard') {
            if (record.carbInput) {
               let entry = _.cloneDeep(record);
               entry.type = "carbs";
               d.push(entry);
            }
            if (record.insulin) {
               let entry = _.cloneDeep(record);
               entry.type = "bolus";
               d.push(entry);
            }
         } else {
            d.push(record);
         }
      });

      let convertedRecords = await Promise.all(d.map(async (record) => {
         return convertRecord(record, options.FHIR_userid);
      }));

      return convertedRecords.filter(Boolean);
   };

   return FIPHRDataProcessor;
}

export default FIPHRDataProcessor;
