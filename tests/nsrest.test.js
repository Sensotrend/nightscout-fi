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

describe('NS_REST_API & FHIRClient test', function () {

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

   it('should provide the /entries API to load sample data', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, new Date()); // sub, access_token, refresh_token,token_expiry_date

      console.log('User for ENTRIES API TEST', u);

      let ns_sample = [{
         "_id": "5c655105763fe276981ff0c2",
         "device": "xDrip-DexcomG5",
         "date": 1550143850509,
         "dateString": "2019-02-14T13:30:50.509+0200",
         "sgv": 177,
         "delta": 1.5,
         "direction": "Flat",
         "type": "sgv",
         "filtered": 195071.0394182456,
         "unfiltered": 196842.65552921052,
         "rssi": 100,
         "noise": 1,
         "sysTime": "2019-02-14T13:30:50.509+0200"
      }];

      await request(nsfi)
         .post('/api/v1/entries')
         .send(ns_sample)
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200);

      await request(nsfi)
         .get('/api/v1/entries')
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200)
         .then(response => {
            console.log('response.body', response.body);
            response.body[0].sgv.should.equal(177);
         });
   });


   it('should provide the /treatments API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, new Date()); // sub, access_token, refresh_token,token_expiry_date

      let ns_sample = [{
         "_id": "5c655105763fe276981ff0c2",
         "device": "MDT-554",
         "date": 1550143850509,
         "carbs": 15,
         "created_at": "2019-04-01T11:21:28+03:00"
   }];

      await request(nsfi)
         .post('/api/v1/treatments')
         .send(ns_sample)
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200);

      await request(nsfi)
         .get('/api/v1/treatments')
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200)
         .then(response => {
            console.log('response.body', response.body);
            response.body[0].carbs.should.equal(15);
         });
   });

});
