const _ = require('lodash');
const moment = require('moment');
const Base64 = require('./base64');
const ST = require('stjs');

const FHIRTemplate = require('./FHIRTemplates');

const UUID_NAMESPACE = 'd040ecfe-2dd1-11e9-9178-f7b0f1a319bd';
const uuidv5 = require('uuid/v5');

module.exports.convertToFHIR = async function (sourceData, patientReference) {

   var data = sourceData;

   if (sourceData.constructor != Array) data = [sourceData];

   let convertedRecords = await Promise.all(data.map(async (record) => {
      return convertRecord(record, patientReference);
   }));

   return convertedRecords.filter(Boolean);
};

// Enrich the object with data needed by the templates
function enrichObject (sourceData, patientReference) {
   let entry = _.cloneDeep(sourceData);
   entry.patientId = patientReference;
   let id = entry.type + ':' + entry.patientId + ':' + entry.deviceId + ':' + entry.time;
   entry.guid = uuidv5(id, UUID_NAMESPACE);

   // TODO: Handle records with invalid date string
   entry.time_fhir = moment(sourceData.time).utcOffset(sourceData.timezoneOffset, true).format('YYYY-MM-DDTHH:mm:ssZ');

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

   var template = await FHIRTemplate.getTemplate(sourceData.type);
   if (!template) {
      console.error('ALERT! Record type ' + sourceData.type + ' not handled');
      return;
   }
   let data = enrichObject(sourceData, patientReference);
   return ST.transform(template, data);
}


module.exports.convertRecordFromFHIR = async function (sourceData, context) {

   var data = sourceData;

   if (sourceData.constructor != Array) data = [sourceData];

   let convertedRecords = await Promise.all(data.map(async (record) => {
      let r = record;
      if (r.resource) r = r.resource;
      return _convertRecordFromFHIR(r, context);
   }));

   return convertedRecords.filter(Boolean);
};

function enrichFHIRObject (sourceData) {

   let entry = _.cloneDeep(sourceData);

   if (sourceData.valueQuantity && sourceData.valueQuantity.unit) {
      if (sourceData.valueQuantity.unit == 'mmol/l') {
         entry._valuemgdl = (sourceData.valueQuantity.value * 18.0156).toFixed(0);
      }
   }

   if (sourceData.text && sourceData.text.div) {
      console.log(sourceData.text.div);
      let rx = /Device: (.*) \(via Sensotrend Connect\)/;
      var arr = rx.exec(sourceData.text.div);
      console.log('RES: ' + arr);
      if (arr) {
         entry.deviceId = arr[1];
      } else {
         entry.deviceId = 'Device Unknown';
      }
   }

   let d = new Date(sourceData.effectiveDateTime);
   entry._timestamp = d.getTime();

   return entry;

}

async function _convertRecordFromFHIR (sourceData, context) {

   // if (!sourceData.type || !sourceData.time || !sourceData.deviceId) { console.error('ALERT! Record type, time or device missing, cannot convert data'); return; }

   try {
      let code = sourceData.code.coding[0].code;
      let type = sourceData.resourceType;

      var template = await FHIRTemplate.getTemplate(type + code, context);

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
