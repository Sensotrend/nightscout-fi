import _FHIRClient from '../FHIRClient';
import BSON from 'bson';
import DatesetTempStorage from '../models/dataSetTempStorage.model';
import envModule from '../env';
import FIPHR from '../oauthproviders/FIPHR';


const env = envModule();
const logger = env.logger;
const DataFormatConverter = env.dataFormatConverter;

function convertObjectToArray(object){
    let tempArray = [];
    for (const [key, value] of Object.entries(object)) {
        tempArray.push(JSON.parse(JSON.stringify(value)));
    }
    return tempArray;
}


async function convertAndSaveToFhir (element) {

    const userId = element.user_id;
    const payload = convertObjectToArray(BSON.deserialize(element.deviceInformation));
    const fiphr = FIPHR(env);

    let u = await env.userProvider.findUserById(userId);

    if (u) {
       logger.info('Processing batch for user ' + userId);

       const token = await fiphr.getAccessTokenForUser(u);

       const FHIRClient = new _FHIRClient(env.FHIRServer, {patient: u.sub, bearertoken: token, env});
       const patientRef = u.sub;

       const options = {
          source: 'tidepool',
          target: 'fiphr',
          FHIR_userid: patientRef // Needed for FHIR conversion
       };
     
       if (process.env.SKIP_OLD_RECORDS === 'TRUE') {
          const latestDeviceDates = await env.lastSeenService.getLatestDates(patientRef);
          if (latestDeviceDates) { options.skipRecordsUsingDates = latestDeviceDates; }
       }

       const records = await DataFormatConverter.convert(payload, options);

       logger.info('Got records for uploading, count:' + records.length);
       
       let uploadResults;

       if (records.length > 0) {

          try {
             uploadResults = await FHIRClient.createRecords(records);
          } catch (error) {
             logger.info(error);
          }
          
          logger.info('Converted and uploaded records: ' + JSON.stringify(uploadResults.created));

          if (process.env.SKIP_OLD_RECORDS === 'TRUE') {
             logger.info('Updating device dates ' + uploadResults.latestDates);
             env.lastSeenService.updateDates(patientRef, uploadResults.latestDates);
          }
       }
       logger.info(`uploadResults: ${JSON.stringify(uploadResults)}`);
       if( uploadResults !== null){
           await DatesetTempStorage.updateOne({_id: element._id},{ upload_date: new Date(), status: 'ok' },{ new: true });
           logger.info('Updating update date and status to ok!');
       }

        return uploadResults;
    } else {
        DatesetTempStorage.updateOne({_id: element._id},{ upload_date: null, status: 'error', how_many_times_try: how_many_times_try - 1 },{ new: true });
        logger.error('Could not load user to process batch, user id ' + userid);
        return false;
    }
 }

 async function childProcess(){
    const tempStorage = await DatesetTempStorage.find({ $or: [{status: 'not_sended'},{status: 'error'}]});
    console.log(tempStorage);
    if( tempStorage.length === 0){
        setTimeout(childProcess,1000);
    }else{

        try{
        tempStorage.forEach( async ( element ) => {
        
            await convertAndSaveToFhir(element);

        });
        }catch(error){
            logger.error('Processing tempStorage ' + error);
        }
    }
    
    try{
        const deleteValue = await DatesetTempStorage.deleteMany({ $or: [{status: 'ok'},{how_many_times_try: 0},{upload_date: { $ne: null}}]})
        
        if( deleteValue.length > 0 ){
            deleteValue.forEach( (value) => {
                logger.info(value);
            });
        }
        logger.info('Child process end!');
    }catch(error){
        logger.error(`Delete collection is null:  ${error}` );

    } 
    setTimeout(childProcess,4000);
 }

 childProcess();