import request from 'supertest';
import uuidv4 from 'uuid/v4';
import moment from 'moment';

import nsfi from '../lib/server.js';
import _FHIRClient from '../lib/FHIRClient';

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
      const FIVE_MIN_AGO = moment(now.valueOf() - 60*5*1000);

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
         "sysTime": "2019-02-14T13:30:51.509+0200"
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

   it('should provide date filters and count limit on /entries API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, d2); // sub, access_token, refresh_token,token_expiry_date

      let ns_sample = [
         {"device":"xDrip-LimiTTer","date":1584971679705,"dateString":"2020-03-23T15:54:39.705+0200","sgv":156,"delta":11.074,"direction":"SingleUp","type":"sgv","filtered":155176.45895,"unfiltered":155176.45895,"rssi":100,"noise":1,"sysTime":"2020-03-23T15:54:39.705+0200"},
         {"device":"xDrip-LimiTTer","date":1584971979813,"dateString":"2020-03-23T15:59:39.813+0200","sgv":168,"delta":12.092,"direction":"SingleUp","type":"sgv","filtered":166235.28165,"unfiltered":166235.28165,"rssi":100,"noise":1,"sysTime":"2020-03-23T15:59:39.813+0200"},
         {"device":"xDrip-LimiTTer","date":1584972280018,"dateString":"2020-03-23T16:04:40.018+0200","sgv":176,"delta":7.844,"direction":"FortyFiveUp","type":"sgv","filtered":173411.7517,"unfiltered":173411.7517,"rssi":100,"noise":1,"sysTime":"2020-03-23T16:04:40.018+0200"},
         {"device":"xDrip-LimiTTer","date":1584972579734,"dateString":"2020-03-23T16:09:39.734+0200","sgv":182,"delta":5.539,"direction":"FortyFiveUp","type":"sgv","filtered":178470.57484999998,"unfiltered":178470.57484999998,"rssi":100,"noise":1,"sysTime":"2020-03-23T16:09:39.734+0200"},
         {"device":"xDrip-LimiTTer","date":1584972879642,"dateString":"2020-03-23T16:14:39.642+0200","sgv":181,"delta":-0.901,"direction":"Flat","type":"sgv","filtered":177647.04549999998,"unfiltered":177647.04549999998,"rssi":100,"noise":1,"sysTime":"2020-03-23T16:14:39.642+0200"},
         {"device":"xDrip-LimiTTer","date":1584973179456,"dateString":"2020-03-23T16:19:39.456+0200","sgv":183,"delta":1.545,"direction":"Flat","type":"sgv","filtered":179058.8101,"unfiltered":179058.8101,"rssi":100,"noise":1,"sysTime":"2020-03-23T16:19:39.456+0200"},
         {"device":"xDrip-LimiTTer","date":1584973479565,"dateString":"2020-03-23T16:24:39.565+0200","sgv":178,"delta":-4.759,"direction":"Flat","type":"sgv","filtered":174705.86925,"unfiltered":174705.86925,"rssi":100,"noise":1,"sysTime":"2020-03-23T16:24:39.565+0200"},
         {"device":"xDrip-LimiTTer","date":1584973779574,"dateString":"2020-03-23T16:29:39.574+0200","sgv":168,"delta":-9.393,"direction":"FortyFiveDown","type":"sgv","filtered":166117.6346,"unfiltered":166117.6346,"rssi":100,"noise":1,"sysTime":"2020-03-23T16:29:39.574+0200"},
         {"device":"xDrip-LimiTTer","date":1584974079485,"dateString":"2020-03-23T16:34:39.485+0200","sgv":158,"delta":-10.684,"direction":"SingleDown","type":"sgv","filtered":156352.92945,"unfiltered":156352.92945,"rssi":100,"noise":1,"sysTime":"2020-03-23T16:34:39.485+0200"},
         {"device":"xDrip-LimiTTer","date":1584974516551,"dateString":"2020-03-23T16:41:56.551+0200","sgv":135,"delta":-11.067,"direction":"Flat","type":"sgv","filtered":135647.04864999998,"unfiltered":135647.04864999998,"rssi":100,"noise":0,"sysTime":"2020-03-23T16:41:56.551+0200"},
         {"device":"xDrip-LimiTTer","date":1584974816551,"dateString":"2020-03-23T16:46:56.551+0200","sgv":120,"delta":-11.067,"direction":"Flat","type":"sgv","filtered":121882.34379999999,"unfiltered":121882.34379999999,"rssi":100,"noise":0,"sysTime":"2020-03-23T16:46:56.551+0200"},
         {"device":"xDrip-LimiTTer","date":1584975116551,"dateString":"2020-03-23T16:51:56.551+0200","sgv":105,"delta":-11.067,"direction":"Flat","type":"sgv","filtered":108235.286,"unfiltered":108235.286,"rssi":100,"noise":0,"sysTime":"2020-03-23T16:51:56.551+0200"},
         {"device":"xDrip-LimiTTer","date":1584975956551,"dateString":"2020-03-23T17:05:56.551+0200","sgv":67,"delta":-11.067,"direction":"SingleDown","type":"sgv","filtered":73176.4651,"unfiltered":73176.4651,"rssi":100,"noise":1,"sysTime":"2020-03-23T17:05:56.551+0200"},
         {"device":"xDrip-LimiTTer","date":1584976256551,"dateString":"2020-03-23T17:10:56.551+0200","sgv":57,"delta":-11.067,"direction":"SingleDown","type":"sgv","filtered":63882.34815,"unfiltered":63882.34815,"rssi":100,"noise":1,"sysTime":"2020-03-23T17:10:56.551+0200"},
         {"device":"xDrip-LimiTTer","date":1584976556551,"dateString":"2020-03-23T17:15:56.551+0200","sgv":45,"delta":-11.067,"direction":"SingleDown","type":"sgv","filtered":53764.70185,"unfiltered":53764.70185,"rssi":100,"noise":1,"sysTime":"2020-03-23T17:15:56.551+0200"}
      ];

      const now = new Date().getTime();
      ns_sample.forEach((s, i) => {
         const time = new Date(now - (ns_sample.length - i) * 300000);
         s.date = time.getTime();
         s.dateString = time.toISOString();
         s.sysTime = time.toISOString();
      })


      await request(nsfi)
         .post('/api/v1/entries')
         .send(ns_sample)
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200);

      console.log('SENT SAMPLE XXXXXXXXXXXXXXXXX', ns_sample);
         
      await request(nsfi)
         .get('/api/v1/entries/sgv.json?count=6') // This is what the Nightscout OSX menubar app queries for
         .set({ 'api-secret': u.site_secret, 'Accept': 'application/json' })
         .expect('Content-Type', /json/)
         .expect(200)
         .then(response => {
            console.log('response.body', response.body);
            response.body.length.should.equal(6);
            response.body[0].date.should.be.a.Number().above(response.body[1].date).and.aboveOrEqual(1584976556551);
         });
   });



   it('should provide the /treatments API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, d2); // sub, access_token, refresh_token,token_expiry_date

      const now = moment();
      const FIVE_MIN_AGO = moment(now.valueOf() - 60*5*1000);

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

   it('should provide the /devicestatus API', async function () {

      const u = await Auth.createUser(patient.id, siteid, pw, d2);

      await request(nsfi)
         .post('/api/v1/devicestatus')
         .send({ device: "testDevice", status: 1 })
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
