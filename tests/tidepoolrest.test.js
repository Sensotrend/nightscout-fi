import nsfi from '../nsfi.js';

import request from 'supertest';
import uuidv4 from 'uuid/v4';
import _FHIRClient from '../lib/FHIRClient';
import { exist } from '../node_modules/should/should.js';

const env = nsfi.env;
const Auth = env.userProvider;
const siteid = 'foo';
const pw = 'bar';

const fhirserver = "http://hapi.fhir.org/baseDstu3";
const FHIRClient = _FHIRClient(fhirserver);

const UUID = uuidv4();

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

describe('Tidepool API testing', function () {

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

   it('should authenticate over Tidepool API', async function () {

      let u = await Auth.createUser(patient.id, siteid, pw, new Date()); // sub, access_token, refresh_token,token_expiry_date

      u.email = "foo@bar.com";

      try {
         await u.save();
      } catch (error) {
         console.log('error');
      }

      console.log('User for Tidepool API TEST', u);

      let tide_sample = [
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
     ];

     const results  = await request(nsfi)
     .post('/tpapi/auth/login')
     .auth(u.email,u.site_secret)
     .expect('Content-Type', /json/)
     .expect(200); // .expect('Content-Type', /json/)

     const HEADER = "x-tidepool-session-token";

     const authHeader = results.headers[HEADER]
     const userID = results.body.userid;

     const { body } = await request(nsfi)
     .post('/tpupload/data/' + userID)
     .set({ 'x-tidepool-session-token': authHeader })
     .send(tide_sample)
     .expect('Content-Type', /json/)
     .expect(200);

     body.success.should.equal(1);

   });



});
