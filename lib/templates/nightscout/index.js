import moment from 'moment';

// Class to convert Nightscout input data into intermediate Tidepool-like format

function NightscoutDataProcessor () {

   function convertNSRecordToIntermediate (record, options) {

      var time;

      if (record.created_at) {
         time = moment.parseZone(record.created_at);
      } else {
         time = record.dateString ? moment.parseZone(record.dateString) : moment(record.date);
      }

      let type = "";

      let e = {
         time: time.toISOString() // format('YYYY-MM-DDTHH:mm:ssZ')
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
            e._valuemgdl = Math.round(e.value * 18.0156);
         } else {
            e._valuemgdl = e.value;
         }
      }

      const time = moment(e.time).utcOffset(e.timezoneOffset, true);
      const timeString = time.format('YYYY-MM-DDTHH:mm:ssZ');

      let _e;

      switch (e.type) {

         case "cbg":
            _e = {
               "_id": e.guid
               , "device": e.deviceId
               , "date": time.valueOf()
               , "dateString": timeString
               , "sgv": e._valuemgdl
               , "delta": 1000
               , "direction": "Flat"
               , "type": "sgv"
               , "noise": 1
               , "sysTime": timeString
            };
            break;
         case "smbg":
            _e = {
               "_id": e.guid
               , "device": e.deviceId
               , "date": time.valueOf()
               , "dateString": timeString
               , "sgv": e._valuemgdl
               , "delta": 1000
               , "direction": "Flat"
               , "type": "mbg"
               , "noise": 1
               , "sysTime": timeString
            };
            break;
         case "wizard":
         case "bolus":
            _e = {
               "_id": e.guid
               , "device": e.deviceId
               , "created_at": timeString
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
