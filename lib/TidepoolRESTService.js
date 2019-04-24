import bodyParser from 'body-parser';
import express from 'express';
import { decorateApp } from '@awaitjs/express';
import basicAuthParser from 'basic-auth';

import fs from 'fs'; //).promises;
const fsp = fs.promises;

import jwt from 'jsonwebtoken';

import ProfileModel from './models/tidepooluserprofile.model.js';
import UploaderDataset from './models/tidepooluploaderdataset.model.js';

import _DataConverter from './DataFormatConverter';
const DataFormatConverter = _DataConverter();

const SESSION_TOKEN_HEADER = 'x-tidepool-session-token';
const JWT_SECRET = 'ThisIsARandomString';

function TidepoolRESTService (runtimeEnv) {

   const env = runtimeEnv;

   const TidepoolRESTService = decorateApp(express());

   // JWT session validation

   const sessionValidationRoute = express.Router();

   // route middleware to verify a token
   sessionValidationRoute.use(function (req, res, next) {

      // check header or url parameters or post parameters for token
      const token = req.headers[SESSION_TOKEN_HEADER];

      // decode token
      if (token) {

         // verifies secret and checks exp
         jwt.verify(token, JWT_SECRET, function (err, decoded) {
            if (err) {
               return res.json({
                  success: false,
                  message: 'Failed to authenticate token.'
               });
            } else {
               // if everything is good, save to request for use in other routes
               req.userInfo = decoded;
               console.log('Confirmed user ' + decoded.user + ' with ID ' + decoded.userid);
               next();
            }
         });

      } else {

         console.log('JWT validation error: ' + req.headers);

         // if there is no token
         // return an error
         return res.status(403).send({
            success: false,
            message: 'Problem validating session'
         });

      }
   });


   async function aSaveFile (idString, contents) {
      const d = new Date();
      const n = d.getTime();

      const filePath = env.uploadPath + idString + '-' + n + '.json';

      try {
         await fsp.writeFile(filePath, JSON.stringify(contents));
         console.log('File saved: ' + filePath);
      } catch (error) {
         console.error(error);
      }
   }

   async function convertAndSaveToFhir (payload, userid) {

      let u = await env.userProvider.findUserById(userid);
      console.log('Got u', u);
      let token = await env.oauthProvider.getAccessTokenForUser(u);

      var FHIRClient = new(require('./FHIRClient'))(env.FHIRServer, u.sub, token);
      var patientRef = u.sub;

      let options = {
         source: 'tidepool',
         target: 'fiphr',
         FHIR_userid: patientRef // Needed for FHIR conversion
      };

      let records = await DataFormatConverter.convert(payload, options);

      console.log('Got records for uploading, count: ' + records.length);

      let uploadResults;

      if (records.length > 0) {

         var success = true;

         try {
            uploadResults = await FHIRClient.createRecords(records);
         } catch (error) {
            success = false;
            console.log(error);
         }
         console.log('Converted and uploaded records: ' + JSON.stringify(uploadResults.created));
      }

      return uploadResults;
   }

   var worker = env.monq.worker(['datasetUploads']);

   worker.register({
      uploadToFhir: async function (params, callback) {
         try {
            await convertAndSaveToFhir(params.payload, params.user_id);
            callback(null);
         } catch (err) {
            console.log(err);
            callback(err);
         }
      }
   });

   worker.start();

   const uploadApp = decorateApp(express());
   //uploadApp.use(morgan('combined'));
   const uploadPort = 9122;

   // API call for info object to find out minimum uploader client version
   // This call is made as the first thing on client start and error is reported to user if missing
   // 
   uploadApp.get('/info', (req, res) => {
      console.log('/info requested');
      res.send({
         versions: {
            schema: 3,
            uploaderMinimum: '0.333.0'
         }
      })
   }); // information about what uploader version is required

   const bodyParserParams = {
      json: {
         limit: 150000000,
         extended: false
      },
      urlencoded: {
         limit: 150000000,
         extended: false
      },
      raw: {
         limit: 150000000,
         extended: false
      }
   };

   uploadApp.use(bodyParser({
      limit: 150000000,
      extended: false
   }));

   // POST to /data is used for data uploads from CGM and Glucometers

   uploadApp.use('/data', sessionValidationRoute);
   uploadApp.postAsync('/data/:userId', async function (req, res, next) {
      //      console.log("PARAMS for /data/:userId: " + JSON.stringify(req.params));
      //      console.log("HEADERS for /data/:userId: " + JSON.stringify(req.headers));
      console.log('Data upload to /data/:userId ' + req.params.userId);

      const fileName = req.userInfo.sessionToken + '-data-' + req.params.userId;

      console.log('Saving data to ' + fileName);
      await aSaveFile(fileName, req.body);

      console.log('Would FHIR post to ' + req.userInfo.server + ' with patient id ' + req.userInfo.userid);

      let u = await env.userProvider.findUserById(req.userInfo.userid);
      console.log('Got u', u);
      let token = await env.oauthProvider.getAccessTokenForUser(u);

      var FHIRClient = new(require('./FHIRClient'))(env.FHIRServer, u.sub, token);
      var patientRef = u.sub;

      //var records = await DataFormatConverter.convertToFHIR(req.body, patientRef);

      console.log('GOT UPLOAD', req.body);

      let options = {
         source: 'tidepool',
         target: 'fiphr',
         FHIR_userid: patientRef // Needed for FHIR conversion
      };

      let records = await DataFormatConverter.convert(req.body, options);

      console.log('Got records for uploading, count: ' + records.length);

      var uploadResults;

      if (records.length > 0) {

         var success = true;

         try {
            uploadResults = await FHIRClient.createRecords(records);
         } catch (error) {
            success = false;
            console.log(error);
         }
         console.log('Converted and uploaded records: ' + JSON.stringify(uploadResults.created));

         if (!success || uploadResults.errors > 0) {
            console.log('Upload failed');
            res.status(500).send({
               success: 0
            });
         } else {
            res.send({
               success: 1
            });
         }
      } else {
         res.send({
            success: 1
         });
      }
   });

   // uploadApp.listen(uploadPort, () => console.log(`Upload app listening on port ${uploadPort}!`));

   TidepoolRESTService.uploadApp = uploadApp;

   //
   // Data Server
   //
   // Data server, used for data uploads
   // Client creates a dataset and then sends blobs related to the dataset
   // This server is not sent any authentication tokens, it just acts as a data receiver
   // Any uploads thus need to be validated separately based on the created dataset
   // 
   // Missing / TODO: the client seems to have detection for already uploaded datasets, need to check how that works
   //

   const dataApp = decorateApp(express());
   //dataApp.use(morgan('combined'));
   const dataPort = 9220;

   dataApp.use(bodyParser({
      limit: 150000000,
      extended: false
   }));

   // createDataset
   // This call is made to create a new dataset ID for the client. The uploads then happen using this uploadId
   dataApp.postAsync('/v1/users/:userId/datasets', async function (req, res) {
      //      console.log("PARAMS: " + JSON.stringify(req.params));
      //      console.log("HEADERS: " + JSON.stringify(req.headers));

      console.log("API CALL: createDataset");
      console.log(req.headers);

      const d = new Date();
      const fileName = "dataset-user-" + req.params.userId + '-createdataset-' + d.getTime();
      await aSaveFile(fileName, req.body);

      var datasetID = env.randomString();

      const dataSet = new UploaderDataset({
         dataset_id: datasetID,
         user_id: req.params.userId,
         date: new Date()
      });

      try {
         await dataSet.save();
         res.status(201).send({
            "data": {
               "uploadId": datasetID
            }
         });
      } catch (error) {
         console.error('Error persisting profile', error);
         res.status(500).send("Error creating dataset");
      }

   });


   // uploads a dataset
   dataApp.postAsync('/v1/datasets/:datasetId/data', async function (req, res) {
      //      console.log("PARAMS: " + JSON.stringify(req.params));
      //      console.log("HEADERS: " + JSON.stringify(req.headers));

      console.log("DATA UPLOAD INCOMING");

      // for debuggin, remove for production
      const fileName = 'dataset-' + req.params.datasetId + '-data';
      await aSaveFile(fileName, req.body);

      const dataSet = await UploaderDataset.findOne({
         dataset_id: req.params.datasetId
      });

      if (dataSet) {

         const job = {
            user_id: dataSet.user_id,
            dataset_id: dataSet.dataset_id,
            payload: req.body
         };

         var queue = env.monq.queue('datasetUploads');

         queue.enqueue('uploadToFhir', job, function (err, job) {
            console.log('enqueued a job with id:', req.params.datasetId);
         });
         res.status(200).send({
            "success": 1
         });
      } else {
         res.status(500).send("Dataset not found");
      }
   });



   /// FINALIZE dataset
   dataApp.put('/v1/datasets/:datasetId', async function (req, res) {
      //  console.log("BODY: " + JSON.stringify(req.body));
      console.log("PARAMS: " + JSON.stringify(req.params));
      console.log("HEADERS: " + JSON.stringify(req.headers));

      console.log("API CALL: finalize dataset");

      // TODO: DELETE DATASET

      const fileName = 'dataset-final-' + req.params.datasetId + '-finalize';
      await aSaveFile(fileName, req.body);

      res.status(200).send({
         "success": 1
      });
   });

   //  Client loads the Server time from this URL
   dataApp.get('/v1/time', (req, res) => {
      console.log('/time REQUEST');
      res.send({
         data: {
            time: new Date()
         }
      });
   });


   // This presumaly should return the list of existing datasets about the user
   // TODO read client code to find out what's expected
   dataApp.get('/v1/users/:userId/data_sets', (req, res) => {
      console.log('CLIENT REQUESTING DATASET LIST');
      console.log("BODY: " + JSON.stringify(req.body));
      console.log("PARAMS: " + JSON.stringify(req.params));
      console.log("HEADERS: " + JSON.stringify(req.headers));

      res.send({
         success: 1
      });
   });


   //   dataApp.listen(dataPort, () => console.log(`Data app listening on port ${dataPort}!`));

   TidepoolRESTService.dataApp = dataApp;

   //
   //// AUTHENTICATION SERVER
   // 

   //var app = express();

   const app = decorateApp(express());

   //app.use(morgan('combined'));


   app.use(bodyParser({
      limit: 150000000,
      extended: false
   }));


   // apply the routes to our application with the prefix /api
   app.use('/metadata/*', sessionValidationRoute);

   // 2nd request
   // LOGIN using HTTP Basic Auth
   app.postAsync('/auth/login', async function (req, res, next) {
      console.log('AUTHENTICATION');
      //    console.log(req.body);
      console.log(JSON.stringify(req.headers));

      let credentials = basicAuthParser(req);

      console.log('Got credentials: ', credentials);

      let response = {
         'authentication': 'failed'
      };

      let u = await env.userProvider.findUserByEmailAndSecret(credentials.name, credentials.pass);

      if (u) {
         response = {
            data: {
               "name": "Unknown user",
               "userid": u.user_id,
               'server': env.FHIRServer
            },
            authentication: "success"
         };
      }

      if (response.authentication == 'success') {
         console.log(response.data);

         let sessionToken = env.randomString(8);
         response.data.sessionToken = sessionToken;

         let token = jwt.sign(response.data, JWT_SECRET, {
            expiresIn: "1 days" // expires in 24 hours
         });

         let userId = response.data.userid;

         console.log('Authenticating user ' + userId);

         res.set(SESSION_TOKEN_HEADER, token);

         let r = {
            "emailVerified": true,
            "emails": ["foo@bar.com"],
            "termsAccepted": "2019-03-07T15:40:09+02:00",
            "userid": userId,
            "username": credentials.name
         }

         res.send(r); // presumably a secret UUID
      } else {
         console.log('Authentication failed');
         res.status(401).json({
            message: 'Invalid Authentication Credentials'
         });
      }

   });

   // LOGIN with persisted token from Remember Me
   app.get('/auth/user', (req, res) => {
      console.log("REMEMBER ME REQUEST");
      console.log(req.body);
      console.log(JSON.stringify(req.headers));
      res.set(SESSION_TOKEN_HEADER, "token");
      res.send({
         userid: "foobar"
      }); // presumably a secret UUID
   });

   // Client also makes GET requests to /auth/login for some reason
   app.get('/auth/login', (req, res) => {
      console.log('GET /auth/login');
      console.log(req.body);
      console.log(JSON.stringify(req.headers));

      res.set(SESSION_TOKEN_HEADER, "token");
      res.send({
         userid: "foobar"
      }); // presumably a secret UUID
   });

   /*
   {"emails":["foo@bar.com"],"fullName":"PatientName1","patient":{"targetTimezone":"Europe/Helsinki","targetDevices":["dexcom","omnipod","medtronic600","medtronic","tandem","abbottfreestylelibre","bayercontournext","animas","onetouchverio","truemetrix","onetouchultra2","onetouchultramini","onetouchverioiq"]}}
   */

   var p = {
      emails: ['foo@bar.com'],
      fullName: 'Patient1',
      patient: {
         "about": "This is the about text for the PWD.",
         "birthday": "1997-01-01",
         "diagnosisDate": "1999-01-01",
         targetTimezone: 'Europe/Helsinki',
         targetDevices: ["dexcom", "medtronic", "bayercontournext"]
      }
   };

   var profile = {
      "fullName": "Sensotrend",
      "patient": {
         "birthday": "1900-01-01",
         "diagnosisDate": "1900-01-01",
         "diagnosisType": "type1",
         "targetDevices": [],
         "targetTimezone": "Europe/Helsinki"
      }
   };


   //   {userid: 'jkl012', profile: {fullName: 'Jane Doe', patient: { birthday: '2010-01-01' }}}
   //  {"emails":["foo@bar.com"],"fullName":"PatientName1","patient":{"targetTimezone":"Europe/Helsinki","targetDevices":["dexcom","omnipod","medtronic600","medtronic","tandem","abbottfreestylelibre","bayercontournext","animas","onetouchverio","truemetrix","onetouchultra2","onetouchultramini","onetouchverioiq"]}}



   // 3rd request
   // this gets sent the token back
   app.getAsync('/metadata/:userId/profile', async function (req, res) {
      //    console.log("BODY: " + JSON.stringify(req.body));
      //    console.log("PARAMS: " + JSON.stringify(req.params));
      //    console.log("HEADERS: " + JSON.stringify(req.headers));
      console.log('Profile data request: /metadata/:userId/profile for id ' + req.params.userId);
      console.log(profile);

      const _profile = await ProfileModel.findOne({
         user_id: req.params.userId
      });

      let p = profile;

      if (_profile) {
         p = {
            "fullName": "Sensotrend",
            "patient": _profile
         };
         console.log('Profile found, returning ', p);
      }

      //profile.fullName = 'PatientName' + req.params.userId;

      res.send(p);
   });

   // group id == PWD id
   // TODO: find out what the format really is
   var g = [
      {
         upload: true,
         root: false,
         id: 0,
         groupid: 0
      }, {
         upload: true,
         root: false,
         id: 1,
         groupid: 1
      }
];


   // 4th request
   // Return a list of patients the user is allowed to upload to
   app.get('/access/groups/:userid', (req, res) => {
      //    console.log("BODY: " + JSON.stringify(req.body));
      //    console.log("PARAMS: " + JSON.stringify(req.params));
      //    console.log("HEADERS: " + JSON.stringify(req.headers));
      console.log('Giving list of PWDs this account manages: /access/groups/:userid ' + req.params.userid);

      // Default to single patient profiles for now
      let r = {};
      r[req.params.userid] = { root: {} };

      res.send(r);
   });

   // Return a profile for the ID
   app.get('/metadata/:userId/profile', (req, res) => {
      //    console.log("BODY: " + JSON.stringify(req.body));
      //    console.log("PARAMS: " + JSON.stringify(req.params));
      //    console.log("HEADERS: " + JSON.stringify(req.headers));
      console.log('/metadata/:userId/profile request for ID NONDYNAMIC' + req.params.userId);
      res.send(profile);
   });

   // Client sends updated profile with selected devices, as chosen in the UI
   app.putAsync('/metadata/:userId/profile', async function (req, res) {
      //    console.log("BODY: " + JSON.stringify(req.body));
      //    console.log("PARAMS: " + JSON.stringify(req.params));
      //    console.log("HEADERS: " + JSON.stringify(req.headers));
      // send back the edited profile, client loads this
      console.log('Client PUT for /metadata/:userId/profile' + req.params.userId);

      // Update model ehre

      const _profile = await ProfileModel.findOne({
         user_id: req.params.userId
      });

      console.log(req.body);

      if (_profile) {
         _profile.targetDevices = req.body.patient.targetDevices;
         await _profile.save();
      } else {
         let p = new ProfileModel({
            user_id: req.params.userId,
            birthday: "1900-01-01",
            diagnosisDate: "1900-01-01",
            diagnosisType: "type1",
            targetDevices: req.body.patient.targetDevices,
            targetTimezone: req.body.patient.targetTimezone
         });

         try {
            await p.save();
         } catch (error) {
            console.error('Error persisting profile', error);
         }
      }

      res.send(profile);
   });

   // Just ignore metrics calls for now; don't know why some are sent with GET and some as POST
   app.post(/metrics/, (req, res) => {
      console.log('/metrics');
      res.send({
         success: 1
      });
   });

   // Just ignore metrics calls for now;  don't know why some are sent with GET and some as POST
   app.get(/metrics/, (req, res) => {
      console.log('/metrics');
      res.send({
         success: 1
      });
   });

   // logout is also sent here with POST
   app.post('/auth/logout', (req, res) => {
      //    console.log("BODY: " + JSON.stringify(req.body));
      //    console.log("PARAMS: " + JSON.stringify(req.params));
      //    console.log("HEADERS: " + JSON.stringify(req.headers));
      console.log('/auth/logout: session ' + req.headers[SESSION_TOKEN_HEADER] + ' logged out');
      res.send({
         success: 1
      });
   });

   // for some reason the pump upload blobs come here
   app.post('/v1/users/:userId/blobs', async function (req, res) {
      //  console.log("BODY: " + JSON.stringify(req.body));
      console.log("PARAMS: " + JSON.stringify(req.params));
      console.log("HEADERS: " + JSON.stringify(req.headers));

      console.log("DATA BLOB upload");

      const d = new Date();
      const fileName = 'blob-userid-' + req.params.userId + '-' + d.getTime();

      await aSaveFile(fileName, req.body);

      var datasetID = env.randomString(5);
      res.status(200).send({
         "success": 1
      });

   });

   //   app.listen(8009);

   TidepoolRESTService.APIapp = app;

   return TidepoolRESTService;
}


export default TidepoolRESTService;
