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
         , "delta": 15
         , "direction": "FortyFiveUp"
         , "type": "sgv"
         , "filtered": 195071.0394182456
         , "unfiltered": 196842.65552921052
         , "rssi": 100
         , "noise": 1
         , "sysTime": "2019-02-14T13:30:50.509+0200"
         }];

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
      records2[0].delta.should.equal(15);
      records2[0].direction.should.equal('FortyFiveUp');
      records2[0].noise.should.equal(1);
      records2[0].date.should.equal(ns_sample[0].date);
   });

   it('should convert Nightscout bolus wizard record to FIPHR and back', async function () {

      let ns_sample = [{
         "device": "MDT-554"
         , "carbs": 15
         , "insulin": 1.3
         , "created_at": "2019-04-01T10:26:23+03:00"
         , "eventType": "Meal Bolus"
      }];

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

      console.log('records2', records2);

      records2[0].carbs.should.equal(15);
      //records2[1].insulin.should.equal(1.3);
      records2[0].created_at.should.equal(ns_sample[0].created_at);
   });


   it('should convert FIPHR data to Tidepool and back', async function () {

      let FHIRCarbEntry = {
         "resourceType": "Observation"
         , "id": "1710920"
         , "meta": {
            "versionId": "1"
            , "lastUpdated": "2019-04-03T13:28:03.727+00:00"
            , "profile": [
             "http://phr.kanta.fi/StructureDefinition/fiphr-sd-macronutrientintake-stu3"
           ]
         }
         , "language": "fi"
         , "text": {
            "status": "generated"
            , "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Arvioitu hiilihydraattimäärä: 15 g<br/>Laite: MDT-554 (via Sensotrend Connect)</div>"
         }
         , "identifier": [
            {
               "system": "urn:ietf:rfc:3986"
               , "value": "urn:uuid:60f706c8-f821-56e5-9980-44dfd40c14e8"
           }
         ]
         , "status": "final"
         , "category": [
            {
               "coding": [
                  {
                     "system": "http://phr.kanta.fi/CodeSystem/fiphr-cs-observationcategory"
                     , "code": "nutrition"
                     , "display": "Ravintosisältö"
               }
             ]
           }
         ]
         , "code": {
            "coding": [
               {
                  "system": "http://loinc.org"
                  , "code": "9059-7"
                  , "display": "Arvioitu hiilihydraattimäärä"
             }
           ]
         }
         , "subject": {
            "reference": "Patient/1710136"
         }
         , "effectiveDateTime": "2019-04-01T11:21:28.000+03:00"
         , "issued": "2019-04-01T11:21:28.000+03:00"
         , "performer": [
            {
               "reference": "Patient/1710136"
           }
         ]
         , "valueQuantity": {
            "value": 15
            , "unit": "g"
            , "system": "http://unitsofmeasure.org"
            , "code": "g"
         }
      };


      let options = {
         source: 'fiphr'
         , target: 'tidepool'
         , FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records = await DataConverter.convert(FHIRCarbEntry, options);

      console.log('FHIR TO TIDE', records);

      options = {
         source: 'tidepool'
         , target: 'fiphr'
         , FHIR_userid: '756cbc1a-550c-11e9-ada1-177bad63e16d' // Needed for FHIR conversion
      };

      let records2 = await DataConverter.convert(records, options);

      console.log('TIDE TO FHIR', records2);


      records2[0].effectiveDateTime.should.equal(FHIRCarbEntry.effectiveDateTime);

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
       }];


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
      records2[0].sgv.should.equal(177);
   });
});
