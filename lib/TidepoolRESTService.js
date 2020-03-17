import express from 'express';
import { decorateApp } from '@awaitjs/express';
import basicAuthParser from 'basic-auth';
import bodyParser from 'body-parser';
import _FHIRClient from './FHIRClient';

import fs from 'fs'; //).promises;

import jwt from 'jsonwebtoken';
import ProfileModel from './models/tidepooluserprofile.model.js';
import UploaderDataset from './models/tidepooluploaderdataset.model.js';

const fsp = fs.promises;

const batchSupported = false; // TODO: check from capability statement! Or at least from ENV.

const SESSION_TOKEN_HEADER = 'x-tidepool-session-token';
const JWT_SECRET = 'ThisIsARandomString';

const DEBUG_SAVE_FILE = process.env.DEBUG_SAVE_FILE ? process.env.DEBUG_SAVE_FILE : false;
const SKIP_OLD_RECORDS = process.env.SKIP_OLD_RECORDS ? process.env.SKIP_OLD_RECORDS : true;

function TidepoolRESTService (env) {

   const logger = env.logger;
   const DataFormatConverter = env.dataFormatConverter;
   const TidepoolRESTService = decorateApp(express());

   // JWT session validation
   async function sessionValidationRoute (req, res, next) {
      logger.info('Validating Uploader session');

      // check header or url parameters or post parameters for token
      const token = req.headers[SESSION_TOKEN_HEADER];

      // decode token
      if (token) {

         // verifies secret and checks exp
         jwt.verify(token, JWT_SECRET, function (err, decoded) {
            if (err) {
               logger.info('Uploader session validation error: ' + err);
               return res.json({
                  success: false,
                  message: 'Failed to authenticate token.'
               });
            } else {
               // if everything is good, save to request for use in other routes
               req.userInfo = decoded;
               logger.info('Confirmed user ' + decoded.user + ' with ID ' + decoded.userid);
               logger.debug('decoded session ' + decoded);
               next();
            }
         });

      } else {

         logger.info('JWT validation error: ' + req.headers);

         // if there is no token
         // return an error
         return res.status(403).send({
            success: false,
            message: 'Problem validating session'
         });

      }
   };


   async function aSaveFile (idString, contents) {
      const d = new Date();
      const n = d.getTime();

      const filePath = env.uploadPath + idString + '-' + n + '.json';

      try {
         await fsp.writeFile(filePath, JSON.stringify(contents));
         logger.info('File saved: ' + filePath);
      } catch (error) {
         logger.error(error);
      }
   }

   // REST SERVICES

   const uploadApp = decorateApp(express());
   // const uploadPort = 9122;

   // API call for info object to find out minimum uploader client version
   // This call is made as the first thing on client start and error is reported to user if missing
   // 
   uploadApp.get('/info', (req, res) => {
      logger.info('/info requested');
      res.send({
         versions: {
            schema: 3,
            uploaderMinimum: '0.333.0'
         }
      })
   }); // information about what uploader version is required

   uploadApp.use(bodyParser.urlencoded({
      limit: '50mb',
      extended: true
   }));

   uploadApp.use(bodyParser.json({
      limit: '50mb',
      extended: true
   }));

   // POST to /data is used for data uploads from CGM and Glucometers
   // Note Libre does the batched dataset uploads

   uploadApp.use('/data', sessionValidationRoute);
   uploadApp.postAsync('/data/:userId', async function (req, res) {
      logger.info('Data upload to /data/:userId ' + req.params.userId);

      if (DEBUG_SAVE_FILE) {
         const fileName = req.userInfo.sessionToken + '-data-' + req.params.userId;
         logger.info('Saving data to ' + fileName);
         await aSaveFile(fileName, req.body);
      }

      logger.info('Would FHIR post to ' + req.userInfo.server + ' with patient id ' + req.userInfo.userid);

      const u = await env.userProvider.findUserById(req.userInfo.userid);
      const token = await env.oauthProvider.getAccessTokenForUser(u);

      const FHIRClient = new _FHIRClient(env.FHIRServer, {patient: u.sub, bearertoken: token, env});
      const patientRef = u.sub;

      logger.info('Upload upload with records, count ' + req.body.length);

      const options = {
         source: 'tidepool',
         target: 'fiphr',
         FHIR_userid: patientRef // Needed for FHIR conversion
      };

      if (SKIP_OLD_RECORDS) {
         const latestDeviceDates = await env.lastSeenService.getLatestDates(patientRef);

         if (latestDeviceDates) {
            logger.debug('Adding skip dates ' + latestDeviceDates);
            options.skipRecordsUsingDates = latestDeviceDates;
         }
      }

      const records = await DataFormatConverter.convert(req.body, options);

      logger.info('Got records for uploading, count: ' + records.length);

      if (records.length > 0) {

         let success = true;

         let uploadResults = {};

         try {
            uploadResults = await FHIRClient.createRecords(records);
            logger.info('Records created: ' + JSON.stringify(uploadResults.created));
            logger.info('Records skipped: ' + JSON.stringify(uploadResults.skipped));
            logger.info('Errors: ' + JSON.stringify(uploadResults.errors));
            if (SKIP_OLD_RECORDS) {
               logger.debug('Updating device dates ' + uploadResults.latestDates);
               await env.lastSeenService.updateDates(patientRef, uploadResults.latestDates);
            }
         } catch (error) {
            success = false;
            logger.error('Error uploading results: ' + JSON.stringify(error, null, 2));
         }

         if (!success || uploadResults.errors > 0) {
            logger.info('Upload failed');
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

   // uploadApp.listen(uploadPort, () => logger.info(`Upload app listening on port ${uploadPort}!`));

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
   // const dataPort = 9220;

   dataApp.use(bodyParser.urlencoded({
      limit: '50mb',
      extended: true
   }));

   dataApp.use(bodyParser.json({
      limit: '50mb',
      extended: true
   }));
   

   // createDataset
   // This call is made to create a new dataset ID for the client. The uploads then happen using this uploadId
   dataApp.postAsync('/v1/users/:userId/datasets', async function (req, res) {
      logger.info('API CALL: createDataset');

      if (DEBUG_SAVE_FILE) {
         const d = new Date();
         const fileName = 'dataset-user-' + req.params.userId + '-createdataset-' + d.getTime();
         await aSaveFile(fileName, req.body);
      }

      const datasetID = env.randomString();

      const dataSet = new UploaderDataset({
         dataset_id: datasetID,
         user_id: req.params.userId,
         date: new Date()
      });

      try {
         await dataSet.save();
         res.status(201).send({
            data: {
               uploadId: datasetID
            }
         });
      } catch (error) {
         logger.error('Error persisting profile ' + error);
         res.status(500).send('Error creating dataset');
      }

   });

   // uploads a dataset
   dataApp.postAsync('/v1/datasets/:datasetId/data', async function (req, res) {
      logger.info('Dataset Upload');

      if (DEBUG_SAVE_FILE) {
         const fileName = 'dataset-' + req.params.datasetId + '-data';
         await aSaveFile(fileName, req.body);
      }

      const dataSet = await UploaderDataset.findOne({
         dataset_id: req.params.datasetId
      });

      if (dataSet) {
         const u = await env.userProvider.findUserById(dataSet.user_id);

         if (!u) {
            res.status(403).send('User not found');
         }

         const token = await env.oauthProvider.getAccessTokenForUser(u);
         const FHIRClient = new _FHIRClient(env.FHIRServer, {
            patient: u.sub,
            bearertoken: token, env
         });
         const patientRef = u.sub;

         const converterOptions = {
            source: 'tidepool',
            target: 'fiphr',
            FHIR_userid: patientRef // Needed for FHIR conversion
         };

         if (SKIP_OLD_RECORDS) {
            const latestDeviceDates = await env.lastSeenService.getLatestDates(patientRef);

            if (latestDeviceDates) {
               converterOptions.skipRecordsUsingDates = latestDeviceDates;
            }
         }
         logger.info('Got records for uploading, converting, ' + req.body.length);

         const records = await DataFormatConverter.convert(req.body, converterOptions);
         logger.info('Got records for uploading, count:' + records.length);

         if (records.length > 1 && batchSupported) {
            const uploadResults = await FHIRClient.uploadBatch(records);
            res.status(200).send(uploadResults); // TODO: map to 'submitted' and 'success'
         } else {
            const uploadResults = {
               created: 0,
               skipped: 0,
               errors: 0,
               records: [],
               latestDates: {}
            };
               
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Transfer-Encoding', 'chunked');
   
            // Writing JSON structure fragments by hand is a little iffy, but it will let us
            // actually send something every time a record is submitted.
            res.write('{"submitted": [');
            for (const record of records) {
               const previousErrorCount = uploadResults.errors.length;
               const recordId = record.identifier[0].value;
               logger.debug('Starting to send record ' + recordId);
               await FHIRClient.upload(record, uploadResults);
   
               if (uploadResults.errors.length === previousErrorCount) {
                  if ((uploadResults.created + uploadResults.skipped) > 1) {
                     res.write(',');
                  }
                  res.write(JSON.stringify(recordId));
                  logger.debug('Sent record ' + recordId);
               } else {
                  logger.warn('Failed sending record ' + recordId);
               }
            }
            res.write(`], "success": ${JSON.stringify(uploadResults.errors.length === 0)}}`);
            res.end();
         }

      } else {
         res.status(500).send('Dataset not found');
      }
   });

   /// FINALIZE dataset
   dataApp.put('/v1/datasets/:datasetId', async function (req, res) {
      logger.info('API CALL: finalize dataset');

      // TODO: DELETE DATASET
      if (DEBUG_SAVE_FILE) {
         const fileName = 'dataset-final-' + req.params.datasetId + '-finalize';
         await aSaveFile(fileName, req.body);
      }

      res.status(200).send({
         'success': 1
      });
   });

   //  Client loads the Server time from this URL
   dataApp.get('/v1/time', (req, res) => {
      logger.info('/time REQUEST');
      res.send({
         data: {
            time: new Date()
         }
      });
   });

   // This presumaly should return the list of existing datasets about the user
   // TODO read client code to find out what's expected
   dataApp.get('/v1/users/:userId/data_sets', (req, res) => {
      logger.info('CLIENT REQUESTING DATASET LIST');
      logger.info('BODY: ' + JSON.stringify(req.body));
      logger.info('PARAMS: ' + JSON.stringify(req.params));
      logger.info('HEADERS: ' + JSON.stringify(req.headers));

      res.send({
         success: 1
      });
   });

   TidepoolRESTService.dataApp = dataApp;

   //
   //// AUTHENTICATION SERVER
   // 
   const app = decorateApp(express());

   app.use(bodyParser.urlencoded({
      limit: '50mb',
      extended: true
   }));

   app.use(bodyParser.json({
      limit: '50mb',
      extended: true
   }));


   // apply the routes to our application with the prefix /api
   app.use('/metadata/*', sessionValidationRoute);

   // 2nd request
   // LOGIN using HTTP Basic Auth
   app.postAsync('/auth/login', async function (req, res, next) {
      logger.info('AUTHENTICATION');

      const credentials = basicAuthParser(req);
      let response = {
         'authentication': 'failed'
      };

      const u = await env.userProvider.findUserByEmailAndSecret(credentials.name, credentials.pass);

      if (u) {
         response = {
            data: {
               'name': 'Sensotrend',
               'userid': u.user_id,
               'server': env.FHIRServer // TODO REMOVE
            },
            authentication: 'success'
         };
      }

      if (response.authentication == 'success') {
         logger.info(response.data);

         const sessionToken = env.randomString();
         response.data.sessionToken = sessionToken;

         const token = jwt.sign(response.data, JWT_SECRET, {
            expiresIn: '1 days'
         });

         const userId = response.data.userid;

         logger.info('Authenticating user ' + userId);

         res.set(SESSION_TOKEN_HEADER, token);

         const r = {
            'emailVerified': true,
            'emails': ['foo@bar.com'],
            'termsAccepted': '2019-03-07T15:40:09+02:00',
            'userid': userId,
            'username': 'Sensotrend'
         }

         res.send(r); // presumably a secret UUID
      } else {
         logger.info('Authentication failed');
         res.status(401).json({
            message: 'Invalid Authentication Credentials'
         });
      }

   });

   // LOGIN with persisted token from Remember Me
   app.getAsync('/auth/user', sessionValidationRoute, async function (req, res) {
      logger.info('REMEMBER ME REQUEST');

      res.set(SESSION_TOKEN_HEADER, 'token');
      res.send({
         userid: req.userInfo.userid
      });
   });

   // Remember Me login with token
   // Client also makes GET requests to /auth/login for some reason
   app.getAsync('/auth/login', sessionValidationRoute, async function (req, res) {
      logger.info('GET /auth/login');

      const u = await env.userProvider.findUserById(req.userInfo.userid);

      if (u) {
         const response = {
            data: {
               'name': 'Sensotrend',
               'userid': u.user_id
            },
            authentication: 'success'
         };

         logger.info(response.data);

         const sessionToken = env.randomString();
         response.data.sessionToken = sessionToken;

         const token = jwt.sign(response.data, JWT_SECRET, {
            expiresIn: '30 days'
         });

         const userId = response.data.userid;

         logger.info('Authenticating user ' + userId);

         res.set(SESSION_TOKEN_HEADER, token);

         const r = {
            'emailVerified': true,
            'emails': ['foo@bar.com'],
            'termsAccepted': '2019-03-07T15:40:09+02:00',
            'userid': userId,
            'username': 'Sensotrend'
         };

         res.send(r);
      } else {
         logger.info('Authentication failed');
         res.status(401).json({
            message: 'Invalid Authentication Token'
         });
      }
   });

   /*
   {"emails":["foo@bar.com"],"fullName":"PatientName1","patient":{"targetTimezone":"Europe/Helsinki","targetDevices":["dexcom","omnipod","medtronic600","medtronic","tandem","abbottfreestylelibre","bayercontournext","animas","onetouchverio","truemetrix","onetouchultra2","onetouchultramini","onetouchverioiq"]}}

   const p = {
      emails: ['foo@bar.com'],
      fullName: 'Patient1',
      patient: {
         'about': 'This is the about text for the PWD.',
         'birthday': '1997-01-01',
         'diagnosisDate': '1999-01-01',
         targetTimezone: 'Europe/Helsinki',
         targetDevices: ['dexcom', 'medtronic', 'bayercontournext']
      }
   };
   */

   const profile = {
      'fullName': 'Sensotrend',
      'patient': {
         'birthday': '1900-01-01',
         'diagnosisDate': '1900-01-01',
         'diagnosisType': 'type1',
         'targetDevices': [],
         'targetTimezone': 'Europe/Helsinki'
      }
   };


   //   {userid: 'jkl012', profile: {fullName: 'Jane Doe', patient: { birthday: '2010-01-01' }}}
   //  {"emails":["foo@bar.com"],"fullName":"PatientName1","patient":{"targetTimezone":"Europe/Helsinki","targetDevices":["dexcom","omnipod","medtronic600","medtronic","tandem","abbottfreestylelibre","bayercontournext","animas","onetouchverio","truemetrix","onetouchultra2","onetouchultramini","onetouchverioiq"]}}

   // 3rd request
   // this gets sent the token back
   app.getAsync('/metadata/:userId/profile', async function (req, res) {
      logger.info('Profile data request: /metadata/:userId/profile for id ' + req.params.userId);
      logger.info(profile);

      const _profile = await ProfileModel.findOne({
         user_id: req.params.userId
      });

      let p = profile;

      if (_profile) {
         p = {
            'fullName': 'Sensotrend',
            'patient': _profile
         };
         logger.info('Profile found, returning ', p);
      }

      //profile.fullName = 'PatientName' + req.params.userId;

      res.send(p);
   });

   // group id == PWD id
   // TODO: find out what the format really is
   /*
   const g = [
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
   */


   // 4th request
   // Return a list of patients the user is allowed to upload to
   app.get('/access/groups/:userid', (req, res) => {
      logger.info('Giving list of PWDs this account manages: /access/groups/:userid ' + req.params.userid);

      // Default to single patient profiles for now
      const r = {};
      r[req.params.userid] = { root: {} };

      res.send(r);
   });

   // Return a profile for the ID
   app.get('/metadata/:userId/profile', (req, res) => {
      logger.info('/metadata/:userId/profile request for ID NONDYNAMIC' + req.params.userId);
      res.send(profile);
   });

   // Client sends updated profile with selected devices, as chosen in the UI
   app.putAsync('/metadata/:userId/profile', async function (req, res) {
      // send back the edited profile, client loads this
      logger.info('Client PUT for /metadata/:userId/profile' + req.params.userId);

      // Update model here
      const _profile = await ProfileModel.findOne({
         user_id: req.params.userId
      });

      logger.info(req.body);

      if (_profile) {
         _profile.targetDevices = req.body.patient.targetDevices;
         await _profile.save();
      } else {
         let p = new ProfileModel({
            user_id: req.params.userId,
            birthday: '1900-01-01',
            diagnosisDate: '1900-01-01',
            diagnosisType: 'type1',
            targetDevices: req.body.patient.targetDevices,
            targetTimezone: req.body.patient.targetTimezone
         });

         try {
            await p.save();
         } catch (error) {
            logger.error('Error persisting profile ' + error);
         }
      }

      res.send(profile);
   });

   // Just ignore metrics calls for now; don't know why some are sent with GET and some as POST
   app.post('/metrics/', (req, res) => {
      logger.info('/metrics');
      res.send({
         success: 1
      });
   });

   // Just ignore metrics calls for now;  don't know why some are sent with GET and some as POST
   app.get('/metrics/', (req, res) => {
      logger.info('/metrics');
      res.send({
         success: 1
      });
   });

   // logout is also sent here with POST
   app.post('/auth/logout', (req, res) => {
      logger.info('/auth/logout: session ' + req.headers[SESSION_TOKEN_HEADER] + ' logged out');
      res.send({
         success: 1
      });
   });

   // for some reason the pump upload blobs come here
   app.post('/v1/users/:userId/blobs', async function (req, res) {

      logger.info('DATA BLOB upload');

      if (DEBUG_SAVE_FILE) {
         const d = new Date();
         const fileName = 'blob-userid-' + req.params.userId + '-' + d.getTime();
         await aSaveFile(fileName, req.body);
      }

      res.status(200).send({
         'success': 1
      });

   });

   TidepoolRESTService.APIapp = app;
   return TidepoolRESTService;
}

export default TidepoolRESTService;
