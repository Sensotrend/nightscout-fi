const moment = require('moment');
var TidepoolConverter = require('../TidepoolToFHIR');

function NSEntries () {

   NSEntries.getEntries = async function (fhirserver, userid, token) {

      var FHIRClient = new(require('../FHIRClient'))(fhirserver, userid, token);

      let s = {
         _count: 10
         , _sort: 'date'
         , patient: userid
         , code: '14743-9'
      };

      var records = await FHIRClient.search('Observation', s);
      console.log('Got Glucometer entries, count ' + records.body.total);

      s = {
         _count: 10
         , _sort: 'date'
         , patient: userid
         , code: '14745-4'
      };

      var records2 = await FHIRClient.search('Observation', s);
      console.log('Got CGM entries, count ' + records2.body.total);

      records.body.entry = (records.body.total > 0) ? records.body.entry : [];
      records2.body.entry = (records2.body.total) ? records2.body.entry : [];

      let allRecords = records.body.entry.concat(records2.body.entry);

      var nsRecords = [];

      if (allRecords.length > 0) {
         nsRecords = await TidepoolConverter.convertRecordFromFHIR(allRecords, 'nightscout');
      }

      return nsRecords;
   };


   function convertNSRecordToTidepool (record) {
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

      return {
         time: time.format('YYYY-MM-DDTHH:mm:ssZ')
         , timezoneOffset: time.utcOffset()
         , deviceId: record.device
         , value: record.sgv ? Number(record.sgv) : Number(record.mbg)
         , type: record.sgv ? "cbg" : "smbg"
         , units: 'mg/dL'
         , guid: '<blank>'
      };
   }

   NSEntries.postEntries = async function (fhirserver, userid, token, entries) {

      console.log('Loading data from FHIR server ' + fhirserver + ' with patient id ' + userid);

      var FHIRClient = new(require('../FHIRClient'))(fhirserver, userid, token);

      let r = [];
      entries.forEach(function (e) {
         r.push(convertNSRecordToTidepool(e));
      });

      var records = await TidepoolConverter.convertToFHIR(r, userid);

      if (records.length > 0) {
         console.log('Uploading', records);
         var uploadResults = await FHIRClient.createRecords(records);
         console.log('Converted and uploaded records: ' + await JSON.stringify(uploadResults));
      } else {
         console.log('Skipping uploading');
         console.log(JSON.stringify(records, null, 3));
      }
      return true;
   };



   return NSEntries;
}

module.exports = NSEntries;
