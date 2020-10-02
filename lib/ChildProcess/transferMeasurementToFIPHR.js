import _FHIRClient from '../FHIRClient';
import BSON from 'bson';
import envModule from '../env';
import FIPHR from '../oauthproviders/FIPHR';
import DatesetTempStorage from '../models/dataSetTempStorage.model';
import DatesetProcessingInfo from '../models/dataSetProcessingInfo.model';
import os from 'os';
import {performance, PerformanceObserver} from 'perf_hooks';

const env = envModule();
const logger = env.logger;
const DataFormatConverter = env.dataFormatConverter;
const childHostname = os.hostname();

logger.info(`Process started computer ${childHostname}`);

function convertObjectToArray(object){
    let objectToArray = [];
    for (const [key, value] of Object.entries(object)) {
        objectToArray.push(JSON.parse(JSON.stringify(value)));
    }
    return objectToArray;
}

const processId = process.pid;

async function convertAndSaveToFhir (datasetProcess, element, callback) {
    
        try{
            performance.mark('Beginning convertAndSaveToFhir');
            await DatesetProcessingInfo.updateOne({_id: datasetProcess._id },{process_time: new Date()});

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
                
                    if (process.env.SKIP_OLD_RECORDS === 'TRUE') {
                        logger.info('Updating device dates ' + uploadResults.latestDates);
                        env.lastSeenService.updateDates(patientRef, uploadResults.latestDates);
                    }
                }

                if( uploadResults !== null){
                    logger.info('Updating update date and status to ok!');
                }

                logger.info('uploadResults is ready');
                
                performance.mark('Ending runChildProcess');
                performance.measure('Process running', 'Beginning convertAndSaveToFhir', 'Ending convertAndSaveToFhir');
                callback({'uploadResults': uploadResults, 'handledResultId': element._id})

            } else {
                    logger.error('Could not load user to process batch, user id ' + userid);
            }      
        }
        catch(error){
            logger.error(`Two instance is try to make changes ${error}`);
        }
 }

async function convertAndSave(){
        
        let convertAndTime = setTimeout(async () => {
        
            clearTimeout(convertAndTime);
            
            const processAndDataset = await DatesetProcessingInfo.findOne({hostname: childHostname, pid: processId });

            if(processAndDataset === null){
                throw new Error('Process and dataset is null!');
            }

            if( processAndDataset.process_time !== undefined ){
                if( processAndDataset.process_time !== null  ){
                    logger.info('The process is set up to handling dataset!');
                    return;
                }
            }

            const dataset = await DatesetTempStorage.findOne({_id: processAndDataset.dataset_temp_storage_id});

            logger.info('Convert and save');

                try{
                    if( dataset !== null ){
                        logger.info(`Before corvert and save!`)

                        await convertAndSaveToFhir(processAndDataset,dataset,async (handledDataset) =>{
                            await DatesetTempStorage.deleteOne({_id: handledDataset.handledResultId});
                            await DatesetProcessingInfo.deleteOne(
                                {dataset_temp_storage_id: handledDataset.handledResultId
                            });

                            logger.info(`After (This will delete processed datasets.) convert and save.`);
                        });
                        
                    }else{
                        logger.info(`Dataset is deleted`);
                    }
                }catch(error){
                    logger.error(`Problem to processing convertAndSaveToFhir: ${error}` );
                }
        },1000); 
 }

async function getDatasetToProcess(){

            const tempIdInProcessingInfo = await DatesetProcessingInfo.find({hostname: childHostname});

            const tempIdInProcessing = tempIdInProcessingInfo !== null ? tempIdInProcessingInfo
            .map((element ) => element.dataset_temp_storage_id) : [];

            logger.info(`TempIdInProsessingInfo collection row length: ${tempIdInProcessingInfo.length}`);
            
            const freeDataset =  await DatesetTempStorage.findOne({
                _id: {
                        $nin: tempIdInProcessing,
                 },        
            });

            if( freeDataset === null ){
                throw new Error('FreeDataset is null');
            }

            const findProcessDataset = await DatesetProcessingInfo.findOne({hostname: childHostname,pid: processId});

            if( findProcessDataset === null){
                const datasetToProcessIn = new DatesetProcessingInfo(
                {
                                dataset_temp_storage_id: freeDataset._id,
                                pid: processId,
                                hostname: childHostname
                });
                const saveDatasetToProcessom = await datasetToProcessIn.save();
                logger.info(`dataset saved: ${saveDatasetToProcessom}`);
            }else{
                logger.error(`The process is handling dataset!`);
            }
}

async function checkTempProcessLifeTime(){
    
    const tempIdInProcessingInfo = await DatesetProcessingInfo.find({hostname: childHostname,
        start_to_handle_date: {
            $lte:  new Date().getTime() - (30*60*1000)
        }
    });

    logger.info(`Old tempIdInProcessing elements info before delete: ${tempIdInProcessingInfo}`);

    tempIdInProcessingInfo.forEach( async (element) => {
        try{
            await DatesetProcessingInfo.findOneAndDelete({_id: element._id});
            logger.info(`Delete tempIdInProcessing element is ready`);
        }catch(error){
            logger.error(`Error when delete tempIdInProcessing element: ${element}`);
        }
    });
}

async function runChildProcesss(){
    
        try{

            await checkTempProcessLifeTime();

            await getDatasetToProcess();
            
            await convertAndSave();
            
        }catch(error){
            logger.error(`Error info: ${error}`);
        }
  
}

 async function run(){  
    
    setInterval(async () => {

        await runChildProcesss();

    },  Math.floor(Math.random() * 1000) * 3 + 1200);

 }
 run();

 // Activate the observer
const obs = new PerformanceObserver((list) => {
    const entry = list.getEntries()[0]
    console.log(`Processid: ${processId} ,time for ('${entry.name}')`, entry.duration);
    performance.clearMarks();
  });
  obs.observe({ entryTypes: ['measure'], buffered: true});  //we want to react to full measurements and not individual marks
  