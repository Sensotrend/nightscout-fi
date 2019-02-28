//var mkFhir = require('fhir.js');
var _ = require('lodash');
var Throttle = require('promise-parallel-throttle');

const Client = require('fhir-kit-client');

const _serverCapabilities = {
   'http://hapi.fhir.org/baseDstu3': {
      'If-None-Exist': true
   }
   , 'http://fhirsandbox.kanta.fi/phr-resourceserver/baseStu3': {}
};

function FHIRClient(URL, patient, bearertoken) {

   var _fhirClient;
   var _capabilities;
   var _patient;

   _patient = patient;

   console.log('Client Init on URL ' + URL + ' and patient ' + patient);

   _fhirClient = new Client({
      baseUrl: URL
   });

   if (bearertoken) _fhirClient.bearerToken = bearertoken;

   _capabilities = _serverCapabilities[URL];

   function isCapableOf(capability) {
      return _capabilities.hasOwnProperty(capability);
   }

   FHIRClient.getPatientId = async function(patientiIdentifier) {

      console.log('Querying for patient ' + patientiIdentifier);
      try {
         var results = await _fhirClient.search({
            resourceType: 'Patient'
            , searchParams: {
               'identifier': patientiIdentifier
            }
         });
         /*            
                     console.log('Got results ' + results);
                     console.log('Got results body ' + results.body);
                     console.log('Got results total ' + results.total);
                     console.log('Got results status ' + results.status);
                     
                     console.log('Got results ' + results.body.total);
         */
         if (results.body.total > 0) {
            return results.body.entry[0].resource.id;

            //console.log(results.data);
            //   console.log(results.entry[0].resource.id);

            //   if (results.data.total == 1) {
            //       return true;
            //   }
         }
      } catch (error) {
         // TODO: better error handling
         console.log(error);
         return false;
      }

      return false;
   };

   FHIRClient.loadPatient = async function(patientiID) {

      console.log('Querying for patient ' + patientiID);

      try {
         //            var results = await _fhirClient.search( {type: 'Patient', query: { 'identifier': patientiID }});
         let r = await _fhirClient.read({
            resourceType: 'Patient'
            , id: patientiID
         });
         return r.body;

         console.log('Patient query results: ' + JSON.stringify(results));

         if (results.data) {
            console.log('patient query results: ' + results.data);

            if (results.data.total == 1) {
               return results.data.entry[0];
            }
            // TODO: report error if multiple patients are found
         }
      } catch (error) {
         logOperationOutcome(error);
         //            console.log(error);
         return false;
      }

      return false;
   };

   function logOperationOutcome(outcome) {
      // ERROR
      if (outcome.status == 500) {
         const issue = (outcome.data && outcome.data.issue) ? outcome.data.issue[0] : {
            "diagnostics": "Unknwon error"
         };
         console.log('Operation failed with ' + outcome.status + " - " + issue.diagnostics);
      }
   }

   FHIRClient.getResultsOfType = async function(type, patientId) {
      var results = await _fhirClient.search({
         resourceType: type
         , searchParams: {
            _count: 10
            , _sort: date
            , patient: patientId
         }
      }); //compartment: { resourceType: 'Patient', id: patientId } });
      //console.log(results);
      return results;
   };

   FHIRClient.search = async function(type, searchparams) {
      var results = await _fhirClient.search({
         resourceType: type
         , searchParams: searchparams
      });
      return results;
   };

   FHIRClient.nextPage = async function(resultset) {
      return await _fhirClient.nextPage(resultset.body);
   };

   async function upload(record, uploadResults) {

      let id = record.identifier[0].value.split(':')[2];
      let header = "identifier=" + record.identifier[0].value;

      console.log('Uploading, ' + header);

      try {
         var results = await _fhirClient.create({
            resourceType: record.resourceType
            , body: record
            , headers: {
               'If-None-Exist': header
               , 'Prefer': 'return=representation'
            }
         });
         //console.log('GOT RESULTS: ' + results);

         //if (results.resourceType == record.resourceType) {
         if (results.status == 201) {
            //    console.log('Record type ' + results.resourceType + ' id ' + results.id + ' created');
            if (results.location) {
               console.log('Record created: ' + results.location);
            }
            uploadResults.created += 1;
            uploadResults.records.push(results);
         }
         if (results.status == 200) {
            uploadResults.skipped += 1;
         }

      } catch (error) {
         uploadResults.errors += 1;
         uploadResults.error = error;

         console.log("ERROR CREATING RECORD: " + JSON.stringify(error));
      }
   }


   FHIRClient.createRecords = async function(records) {

      var r = records;

      if (!records instanceof Array) {
         r = [records];
      }

      var uploadResults = {
         created: 0
         , skipped: 0
         , errors: 0
         , records: []
      };
      const queue = records.map(record => () => upload(record, uploadResults));
      let res = await Throttle.all(queue);

      return uploadResults;

   };







   // Creates records, skips creation if one exists
   FHIRClient.createRecordsx = async function(records) {

      var r = records;

      if (!records instanceof Array) {
         r = [records];
      }

      var uploadResults = {
         created: 0
         , skipped: 0
         , errors: 0
         , records: []
      };

      const queue = records.map(record => () => doReq(user.firstName, user.lastName));

      await Throttle.all(
         r.map(async (record) => {

            /*            // Server doesn't support If-None-Exist
                        if (!isCapableOf('If-None-Exist')) {
                            try {
                                var results = await _fhirClient.search( {type: record.resourceType, query: {'identifier': record.identifier[0].value }});
                                console.log('resulls');
                            }
                            catch (error) {
                                console.log('Error querying for duplicate Entry of record type ' + record.resourceType + ' with ID ' + record.identifier[0].value);
                            }

                        }
                        */

            let id = record.identifier[0].value.split(':')[2];
            let header = "identifier=" + record.identifier[0].value;

            console.log('UPLOADING: ' + record);

            try {
               var results = await _fhirClient.create({
                  resourceType: record.resourceType
                  , body: record
                  , headers: {
                     'If-None-Exist': header
                     , 'Prefer': 'return=representation'
                  }
               });
               console.log('GOT RESULTS: ' + results);

               //if (results.resourceType == record.resourceType) {
               if (results.status == 201) {
                  console.log('Record type ' + results.resourceType + ' id ' + results.id + ' created');
                  uploadResults.created += 1;
                  uploadResults.records.push(results);
               }
               if (results.status == 200) {
                  uploadResults.skipped += 1;
               }

            } catch (error) {
               uploadResults.errors += 1;
               uploadResults.error = error;

               console.log("ERROR CREATING RECORD: " + JSON.stringify(error));
            }
         }));

      return uploadResults;

   };


   FHIRClient.getObservations = async function(patientId) {

      var pid = patient;
      if (!patientId) {
         pid = _patient
      };

      console.log('Querying for treatments');

      var results = await _fhirClient.search({
         resourceType: 'Observation'
         , compartment: {
            resourceType: 'Patient'
            , id: pid
         }
      });
      console.log(results);

      if (results.data) {
         return results.data;
      }
   };

   //   console.log(results);


   /*
   _fhirClient.search( {type: 'Patient', query: { 'identifier': patientiID }})
   .then(function(res){
       console.log("Results: ", res);
       var bundle = res.data;
       //var count = (bundle.entry && bundle.entry.length) || 0;

       if (data.total > 0) return(true);
           else return(false);
   })
   .catch(function(res){
       console.log("ERROR: ", res);
       reject(res);
   });
   */

   return FHIRClient;
}

module.exports = FHIRClient;