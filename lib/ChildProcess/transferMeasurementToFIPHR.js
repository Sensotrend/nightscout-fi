import _FHIRClient from '../FHIRClient';
import BSON from 'bson';
import envModule from '../env';
import FIPHR from '../oauthproviders/FIPHR';
import DatesetTempStorage from '../models/dataSetTempStorage.model';

const env = envModule();
const logger = env.logger;
const DataFormatConverter = env.dataFormatConverter;
const HOW_MANY_INCLUDED_IN_PROSESSING = 2;
const sendDataToFIPHR = [];


function convertObjectToArray(object){
    let objectToArray = [];
    for (const [key, value] of Object.entries(object)) {
        objectToArray.push(JSON.parse(JSON.stringify(value)));
    }
    return objectToArray;
}

async function convertAndSaveToFhir (element) {
    
    return new Promise(async ( resolve, reject ) => {

        await DatesetTempStorage.updateOne({_id: element._id},{ process_date: new Date(), status: 'process' },{ new: true });

        const userId = element.user_id;
        const payload = convertObjectToArray(BSON.deserialize(element.deviceInformation));
        const fiphr = FIPHR(env);

        let user = await env.userProvider.findUserById(userId);

        if (user) {
        logger.info('Processing batch for user ' + userId);

        const token = await fiphr.getAccessTokenForUser(user);

        const FHIRClient = new _FHIRClient(env.FHIRServer, {patient: user.sub, bearertoken: token, env});
        const patientRef = user.sub;

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
            await DatesetTempStorage.updateOne({_id: element._id},{ upload_date: new Date(), process_date: null, status: 'ok' },{ new: true });
            logger.info('Updating update date and status to ok!');
            }
            logger.info('uploadResults is ready');
            resolve(uploadResults);
        } else {
            DatesetTempStorage.updateOne({_id: element._id},{ upload_date: null, error_date: new Date() , status: 'error', how_many_times_try: how_many_times_try - 1 },{ new: true });
            logger.error('Could not load user to process batch, user id ' + userid);
            reject('Could not load user process batch');
        }
    });
 }

async function findDatasetAndSplitSmallParts(){
    return new Promise(async (resolve ,reject) => {
        let tempStorage = await DatesetTempStorage.find({ $or: [{status: 'not_sended'},{status: 'error'}] });
        try{
                let processIsOn = await DatesetTempStorage.find({ status: 'process' });

                console.log(processIsOn);

                if( sendDataToFIPHR.length === 0 && processIsOn.length === 0 ){

                    tempStorage.forEach( async ( element ) => {
                        if( sendDataToFIPHR.length < HOW_MANY_INCLUDED_IN_PROSESSING){
                            sendDataToFIPHR.push(element);
                            logger.info('Add dataset to array!');
                        }    
                    });
                }
                console.log(sendDataToFIPHR.length)
                resolve('Dataset processed')
        }catch(error){
            logger.error('Processing tempStorage ' + error);
            reject('Processing tempStorage ' + error);
        }
    })
 }

async function deleteAllFinishedProcessed(){
    return new Promise(async (resolve ,reject) => {
        try{
            const deleteResult = await DatesetTempStorage.deleteMany({ $or: [{status: 'ok'},{how_many_times_try: 0},{upload_date: { $ne: null}}]}) 
            resolve(deleteResult)
        }catch(error){
        
            logger.error(`Delete collection is null:  ${error}` );
            reject(`Delete collection is null:  ${error}`);
        } 
    });
 }

async function convertAndSave(){
        let promise = [];
        logger.info('Convert and save');
        console.log(sendDataToFIPHR.length);
            try{
                for( let i = 0; i < sendDataToFIPHR.length; ++i){
                        logger.info('For loop')
                        let element = sendDataToFIPHR.shift();
                        logger.info('Start processing convertAndSaveToFhir');
                        promise.push(convertAndSaveToFhir(element));
                }
            }catch(error){
                logger.error(`Problem to processing convertAndSaveToFhir:  ${error}` );
            }
            
            return Promise.all(promise);
 }

 async function initilization(){

        const howManyProcess = await DatesetTempStorage.find({ process_date: {$ne: null} });
        console.log(howManyProcess);
        howManyProcess.forEach( async (element) => {
            await DatesetTempStorage.updateOne({_id: element._id},
                { upload_date: null, process_date: null, create_date: new Date(),
                    status: 'not_sended' },{ new: true });
        })

        if( howManyProcess.length > 0 ){
            logger.info('Found how many process, but state is changed to not sended');
        }{
            logger.info('Not found any process state in how many process');
        }
 }

async function runChildProcesss(){
    return new Promise((resolve, reject) => {
        try{
           setTimeout( async () => {
             logger.info('Split dataset to small part!');
             await findDatasetAndSplitSmallParts();
             logger.info('Start to process dataset and send them to FIPHR!');
             await convertAndSave();
             logger.info('Start to delete a dataset!');

             const deleteResult = await deleteAllFinishedProcessed();
             
             if( deleteResult.deletedCount > 0){
                logger.info(`Delete is complete and how many deleted: ${deleteResult.deletedCount}`);
             }else{
                logger.info('Nothing has been removed!');
             }
             resolve('status ok!');
            },1000);
            
        }catch(error){
            reject(`Error when run child process: ${error}`);
        }
    })
}

 async function run(){

    await initilization();

    logger.info('Initilization complete!');

    while(true){
        //await getDataFromMongoose();
        const val = await runChildProcesss();
        //console.log(val);
    }
 }

 run();
