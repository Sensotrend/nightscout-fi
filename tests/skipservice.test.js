import MongoModule from '../lib/Mongo.js';
import nanoid from 'nanoid';
import envModule from '../lib/env';
//import skipService from '../lib/RecordSkipManager';
import should from 'should';

const Mongo = MongoModule();
const env = envModule();
let Auth = env.userProvider;


describe('device last uploaded date service', function () {

   it('should persist profiles', async function () {

      const testData = {
         'testDevice1': new Date("2017-01-26T18:49:35.000Z")
      };

      const patientRef = "abcdefg";
      await env.lastSeenService.updateDates(patientRef, testData);

      const latestDeviceDates = await env.lastSeenService.getLatestDates(patientRef);
      latestDeviceDates.testDevice1.toISOString().should.equal("2017-01-26T18:49:35.000Z");

   });
});
