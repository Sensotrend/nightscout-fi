import { nanoid } from 'nanoid';
import envModule from '../lib/env';
//import skipService from '../lib/RecordSkipManager';
import should from 'should';

const env = envModule();
let Auth = env.userProvider;


describe('device last uploaded date service', function () {


   it('should not find nonexistent profiles', async function () {

      const testData = {
         'testDevice1': new Date("2017-01-26T18:49:35.000Z")
      };

      const patientRef = nanoid();
      
      const latestDeviceDates = await env.lastSeenService.getLatestDates(patientRef);
      
      latestDeviceDates.should.equal(false);

   });

   it('should persist profiles', async function () {

      const testData = {
         'testDevice1': new Date("2017-01-26T18:49:35.000Z")
      };

      const patientRef = nanoid();

      await env.lastSeenService.updateDates(patientRef, testData);

      const latestDeviceDates = await env.lastSeenService.getLatestDates(patientRef);
      
      latestDeviceDates.testDevice1.toISOString().should.equal("2017-01-26T18:49:35.000Z");

   });

   it('should persist and update profiles', async function () {

      const testData = {
         'testDevice1': new Date("2017-01-26T18:49:35.000Z")
      };

      const testData2 = {
         'testDevice1': new Date("2018-01-26T18:49:35.000Z"),
         'testDevice2': new Date("2018-01-26T18:49:35.000Z"),
      };

      const patientRef = nanoid();

      await env.lastSeenService.updateDates(patientRef, testData);

      const latestDeviceDates = await env.lastSeenService.getLatestDates(patientRef);
      
      latestDeviceDates.testDevice1.toISOString().should.equal("2017-01-26T18:49:35.000Z");

      await env.lastSeenService.updateDates(patientRef, testData2);

      const latestDeviceDates2 = await env.lastSeenService.getLatestDates(patientRef);

      latestDeviceDates2.testDevice1.toISOString().should.equal("2018-01-26T18:49:35.000Z");
      latestDeviceDates2.testDevice2.toISOString().should.equal("2018-01-26T18:49:35.000Z");

   });
});
