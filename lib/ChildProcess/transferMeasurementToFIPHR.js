import _FHIRClient from '../FHIRClient';
import BSON from 'bson';
import envModule from '../env';
import FIPHR from '../oauthproviders/FIPHR';
import DatesetTempStorage from '../models/dataSetTempStorage.model';
import os from 'os';

const env = envModule();
const logger = env.logger;
const DataFormatConverter = env.dataFormatConverter;
const HOW_MANY_INCLUDED_IN_PROSESSING = 5;
const masterIdForComputer = process.env.MASTER_ID;

logger.info(`Process started computer ${masterIdForComputer}`);

function convertObjectToArray(object){
    let objectToArray = [];
    for (const [key, value] of Object.entries(object)) {
        objectToArray.push(JSON.parse(JSON.stringify(value)));
    }
    return objectToArray;
}

const processId = process.pid;

async function convertAndSaveToFhir (element) {

        const session = await DatesetTempStorage.startSession();
        session.startTransaction();

        try{
            await DatesetTempStorage.updateOne({_id: element._id},{masterId: masterIdForComputer, pid:processId, process_date: new Date(), status: 'process' },
            { new: true, session: session });

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
                    await DatesetTempStorage.updateOne({_id: element._id},{ upload_date: new Date(), process_date: null, status: 'ok' },{ new: true, session: session });
                    logger.info('Updating update date and status to ok!');
                }
                logger.info('uploadResults is ready');
                
                await session.commitTransaction();
                session.endSession();

                return uploadResults;
            } else {
                    DatesetTempStorage.updateOne({_id: element._id},{ upload_date: null, error_date: new Date() , status: 'error', how_many_times_try: how_many_times_try - 1 },{ new: true, session: session });
                    logger.error('Could not load user to process batch, user id ' + userid);
                await session.commitTransaction();
                session.endSession();
            }

               
        }
        catch(error){
            session.endSession();
            logger.error(`Two instance is try to make changes ${error}`);
        }
 }

async function findDatasetAndSplitSmallParts(){

            const session = await DatesetTempStorage.startSession();
            session.startTransaction();

            try{
               
                    const filter = {masterId: {$eq: null}, pid: {$eq: null}, $or: [{status: 'not_sended'},{status: 'error'}] };

                    const tempStorageAggregate = await DatesetTempStorage.aggregate([{
                    $match: filter}, {$limit: HOW_MANY_INCLUDED_IN_PROSESSING}
                    ]).session(session);

                    const tempStorageLock = tempStorageAggregate.map((elem) => elem._id);

                    await DatesetTempStorage.updateMany({
                        _id: {$in: tempStorageLock }
                    },{pid: processId, masterId: masterIdForComputer}).session(session);
                    
                    const tempStorage = await DatesetTempStorage.find({_id: {$in: tempStorageLock}}).session(session);
                    
                    await session.commitTransaction();
                    session.endSession();

                    return tempStorage;
             
            }catch(error){
                session.endSession();
                logger.error(`Mongoose write error: ${error}`);
            }    
 }

async function deleteAllFinishedProcessed(){
        
    try{

        const deleteResult = await DatesetTempStorage.deleteMany(
            { pid: processId,masterId: masterIdForComputer, $or: [{status: 'ok'},{how_many_times_try: 0},{upload_date: { $ne: null}}
        ]});

        return deleteResult;

        }catch(error){
            logger.error(`Delete collection is null:  ${error}` );
        } 
 }

async function convertAndSave(datasets){
        const promise = [];
        logger.info('Convert and save');

            try{
                datasets.forEach((element) => {
                    logger.info('Start processing convertAndSaveToFhir');
                    promise.push(convertAndSaveToFhir(element));
                });  
            }catch(error){
                logger.error(`Problem to processing convertAndSaveToFhir: ${error}` );
            }
            
            return Promise.all(promise);
 }

 async function initilization(){
        
        const session = await DatesetTempStorage.startSession();
        session.startTransaction();
        
        try{
           
            const findProcessExists =  await DatesetTempStorage.find({ masterId: masterIdForComputer, process_date: {$ne: null}}).session(session);

            let processNotExists = findProcessExists.map((element) => {
                if (checkProcessIsExists(element.pid) === false) {
                    return element.pid;
                }
            });

            logger.info(processNotExists);
            if( processNotExists.length > 0 ){
            const updateDataSetProcessPidToNull = await DatesetTempStorage.updateMany(
                { process_date: {$ne: null},pid: { $in: processNotExists }},
                { pid: null,masterId: masterIdForComputer }
            ).session(session);
           
            logger.info(`Update dataset process pid to null: ${JSON.stringify(updateDataSetProcessPidToNull)}`);
            }
            
            const howManyProcess = await DatesetTempStorage.find({ process_date: {$ne: null}, pid: { $eq: null}, masterId: masterIdForComputer }
                ).session(session);
            
            const howManyProcessId = howManyProcess.map((elem) => elem._id);

            await DatesetTempStorage.updateMany({ _id: {$in: howManyProcessId }},
               { upload_date: null, process_date: null, create_date: new Date(),
                status: 'not_sended', pid: processId,
            masterId: masterIdForComputer}).session(session);

            await session.commitTransaction();
            session.endSession();
            logger.info('Session end!');
            

            if( howManyProcess.length > 0 ){
                logger.info('Found how many process, but state is changed to not sended');
            }{
                logger.info('Not found any process state in how many process');
            }

        }catch(error){
            session.endSession();
            logger.error('Error when two instance try changes values same time')
        }

 }

async function runChildProcesss(){
        try{
         
             logger.info('Split dataset to small part!');
             const datasets =  await findDatasetAndSplitSmallParts();
            
             logger.info(`Dataset is now out: ${datasets}`);
             logger.info('Start to process dataset and send them to FIPHR!');
             if( datasets !== undefined){
                await convertAndSave(datasets);
             }else{
                 throw Error('Datasets is undefined');
             }
             logger.info('Start to delete a dataset!');

             const deleteResult = await deleteAllFinishedProcessed();
             
             if( deleteResult.deletedCount > 0){
                logger.info(`Delete is complete and how many deleted: ${deleteResult.deletedCount}`);
             }else{
                logger.info('Nothing has been removed!');
             }
             
             return 'status ok!';
            
        }catch(error){
            logger.error(`Error when run child process: ${error}`);
        }
  
}

 async function run(){  
    try{
        await initilization();
    }catch(error){
        logger.error(`Error when two instance try to edit same result: ${error}`)
    }

    logger.info('Initilization complete!');

   let interval = setInterval(async () => {
        await runChildProcesss();
    },  Math.floor(Math.random() * 1000) * 3 + 800);

 }
 run();

 function checkProcessIsExists(pid){
    try{
        return os.getPriority(pid) === 0;
    }catch(error){
        return false;
    }
 }