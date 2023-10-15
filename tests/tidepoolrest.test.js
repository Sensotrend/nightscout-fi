import nsfi from '../lib/server.js';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import _FHIRClient from '../lib/FHIRClient';
import { exist } from '../node_modules/should/should.js';

const env = nsfi.env;
const Auth = env.userProvider;
const siteid = 'foo';
const pw = 'bar';

const fhirserver = env.FHIRServer;
const FHIRClient = _FHIRClient(fhirserver, {env});

const UUID = uuidv4();

const d = new Date();
const tokenExpiryTimeInFuture = new Date (d.getTime() + 100000);

const testPatient = {
   "resourceType": "Patient",
   "text": {
      "status": "generated",
      "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Identifier</td><td>urn:uuid:" + UUID + "</td></tr></tbody></table></div>"
   },
   "identifier": [
      {
         "system": "urn:ietf:rfc:3986",
         "value": "urn:uuid:" + UUID
     }
   ]
};

let patient;

describe.skip('Tidepool API testing', function () {

   it('should create a sample patient and data to FHIR sandbox', async function () {
      try {
         console.log('CREATING PATIENT');
         const results = await FHIRClient.createRecords(testPatient);
         patient = results.records[0];

      } catch (error) {
         console.error(error);
         false.should.equal(true);
      }
   });

   it('should authenticate over Tidepool API and upload a CGM record', async function () {

      let u = await Auth.createUser(patient.id, siteid, pw, tokenExpiryTimeInFuture); // sub, access_token, refresh_token,token_expiry_date

      u.email = "foo@bar.com";

      try {
         await u.save();
      } catch (error) {
         console.log('error');
      }

      console.log('User for Tidepool API TEST', u);

      let tide_sample = [
         {
            "time": "2018-10-22T06:32:42.000Z",
            "timezoneOffset": 120,
            "clockDriftOffset": 0,
            "conversionOffset": 0,
            "deviceTime": "2018-10-22T08:32:42",
            "deviceId": "DexG5MobRec_SM74021055",
            "type": "cbg",
            "value": 127,
            "units": "mg/dL",
            "payload": {
               "trend": "Flat",
               "internalTime": "2018-10-22T15:32:43",
               "transmitterTimeSeconds": 887679,
               "noiseMode": "Clean",
               "logIndices": [309454363]
            },
            "uploadId": "upid_5bd26e3593d8",
            "guid": "bb53c910-d03a-4fd6-b589-44260bd7c0d1"
         }
     ];

      let results = await request(nsfi)
         .post('/tpapi/auth/login')
         .auth(u.email, u.site_secret)
         .expect('Content-Type', /json/)
         .expect(200);

      const HEADER = "x-tidepool-session-token";

      const authHeader = results.headers[HEADER]
      const userID = results.body.userid;

      results = await request(nsfi)
         .post('/tpupload/data/' + userID)
         .set({ 'x-tidepool-session-token': authHeader })
         .send(tide_sample)
         .expect('Content-Type', /json/)
         .expect(200);

      console.log('GOT VALID DATA', results.body);

      results.body.success.should.equal(1);
   });

   it('should authenticate over Tidepool API and upload pump data as a dataset', async function () {

      let u = await Auth.createUser(patient.id, siteid, pw, tokenExpiryTimeInFuture); // sub, access_token, refresh_token,token_expiry_date

      u.email = "foo@bar.com";

      try {
         await u.save();
      } catch (error) {
         console.log('error');
      }

      console.log('User for Tidepool API TEST', u);

      const datasetStart = {
         "type": "upload",
         "computerTime": "2019-05-07T10:19:13",
         "time": "2019-05-07T10:19:13+03:00",
         "timezoneOffset": 180,
         "conversionOffset": 0,
         "timezone": "Europe/Helsinki",
         "timeProcessing": "utc-bootstrapping",
         "version": "2.14.0-sensotrend",
         "deviceTags": ["insulin-pump", "cgm"],
         "deviceManufacturers": ["Medtronic"],
         "deviceModel": "1711",
         "deviceSerialNumber": "NG1112288H",
         "deviceId": "MMT-1711:NG1112288H",
         "client": {
            "name": "org.tidepool.uploader",
            "version": "2.14.0-sensotrend",
            "private": { "delta": { "dataEnd": "2019-05-07T10:15:13.000Z" } }
         },
         "deduplicator": { "name": "org.tidepool.deduplicator.device.deactivate.hash" }
      };

      const data = [{
         "time": "2018-12-18T17:59:02.000Z",
         "timezoneOffset": 180,
         "clockDriftOffset": 0,
         "conversionOffset": 0,
         "deviceTime": "2018-12-18T20:59:02",
         "deviceId": "MMT-1711:NG1112288H",
         "type": "cbg",
         "value": 102,
         "units": "mg/dL",
         "payload": {
            "interstitialSignal": 24.51,
            "logIndices": [2184580913]
         }
      }, {
         "time": "2018-12-18T18:00:02.000Z",
         "timezoneOffset": 180,
         "clockDriftOffset": 0,
         "conversionOffset": 0,
         "deviceTime": "2018-12-18T21:00:02",
         "deviceId": "MMT-1711:NG1112288H",
         "type": "cbg",
         "value": 101,
         "units": "mg/dL",
         "payload": {
            "interstitialSignal": 24.51,
            "logIndices": [2184580913]
         }
      }];

      const finalize = { "dataState": "closed" };

      let results = await request(nsfi)
         .post('/tpapi/auth/login')
         .auth(u.email, u.site_secret)
         .expect('Content-Type', /json/)
         .expect(200); // .expect('Content-Type', /json/)

      const HEADER = "x-tidepool-session-token";

      const authHeader = results.headers[HEADER]
      const userID = results.body.userid;

      let { body } = await request(nsfi)
         .post('/tpdata/v1/users/' + userID + '/datasets')
         .set({ 'x-tidepool-session-token': authHeader })
         .send(datasetStart)
         .expect('Content-Type', /json/)
         .expect(201);

      const uploadId = body.data.uploadId;

      console.log('Using uploadId', uploadId);

      results = await request(nsfi)
         .post('/tpdata/v1/datasets/' + uploadId + '/data')
         .set({ 'x-tidepool-session-token': authHeader })
         .send(data)
         .expect('Content-Type', /json/)
         .expect(200);

      console.log('GOT VALID DATA', results.body);

      results = await request(nsfi)
         .put('/tpdata/v1/datasets/' + uploadId)
         .set({ 'x-tidepool-session-token': authHeader })
         .send(finalize)
         .expect('Content-Type', /json/)
         .expect(200);

      results.body.success.should.equal(1);

   });


});
