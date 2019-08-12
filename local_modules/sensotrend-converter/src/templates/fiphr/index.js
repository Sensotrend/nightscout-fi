import moment from 'moment';
import ST from 'stjs';
import _ from 'lodash';
import uuidv5 from 'uuid/v5';
import { DataFormatConverter} from '../../DataFormatConverter';

const UUID_NAMESPACE = 'd040ecfe-2dd1-11e9-9178-f7b0f1a319bd';

const descriptionIllegalStrings = [
   ' (via Sensotrend Connect)',
   ' (via Nightscout Connect)'
];

/**
 * Class to convert FIPHR input data into intermediate Tidepool-like format & back
 */
export class FIPHRDataProcessor extends DataFormatConverter {

   constructor(logger) {
      super(logger);
   }

   /**
    * Returns a Date object representing the record date
    * @param {Object} record Tidepool format record
    */
   getRecordTime(record) {
      return new Date(record.effectiveDateTime);
   };

   templatePath() {
      return __dirname;
   }

   enrichFHIRObject(sourceData) {

      let entry = sourceData; //_.cloneDeep(sourceData);

      if (sourceData.valueQuantity && sourceData.valueQuantity.unit) {
         if (sourceData.valueQuantity.unit == 'mmol/l') {
            entry._valuemgdl = (sourceData.valueQuantity.value * 18.0156).toFixed(0);
         }
      }

      entry.deviceId = 'Device Unknown';

      if (sourceData.text && sourceData.text.div) {

         let desc = sourceData.text.div;

         descriptionIllegalStrings.forEach(function (s) {
            desc.replace(s, '');
         });

         const split = desc.replace('</div>', '').replace(/<br\s*\/>/g, '|||').split('|||');

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

   async _convertRecordFromFHIR(sourceData, context) {

      if (!sourceData.resourceType) {
         return false;
      }
      
      try {

         let code;
         let type = sourceData.resourceType;

         if (sourceData.code) {
            code = sourceData.code.coding[0].code;
         }

         if (sourceData.medicationCodeableConcept) {
            code = sourceData.medicationCodeableConcept.coding[0].code;
         }

         var template = await this.loadTemplate('export_' + type + code);

         if (!template) {
            this.logger.error('ALERT! Record type ' + sourceData.type + ' not handled');
            return;
         }
         let data = this.enrichFHIRObject(sourceData);

         return ST.transform(template, data);
      } catch (error) {
         this.logger.info('Problem converting data on context: ' + context + ' ' + JSON.stringify(sourceData, null, 2) + ' ' + error);
      }
   }

   // Convert records to intermediate format
   async importRecords(input, options) {

      const data = input.constructor == Array ? input : [input];

      let convertedRecords = await Promise.all(data.map(async (record) => {
         let r = record;
         if (r.resource) r = r.resource;
         return this._convertRecordFromFHIR(r, options);
      }));

      return convertedRecords.filter(Boolean);

   };

   // Enrich the object with data needed by the templates
   enrichObject(sourceData, patientReference) {
      let entry = sourceData; //_.cloneDeep(sourceData);

      entry.patientId = patientReference;
      const time = moment(sourceData.time).utcOffset(sourceData.timezoneOffset);
      entry.time_fhir = time.toISOString(true);

      let id = entry.type + ':' + entry.patientId + ':' + entry.deviceId + ':' + entry.time_fhir;

      if (entry.value) {
         id = id + ':' + entry.value; // It is possible for a device to have multuple records with the same timestamp
      }

      entry.guid = uuidv5(id, UUID_NAMESPACE);

      // TODO: Handle records with invalid date string

      if (sourceData.normal) {
         entry.insulin = sourceData.normal;
      }

      const textArray = [];

      entry.formattedDate = time.format('D.M.YYYY H:mm:ss');
      textArray.push("Aika: " + entry.formattedDate);
      textArray.push("Laite: " + entry.deviceId + ' (via ' + entry._converter + ')');

      // ensure records with a BG value have mmol values available
      if (entry.value && entry.units) {
         if (entry.units == 'mg/dL') {
            entry.valueMmol = Math.round((entry.value / 18.0156) * 100) / 100;
            textArray.push("Tulos: " + (entry.valueMmol ? entry.valueMmol.toFixed(2) : "?") + " mmol/l");
            /*
            if (entry.delta) {
               entry.deltaMmol = Math.round((entry.delta / 18.0156) * 100) / 100;
               textArray.push("Muutos: " + (entry.deltaMmol ? entry.deltaMmol.toFixed(2) : "?") + " mmol/l");
            }
            */
         } else {
            entry.valueMmol = entry.value;
            textArray.push("Tulos: " + (entry.valueMmol ? entry.valueMmol.toFixed(1) : "?") + " mmol/l");
            /*
            if (entry.delta) {
               entry.deltaMmol = entry.delta;
               textArray.push("Muutos: " + (entry.deltaMmol ? entry.deltaMmol.toFixed(2) : "?") + " mmol/l");
            }
            */
         }
      }
      /*
      if (entry.direction) {
         textArray.push("Suunta: " + entry.direction);
      }

      if (entry.noise) {
         textArray.push("Mittauslaatu: " + entry.noise);
      }
      */

      entry._statusMessage = textArray.join('<br />');

      return entry;
   }

   async convertRecord(sourceData, patientReference) {

      if (!sourceData.type || !sourceData.time || !sourceData.deviceId) {
         this.logger.error('ALERT! Record type, time or device missing, cannot convert data');
         return;
      }

      var template = await this.loadTemplate('import_' + sourceData.type);
      if (!template) {
         this.logger.error('ALERT! Record type ' + sourceData.type + ' not handled');
         return;
      }
      let data = this.enrichObject(sourceData, patientReference);
      return ST.transform(template, data);
   }

   // Convert records to FHIR format
   async exportRecords(input, options) {

      if (!options.FHIR_userid) {
         this.logger.info('options.FHIR_userid needed for FHIR exporting');
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
         return this.convertRecord(record, options.FHIR_userid);
      }));

      return convertedRecords.filter(Boolean);
   };
}