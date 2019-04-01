import moment from 'moment';

// Class to convert Nightscout input data into intermediate Tidepool-like format

function NightscoutDataProcessor () {


   async function loadTemplate (objectType) {

      let filePath = path.resolve(__dirname, objectType + '.json');
      console.log('Loading template from: ', filePath);

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


   function convertNSRecordToIntermediate (record, options) {
      /*
    FROM
{"_id":"5c655105763fe276981ff0c2",
"device":"xDrip-DexcomG5",
"date":1550143850509,
"dateString":"2019-02-14T13:30:50.509+0200",
"sgv":177,
"delta":1.5,
"direction":"Flat",
"type":"sgv",
"filtered":195071.0394182456,
"unfiltered":196842.65552921052,
"rssi":100,
"noise":1,
"sysTime":"2019-02-14T13:30:50.509+0200"},

TO
[
    {"time":"2018-10-22T06:32:42.000Z",
    "timezoneOffset":120,
    "clockDriftOffset":0,
    "conversionOffset":0,
    "deviceTime":"2018-10-22T08:32:42",
    "deviceId":"DexG5MobRec_SM74021055",
    "type":"cbg",
    "value":127,
    "units":"mg/dL",
    "payload":{"trend":"Flat",
    "internalTime":"2018-10-22T15:32:43",
    "transmitterTimeSeconds":887679,
    "noiseMode":"Clean",
    "logIndices":[309454363]},
    "uploadId":"upid_5bd26e3593d8",
    "guid":"bb53c910-d03a-4fd6-b589-44260bd7c0d1"}
]*/

      let time = record.dateString ? moment.parseZone(record.dateString) : moment(record.date);
      let type = "";

      let e = {
         time: time.format('YYYY-MM-DDTHH:mm:ssZ')
         , timezoneOffset: time.utcOffset()
         , deviceId: record.device
         , guid: '<blank>'
      };

      switch (options.datatypehint) {

         case 'treatments':
            if (record.carbs && !isNaN(record.carbs)) {
               e.carbs = record.carbs;
               e.type = 'wizard';
            }
            if (record.insulin && !isNaN(record.insulin)) {
               e.insulin = record.insulin;
               e.type = 'wizard';
            }
            break;

         case 'entries':
            if (record.sgv) e.type = 'cbg';
            if (record.mbg) e.type = 'smbg';
            e.units = 'mg/dL';
            e.value = record.sgv ? Number(record.sgv) : Number(record.mbg);
            break;
      }

      if (e.type) {
         return e;
      } else {
         return false;
      }
   }

   function convertIntermediateToNS (e, options) {

      if (e.value && e.units) {
         if (e.units == 'mmol/l') {
            e._valuemgdl = (e.value * 18.0156).toFixed(0);
         }
      }

      const time = moment.parseZone(e.time);

      // TODO add timezoneoffset

      let _e;

      switch (e.type) {

         case "cbg":
            _e = {
               "_id": e.guid
               , "device": e.deviceId
               , "date": time.unix()
               , "dateString": time.toISOString()
               , "sgv": e._valuemgdl
               , "delta": 1000
               , "direction": "Flat"
               , "type": "sgv"
               , "noise": 1
               , "sysTime": time.toISOString()
            };
            break;

         case "smbg":
            _e = {
               "_id": e.guid
               , "device": e.deviceId
               , "date": time.unix()
               , "dateString": time.toISOString()
               , "sgv": e._valuemgdl
               , "delta": 1000
               , "direction": "Flat"
               , "type": "mbg"
               , "noise": 1
               , "sysTime": time.toISOString()
            };
            break;
         case "wizard":
         case "bolus":
            _e = {
               "_id": e.guid
               , "device": e.deviceId
               , "created_at": time.toISOString()
               , "type": "Meal Bolus"
            };

            if (e.carbInput) { _e.carbs = e.carbInput; }
            if (e.insulin) { _e.insulin = e.insulin; }

            break;

      }
      return _e;
   }




   // Convert records to intermediate format
   NightscoutDataProcessor.importRecords = function (input, options) {

      let r = [];
      input.forEach(function (e) {
         r.push(convertNSRecordToIntermediate(e, options));
      });

      return r;

   };

   // Convert records to intermediate format
   NightscoutDataProcessor.exportRecords = function (input, options) {

      let r = [];
      input.forEach(function (e) {
         r.push(convertIntermediateToNS(e, options));
      });
      return r;

   };

   return NightscoutDataProcessor;
}

export default NightscoutDataProcessor;
