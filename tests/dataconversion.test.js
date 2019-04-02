import _DataConverter from '../lib/DataFormatConverter';
import should from 'should';

const DataConverter = _DataConverter();

describe('convert_data', function () {

   it('should convert Nightscout CGM record to FIPHR and back', async function () {

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
   });


   it('should convert Nightscout bolus wizard record to FIPHR and back', async function () {

      let ns_sample = [{
            "device": "MDT-554"
            , "date": 1550143850509
            , "carbs": 15
            , "insulin": 1.3
            , "created_at": "2019-04-01T10:26:23+03:00"
            , "eventType": "Meal Bolus"
  }
  ];
      let options = {
         source: 'nightscout'
         , target: 'fiphr'
         , datatypehint: 'treatments'
         , FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(ns_sample, options);

      options = {
         source: 'fiphr'
         , target: 'nightscout'
         , datatypehint: 'treatments'
         , FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(records, options);

      records2[0].carbs.should.equal(15);
      records2[1].insulin.should.equal(1.3);
   });


   it('should convert Nightscout data to Tidepool and back', async function () {

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
         , target: 'tidepool'
         , datatypehint: 'entries'
         , FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(ns_sample, options);

      console.log('records', records);

      options = {
         source: 'tidepool'
         , target: 'nightscout'
         , datatypehint: 'entries'
         , FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(records, options);

      console.log('records2', records2);


      records2[0].sgv.should.equal(177);
   });



});
