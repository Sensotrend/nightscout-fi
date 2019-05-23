const _ = require('lodash');
const Throttle = require('promise-parallel-throttle');

const Client = require('fhir-kit-client');

function FHIRClient (URL, patient, bearertoken, env) {

   const _patient = patient;

   console.log('Client Init on URL ' + URL + ' and patient ' + patient);

   let options = { baseUrl: URL };

   if (env && env.https_certificate) {
      options.cert = env.https_certificate;
      options.key = env.https_privateKey;
   }

   const _fhirClient = new Client(options);

   if (bearertoken) _fhirClient.bearerToken = bearertoken;

   FHIRClient.getPatientId = async function (patientiIdentifier) {

      console.log('Querying for patient ' + patientiIdentifier);
      try {
         var results = await _fhirClient.search({
            resourceType: 'Patient',
            searchParams: {
               'identifier': patientiIdentifier
            }
         });

         if (results.body.total > 0) {
            return results.body.entry[0].resource.id;
         }
      } catch (error) {
         // TODO: better error handling
         console.log(error);
         return false;
      }

      return false;
   };

   FHIRClient.loadPatient = async function (patientiID) {

      console.log('Querying for patient ' + patientiID);

      try {
         let r = await _fhirClient.read({
            resourceType: 'Patient',
            id: patientiID
         });
         return r.body;

      } catch (error) {
         logOperationOutcome(error);
         return false;
      }

      return false;
   };

   function logOperationOutcome (outcome) {
      // ERROR
      if (outcome.status == 500) {
         const issue = (outcome.data && outcome.data.issue) ? outcome.data.issue[0] : {
            "diagnostics": "Unknwon error"
         };
         console.log('Operation failed with ' + outcome.status + " - " + issue.diagnostics);
      }
   }

   FHIRClient.getResultsOfType = async function (type, patientId) {
      var results = await _fhirClient.search({
         resourceType: type,
         searchParams: {
            _count: 20,
            _sort: date,
            patient: patientId
         }
      }); //compartment: { resourceType: 'Patient', id: patientId } });
      //console.log(results);
      return results;
   };

   FHIRClient.search = async function (type, searchparams) {
      var results = await _fhirClient.search({
         resourceType: type,
         searchParams: searchparams
      });
      return results;
   };

   FHIRClient.nextPage = async function (resultset) {
      return await _fhirClient.nextPage(resultset.body);
   };

   function getDeviceIdFromRecord (record) {

      // TODO: This should implement pulling the data from the device info

      let device = false;

      if (record.text && record.text.div) {
         const split = record.text.div.replace('</div>', '').replace(/<br\s*\/>/g,'|||').split('|||');

         split.forEach(function (e) {
            const keyValue = e.split(': ');
            switch (keyValue[0]) {
               case "Laite":
               case "Device":
                  device = keyValue[1].replace(' (via Sensotrend Connect)', '');
            }
         });
      }
      return device;
   }

   async function upload (record, uploadResults) {

      let id = record.identifier[0].value.split(':')[2];
      let header = "identifier=" + record.identifier[0].value;

      console.log('Uploading', header);

      try {
         var results = await _fhirClient.create({
            resourceType: record.resourceType,
            body: record,
            headers: {
               'If-None-Exist': header,
               'Prefer': 'return=representation'
            }
         });

         if (results.status == 201) {
            if (results.location) {
               console.log('Record created', results.location);
            }
            uploadResults.created += 1;
            uploadResults.records.push(results.body);

         }
         if (results.status == 200) {
            uploadResults.skipped += 1;
            console.log('Record skipped as duplicate');
         }

         if (results.status == 200 || results.status == 201) {

            const deviceID = getDeviceIdFromRecord(record);
            console.log('Checking upload date for device', deviceID);

            if (deviceID) {

               const d = new Date(record.effectiveDateTime);

               if (uploadResults.latestDates[deviceID]) {
                  if (d > uploadResults.latestDates[deviceID]) {
                     uploadResults.latestDates[deviceID] = d;
                  }
               } else {
                  uploadResults.latestDates[deviceID] = d;
               }
            }
         }

      } catch (error) {
         uploadResults.errors += 1;
         uploadResults.error = error;
         console.log("ERROR CREATING RECORD", error);
      }
   }

   FHIRClient.createRecords = async function (records) {

      records = records instanceof Array ? records : [records];

      var uploadResults = {
         created: 0,
         skipped: 0,
         errors: 0,
         records: [],
         latestDates: {}
      };
      const queue = records.map(record => () => upload(record, uploadResults));
      let res = await Throttle.all(queue);

      return uploadResults;

   };

   FHIRClient.getObservations = async function (patientId) {

      var pid = patient;
      if (!patientId) {
         pid = _patient
      };

      console.log('Querying for treatments');

      var results = await _fhirClient.search({
         resourceType: 'Observation',
         compartment: {
            resourceType: 'Patient',
            id: pid
         }
      });
      // console.log(results);

      if (results.data) {
         return results.data;
      }
   };

   return FHIRClient;
}

module.exports = FHIRClient;
