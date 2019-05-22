import moment from 'moment';
import ST from 'stjs';
import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import uuidv5 from 'uuid/v5';
import NodeCache from 'node-cache';

const cache = new NodeCache();

const UUID_NAMESPACE = 'd040ecfe-2dd1-11e9-9178-f7b0f1a319bd';

const descriptionIllegalStrings = [
   ' (via Sensotrend Connect)',
   ' (via Nightscout Connect)'
];

// Class to convert FIPHR input data into intermediate Tidepool-like format & back

function FIPHRDataProcessor () {

   async function loadTemplate (objectType) {

      const cached = cache.get(objectType);
      if (cached) {
         return cached;
      }

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

      const parsed = JSON.parse(template);
      cache.set(objectType, parsed);

      return parsed;
   }

   function enrichFHIRObject (sourceData) {

      let entry = sourceData; //_.cloneDeep(sourceData);

      if (sourceData.valueQuantity && sourceData.valueQuantity.unit) {
         if (sourceData.valueQuantity.unit == 'mmol/l') {
            entry._valuemgdl = (sourceData.valueQuantity.value * 18.0156).toFixed(0);
         }
      }

      entry.deviceId = 'Device Unknown';

      if (sourceData.text && sourceData.text.div) {

         let desc = sourceData.text.div;

         descriptionIllegalStrings.forEach(function(s){
            desc.replace(s,'');
         });

         const split = sourceData.text.div.replace('</div>', '').replace(/<br\s*\/>/g,'|||').split('|||');

         split.forEach(function (e) {
            const keyValue = e.split(': ');
            switch (keyValue[0]) {
               case "Laite":
               case "Device":
                  entry.deviceId = keyValue[1].replace(' (via Sensotrend Connect)', '').replace(' (via Nightscout Connect)', '');
                  break;
               case "Muutos":
                  const deltaSplit = keyValue[1].split(' ');
                  const delta = Number(deltaSplit[0]);
                  const units = deltaSplit[1];
                  entry._deltammol = delta;
                  break;
               case "Suunta":
                  entry.direction = keyValue[1];
                  break;
               case "Mittauslaatu":
                  entry.noise = Number(keyValue[1]);
                  break;
            }
         });
      }

      const d = moment.parseZone(sourceData.effectiveDateTime);
      entry._timestamp = d.valueOf();
      entry._timezoneOffset = d.utcOffset();
      entry._ISODate = d.toISOString(false);

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

      return convertedRecords.filter(Boolean);

   };

   // Enrich the object with data needed by the templates
   function enrichObject (sourceData, patientReference) {
      let entry = sourceData; //_.cloneDeep(sourceData);
      
      entry.patientId = patientReference;
      entry.time_fhir = moment(sourceData.time).utcOffset(sourceData.timezoneOffset).toISOString(true);

      let id = entry.type + ':' + entry.patientId + ':' + entry.deviceId + ':' + entry.time_fhir;

      if (entry.value) {
         id = id + ':' + entry.value; // It is possible for a device to have multuple records with the same timestamp
      }

      entry.guid = uuidv5(id, UUID_NAMESPACE);

      // TODO: Handle records with invalid date string

      if (sourceData.normal) { entry.insulin = sourceData.normal; }

      const textArray = [];

      textArray.push("Aika: " + entry.time_fhir);
      textArray.push("Laite: " + entry.deviceId + ' (via '+ entry._converter +')');

      // ensure records with a BG value have mmol values available
      if (entry.value && entry.units) {
         if (entry.units == 'mg/dL') {
            entry.valueMmol = Math.round((entry.value / 18.0156) * 100) / 100;
            textArray.push("Tulos: " + entry.valueMmol + " mmol/l");

            if (entry.delta) {
               entry.deltaMmol = Math.round((entry.delta / 18.0156) * 100) / 100;
               textArray.push("Muutos: " + entry.deltaMmol + " mmol/l");
            }
         } else {
            entry.valueMmol = entry.value;
            textArray.push("Tulos: " + entry.valueMmol) + " mmol/l";

            if (entry.delta) {
               entry.deltaMmol = entry.delta;
               textArray.push("Muutos: " + entry.deltaMmol + " mmol/l");
            }
         }
      }

      if (entry.direction) {
         textArray.push("Suunta: " + entry.direction);
      }

      if (entry.noise) {
         textArray.push("Mittauslaatu: " + entry.noise);
      }

      entry._statusMessage = textArray.join('<br />');

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
            if (record.normal) {
               let entry = _.cloneDeep(record);
               entry.type = "bolus";
               d.push(entry);
            }
            if (record.bolus) {
               if (record.bolus.type) {
                  let entry = _.cloneDeep(record.bolus);
                  d.push(entry);
               }
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
