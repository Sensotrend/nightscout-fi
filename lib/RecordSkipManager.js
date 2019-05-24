import DeviceLatestSeenDate from './models/devicelatestseendate.model.js';

function RecordSkipService (env) {

   const logger = env.logger;

   RecordSkipService.getLatestDates = async function (userId) {

      try {
         const dates = await DeviceLatestSeenDate.findOne({
            user_id: userId
         });

         if (dates) {

            let r = {};

            dates.dates.forEach(function (element) {
               r[element.device_id] = element.newest_recorded_date;
            });

            return r;
         } else {
            return false;
         }
      } catch (error) {
         logger.error('Problem loading device last seen dates from user ' + userId);
         return false;
      }
   };

   RecordSkipService.updateDates = async function (userId, dates) {

      logger.debug('Updating skip dates for user ' + userId);
      try {
         let currentDates = await DeviceLatestSeenDate.findOne({
            user_id: userId
         });

         logger.debug('Current dates ' + currentDates);

         let doSave = false;

         if (!currentDates) {
            logger.info('Skip dates not found, creating');
            currentDates = new DeviceLatestSeenDate({
               user_id: userId,
               dates: []
            });
         }

         for (const newDevice in dates) {

            logger.debug('Checking device ' + newDevice);

            let found = false;

            currentDates.dates.forEach(function (element) {
               if (element.device_id == newDevice) {
                  found = true;
                  if (dates[newDevice] > element.newest_recorded_date) {
                     logger.debug('Device found, updating value to ' + dates[newDevice]);
                     element.newest_recorded_date = dates[newDevice];
                  } else {
                     logger.debug('Device found, skip date was already newer');
                  }
               }
            });

            if (!found) {
               const e = {
                  device_id: newDevice,
                  newest_recorded_date: dates[newDevice]
               };
               logger.debug('Device was not found, adding ' + e);
               currentDates.dates.push(e);
            }
         }

         await currentDates.save();
         logger.info('Saved latest device dates for user ' + userId);

      } catch (error) {
         logger.error('Problem saving device last seen dates from user ' + userId, error);
      }
   };

   return RecordSkipService;
}

export default RecordSkipService;
