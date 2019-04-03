import nsfi from '../nsfi.js';

import request from 'supertest';

let env = nsfi.env;
let Auth = env.userProvider;

let siteid = 'foo';
let pw = 'bar';

describe('NS_REST_API', function () {

   it('should provide the /entries API', async function () {

      const u = await Auth.createUser('1710136', siteid, pw, new Date()); // sub, access_token, refresh_token,token_expiry_date

      console.log('User for ENTRIES API TEST', u);

      /*

      {
  "resourceType": "Patient",
  "id": "1710136",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2019-04-02T11:05:22.302+00:00"
  },
  "text": {
    "status": "generated",
    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody><tr><td>Identifier</td><td>urn:uuid:27e91df0-5537-11e9-8c32-07261c8b74e5</td></tr></tbody></table></div>"
  },
  "identifier": [
    {
      "system": "urn:ietf:rfc:3986",
      "value": "urn:uuid:27e91df0-5537-11e9-8c32-07261c8b74e5"
    }
  ]
}
*/

      let ns_sample = [{
         "_id": "5c655105763fe276981ff0c2"
         , "device": "xDrip-DexcomG5"
         , "date": 1550143850509
         , "dateString": "2019-02-14T13:30:50.509+0200"
         , "sgv": 177
         , "delta": 1.5
         , "direction": "Flat"
         , "type": "sgv"
         , "filtered": 195071.0394182456
         , "unfiltered": 196842.65552921052
         , "rssi": 100
         , "noise": 1
         , "sysTime": "2019-02-14T13:30:50.509+0200"
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

      const u = await Auth.createUser('1710136', siteid, pw, new Date()); // sub, access_token, refresh_token,token_expiry_date

      let ns_sample = [{
         "_id": "5c655105763fe276981ff0c2"
         , "device": "MDT-554"
         , "date": 1550143850509
         , "carbs": 15
         , "created_at": "2019-04-01T11:21:28+03:00"
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
