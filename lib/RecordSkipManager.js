import Mongo from './Mongo';
import DeviceLatestSeenDate from './models/devicelatestseendate.model.js';


function RecordSkipService (env) {

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
         console.error('Problem loading device last seen dates from user', userId);
         return false;
      }
   };

   RecordSkipService.updateDates = async function (userId, dates) {

      console.log('Updating skip dates for user', userId);
      try {
         let currentDates = await DeviceLatestSeenDate.findOne({
            user_id: userId
         });

         console.log('Current dates', currentDates);

         let doSave = false;

         if (!currentDates) {
            console.log('Skip dates not found, creating');
            currentDates = new DeviceLatestSeenDate({
               user_id: userId,
               dates: []
            });
         }

         for (const newDevice in dates) {

            console.log('Checking device', newDevice);

            let found = false;

            currentDates.dates.forEach(function (element) {
               if (element.device_id == newDevice) {
                  found = true;
                  if (dates[newDevice] > element.newest_recorded_date) {
                     console.log('Device found, updating value to ', dates[newDevice]);
                     element.newest_recorded_date = dates[newDevice];
                  } else {
                     console.log('Device found, skip date was already newer');
                  }
               }
            });

            if (!found) {
               const e = {
                  device_id: newDevice,
                  newest_recorded_date: dates[newDevice]
               };
               console.log('Device was not found, adding ', e);
               currentDates.dates.push(e);
            }
         }

         await currentDates.save();
         console.log('Saved latest device dates for user', userId);

      } catch (error) {
         console.error('Problem saving device last seen dates from user', userId, error);
      }
   };

   return RecordSkipService;
}

export default RecordSkipService;
