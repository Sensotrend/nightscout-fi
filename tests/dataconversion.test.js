'use strict';

import _DataConverter from '../lib/DataFormatConverter';
const DataConverter = _DataConverter();

import should from 'should';

describe('convert_data', function () {

   it('should convert Nightscout data to FIPHR and back', async function () {

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
         }
    ];


      let options = {
         source: 'nightscout'
         , target: 'fiphr'
         , datatypehint: 'entries'
         , FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(ns_sample, options);

      options = {
         source: 'fiphr'
         , target: 'nightscout'
         , datatypehint: 'entries'
         , FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(records, options);

      records2[0].sgv.should.equal(177);


      //Auth.decryptRefreshToken(u7).should.equal('barx');

   });

});
