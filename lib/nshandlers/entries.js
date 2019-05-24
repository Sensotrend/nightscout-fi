import _FHIRClient from '../FHIRClient';
import _DataConverter from '../DataFormatConverter';

function NSEntries (env) {
   const logger = env.logger;
   
   const DataConverter = _DataConverter(env);

   NSEntries.getEntries = async function (fhirserver, userid, token, query) {

      let dateQuery = [];

      function getDateString (d) {
         const _d = new Date(Number(d));
         return _d.toISOString().replace(/T.+/, '');
      }

      if (query.find) {
         if (query.find.date) {
            const d = query.find.date;
            if (d["$eq"]) {
               dateQuery.push("eq" + getDateString(d["$eq"]));
            }
            if (d["$gt"]) {
               dateQuery.push("gt" + getDateString(d["$gt"]));
            }
            if (d["$lt"]) {
               dateQuery.push("lt" + getDateString(d["$lt"]));
            }
            if (d["$gte"]) {
               dateQuery.push("ge" + getDateString(d["$gte"]));
            }
            if (d["$lte"]) {
               dateQuery.push("le" + getDateString(d["$lte"]));
            }
         }
      }

      let count = 20;
      if (query.count && !isNaN(query.count)) { count = Math.min(query.count, 10000); }
      logger.info('Requesting up to ' + count + ' entries');

      const FHIRClient = new _FHIRClient(fhirserver, { patient: userid, bearertoken: token, env});

      let s = {
         _count: count,
         _sort: 'date',
         patient: userid,
         code: '14743-9'
      };

      if (dateQuery.length != 0) { s.date = dateQuery; }

      const records = await FHIRClient.search('Observation', s);
      logger.info('Got Glucometer entries, count ' + records.total);

      s = {
         _count: count,
         _sort: 'date',
         patient: userid,
         code: '14745-4'
      };

      if (dateQuery.length != 0) { s.date = dateQuery; }

      const records2 = await FHIRClient.search('Observation', s);
      logger.info('Got CGM entries, count ' + records2.total);

      records.entry = (records.total > 0) ? records.entry : [];
      records2.entry = (records2.total) ? records2.entry : [];

      const allRecords = records.entry.concat(records2.entry);

      const options = {
         source: 'fiphr',
         target: 'nightscout',
         datatypehint: 'entries',
         FHIR_userid: userid // Needed for FHIR conversion
      };

      let r = await DataConverter.convert(allRecords, options);

      r.sort(function (a, b) { return b.date - a.date;  });

      return r;
   };

   NSEntries.getPebble = async function (fhirserver, userid, token, query) {

      logger.info('/pebble');

      let e = await NSEntries.getEntries(fhirserver, userid, token, query);

      e.forEach(element => {
         element.datetime = element.date;
      });

      e.sort(function (a, b) { return b.date - a.date; });

      // { "sgv": "236", "trend": 4, "direction": "Flat", "datetime": 1554885503994, "bgdelta": 0, "battery": "77", "iob": "1.93", "bwp": "-0.57", "bwpo": 2.5 }

      e[0].bgdelta = 0;
      e[0].battery = 0;
      e[0].iob = 0;
      e[0].bwp = 0;
      e[0].bwpo = 0;

      const d = new Date();

      let container = {
         "status": [
            { "now": d.getTime() }],
         "bgs": e,
         "cals": []
      };

      return container;
   };


   NSEntries.postEntries = async function (fhirserver, userid, token, entries) {

      logger.info('Loading data from FHIR server ' + fhirserver); // + ' with patient id ' + userid);

      let operationOutcome = true;

      const options = {
         source: 'nightscout',
         target: 'fiphr',
         datatypehint: 'entries',
         FHIR_userid: userid // Needed for FHIR conversion
      };

      const records = await DataConverter.convert(entries, options);

      var FHIRClient = new _FHIRClient(fhirserver, { patient: userid, bearertoken: token, env});

      if (records.length > 0) {
         const uploadResults = await FHIRClient.createRecords(records);
         logger.info('Converted and uploaded records: ' + await JSON.stringify(uploadResults));
         if (uploadResults.errors != 0) {
            operationOutcome = false;
         }
      } else {
         logger.info('Skipping uploading');
         logger.info(JSON.stringify(records, null, 3));
      }
      return operationOutcome;
   };

   return NSEntries;
}

export default NSEntries;
