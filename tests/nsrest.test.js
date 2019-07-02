import request from 'supertest';
import uuidv4 from 'uuid/v4';
import moment from 'moment';

import nsfi from '../lib/server.js';
import _FHIRClient from '../lib/FHIRClient';
import { exist } from '../node_modules/should/should.js';

const env = nsfi.env;
const Auth = env.userProvider;
const siteid = 'foo';
const pw = 'bar';

const fhirserver = "http://hapi.fhir.org/baseDstu3";
const FHIRClient = _FHIRClient(fhirserver, { env });

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


const d = new Date();
const d2 = new Date(d.getTime() + 100000);

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

      const u = await Auth.createUser(patient.id, siteid, pw, d2); // sub, access_token, refresh_token,token_expiry_date

      console.log('User for ENTRIES API TEST', u);

      const now = moment();
      const FIVE_MIN_AGO = moment(now.valueOf() - 60 * 5 * 1000);

      console.log('now() for ENTRIES API TEST', now.valueOf(), now.toISOString());
      console.log('FIVE_MIN_AGO for ENTRIES API TEST', FIVE_MIN_AGO.valueOf(), FIVE_MIN_AGO.toISOString());

      let ns_sample = [{
         "device": "xDrip-DexcomG5",
         "date": now.valueOf(),
         "dateString": now.toISOString(true),
         "sgv": 177,
         "delta": 1.5,
         "direction": "Flat",
         "type": "sgv",
         "filtered": 195071.0394182456,
         "unfiltered": 196842.65552921052,
         "rssi": 100,
         "noise": 1
      }, {
         "device": "xDrip-DexcomG5",
         "date": FIVE_MIN_AGO.valueOf(),
         "dateString": FIVE_MIN_AGO.toISOString(true),
         "sgv": 180,
         "delta": 1.5,
         "direction": "Flat",
         "type": "sgv",
         "filtered": 195071.0394182456,
         "unfiltered": 196842.65552921052,
         "rssi": 100,
         "noise": 1
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
            response.body[0].date.should.equal(now.valueOf());
            response.body[0].sgv.should.equal(177);
            response.body[0].device.should.equal("xDrip-DexcomG5");
         });

   });


   it('should provide date filters on /entries API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, d2); // sub, access_token, refresh_token,token_expiry_date

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
      }, {
         "_id": "5c655105763fe276981ff0c2",
         "device": "xDrip-DexcomG5",
         "date": 1550143851509,
         "dateString": "2019-02-14T13:30:51.509+0200",
         "sgv": 180,
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
         .get('/api/v1/entries?count=1&find\[date\]\[\$eq\]=1550143851509')
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200)
         .then(response => {
            console.log('response.body', response.body);
            response.body[0].date.should.equal(1550143851509);
            response.body[0].sgv.should.equal(180);
            response.body[0].device.should.equal("xDrip-DexcomG5");
         });
   });


   it('should provide the /treatments API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, d2); // sub, access_token, refresh_token,token_expiry_date

      const now = moment();
      const FIVE_MIN_AGO = moment(now.valueOf() - 60 * 5 * 1000);

      let ns_sample = [{
         "device": "MDT-554",
         "date": now.valueOf(),
         "carbs": 15,
         "created_at": now.toISOString(true)
      }, {
         "device": "MDT-554",
         "date": FIVE_MIN_AGO.valueOf(),
         "carbs": 20,
         "created_at": FIVE_MIN_AGO.toISOString(true)
      }];

      console.log('ns_sample for /treatment test', ns_sample);

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
            console.log('response to /treatment query', response.body);
            response.body[0].date.should.equal(now.valueOf());
            response.body[0].carbs.should.equal(15);
            response.body[0].device.should.equal("MDT-554");
         });

   });

   it('should support created_at queries for the /treatments API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, d2); // sub, access_token, refresh_token,token_expiry_date

      let ns_sample = [{
         "_id": "5c655105763fe276981ff0c2",
         "device": "MDT-554",
         "date": 1550143850509,
         "carbs": 15,
         "created_at": "2019-04-01T11:21:28+03:00"
      }, {
         "_id": "5c655105763fe276981ff0c2",
         "device": "MDT-554",
         "date": 1554106889000,
         "carbs": 20,
         "created_at": "2019-04-01T11:21:29+03:00"
      }];

      await request(nsfi)
         .post('/api/v1/treatments')
         .send(ns_sample)
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200);

      await request(nsfi)
         .get('/api/v1/treatments?count=10\&find\[created_at\]\[\$gt\]=2019-01-01T11%3A30%3A17.694Z&find\[created_at\]\[\$lt\]=2019-05-01T11%3A30%3A17.694Z')
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200)
         .then(response => {
            response.body[0].date.should.equal(1554106889000);
            response.body[0].carbs.should.equal(20);
            response.body[0].device.should.equal("MDT-554");
         });

      await request(nsfi)
         .get('/api/v1/treatments?count=10\&find\[created_at\]\[\$lt\]=2019-01-01T11%3A30%3A17.694Z')
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200)
         .then(response => {
            console.log('response.body', response.body);
            response.body.length.should.equal(0);
         });
   });

   it('should provide the /verifyauth API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, d2);

      await request(nsfi)
         .get('/api/v1/verifyauth')
         .expect('Content-Type', /json/)
         .expect(200)
         .then(response => {
            response.body.message.should.equal("UNAUTHORIZED");
         });

      await request(nsfi)
         .get('/api/v1/verifyauth')
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200)
         .then(response => {
            response.body.message.should.equal("OK");
         });
   });

   it('should provide the /devicestatus POST API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, d2);

      await request(nsfi)
         .post('/api/v1/devicestatus')
         .send({ device: "testDevice", status: 1 })
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200);

   });

   it('should provide the /devicestatus GET API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, d2);

      await request(nsfi)
         .get('/api/v1/devicestatus')
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200);

   });

   it('should provide the /status API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, d2);

      await request(nsfi)
         .get('/api/v1/status')
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200);
   });


   it('should provide the /pebble API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, d2);

      await request(nsfi)
         .get('/api/v1/pebble')
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200);
   });
});
