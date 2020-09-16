import MongoStoreProvider from 'connect-mongo';
import {encrypt,decrypt} from './crypto';
import { Console } from 'console';
import { carelink, logger as carelinkLogger, transform } from 'minimed-connect-to-nightscout';
import CarelinkInformation from './models/carelink.model';
import CarelinkProcess  from './models/carelinkProcess.model';

const TEST = process.env.NODE_ENV === 'development' && ENABLE_TEST;

const INTERVAL = TEST ? 10*1000 : 5*60*1000;

const MAX_ENTRIES = 600;

const MAX_RETRY_DURATION = 32;

const VERBOSE = process.env.VERBOSE_LOG && (process.env.VERBOSE_LOG.toLowerCase() !== 'false');

const STORE_RAW_DATA = true;

const logger = {
  log: function log(...args) {
    console.log(new Date().toISOString(), ...args);
  },
  error: function error(...args) {
    console.error(new Date().toISOString(), ...args);
  }
};

function getAccountLogger(account) {
    return {
      log: function(...args) {
        console.log(new Date().toISOString(), account.username, ...args);
      },
      error: function(...args) {
        console.error(new Date().toISOString(), account.username, ...args);
      }
    };
  }

  /*
  function getClient(user) {
    const { username, password } = user;
    const options = {
      username,
      password,
      sgvLimit: MAX_ENTRIES,
      interval: INTERVAL,
      maxRetryDuration: MAX_RETRY_DURATION,
      verbose: VERBOSE,
      storeRawData: STORE_RAW_DATA,
    };
    const client = carelink.Client(options);
    carelinkLogger.setVerbose(VERBOSE);
    return client;
  }

 

  function fetchAccountData(account) {
    const accountLogger = getAccountLogger(account);
    const now = new Date().getTime();
    return new Promise(function executor(resolve, reject) {
      if (account.latestEntryDate > now) {
        // Fetch has been postponed
        reject(POSTPONED);
        return;
      }
      try {
        account.client.fetch(function handleCarelinkData(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      } catch (error) {
        accountLogger.error(error);
        reject(error);
      }
    })
    .then((data) => {
      if (!TEST || VERBOSE) {
        accountLogger.log('Got data', JSON.stringify(data));
      }
      return data;
    })
    .then((data) => {
      // Work around minimed-connect-to-nightscout stale data restriction
      const recency =
        (data['currentServerTime'] - data['lastMedicalDeviceDataUpdateServerTime']) / (60 * 1000);
      if (recency > 20) {
        accountLogger.log('Stale data, modifying for minimed-connect-to-nightscout transform');
        data['lastMedicalDeviceDataUpdateServerTime'] = data['currentServerTime'];
      }
      return data;
    })
    .then(data => transform(data, MAX_ENTRIES))
    .then((transformed) => {
      if (!TEST || VERBOSE) {
        accountLogger.log('Transformed data', JSON.stringify(transformed));
      }
      return transformed;
    })
    .then(transformed => transformed.entries.filter(e => !(e.date <= account.latestEntryDate)))
    .then((newEntries) => {
      if (!TEST || VERBOSE) {
        accountLogger.log(`Transformed ${newEntries.length} entries`, JSON.stringify(newEntries));
      } else {
        accountLogger.log('Identified added entries', JSON.stringify(newEntries.length));
      }
      return newEntries;
    })
    .then(newEntries => newEntries.sort(dateComparator))
    .then(newEntries => DataFormatConverter.convert(newEntries, account.converterOptions))
    .then((converted) => {
      if (!TEST || VERBOSE) {
        accountLogger.log('Converted entries to FHIR', JSON.stringify(converted));
      }
      return converted;
    })
    .then((converted) => {
      const sent = [];
      const sendRequests = converted.map((entry, i) => {
        if (!TEST || VERBOSE) {
          accountLogger.log('Prepared FHIR resource', entry);
        }
        accountLogger.log(`Sending entry ${i+1}/${converted.length} to ${UPLOAD_URL}...`);
        return post(entry)
        .then(function (response) {
          const { status } = response;
          accountLogger.log(`POSTed entry ${i+1}/${converted.length}. Status: ${status}.`);
        })
        .then(() => {
          sent.push(entry);
          return entry;
        })
        .catch((error) => {
          const errorMessage = (error.response && `Status ${error.response.status}`)
          || (error.request && `No response, ${error.message}`)
          || error.message
          || error;
          accountLogger.error(`Failed to upload entry ${i}: ${errorMessage}.`);
          if (VERBOSE) {
            // We don't necessarily need this even in production environment
            accountLogger.error(error);
          }
          return errorMessage;
        });
      });
      return Promise.all(sendRequests)
      .then(() => sent);
    })
    .then((sent) => {
      if (sent.length) {
        // Since we send the entries in parallel, this may not be the latest date
        const times = sent.map(e => new Date(e.effectiveDateTime).getTime()).sort((a, b) => b - a);
        account.latestEntryDate = times[0];
        accountLogger.log(
          'Updated latest entry time',
          account.latestEntryDate,
          new Date(account.latestEntryDate),
        );
      } else {
        accountLogger.log('No new entries');
      }
      return sent;
    })
    .then((sent) => {
      return `Added ${sent.length} entries for ${account.username}`;
    })
    .catch((error) => {
      accountLogger.error(`Error adding entries for ${account.username}`);
  
      if (VERBOSE || (error !== POSTPONED)) {
        accountLogger.error(error);
      }
  
      if (error === POSTPONED) {
        const postponeMessage = `Fetch postponed for ${account.username} until ${
          new Date(account.latestEntryDate).toISOString()
        }.`
        accountLogger.log(postponeMessage);
        return postponeMessage;
      }
  
      // It seems the accounts get 403 from CareLink for some time when initially created
      const status = error && (error.statusCode
        || ((error.message && error.message.indexOf('"statusCode":403') > 0) && 403));
      if (status === 403) {
        accountLogger.log('Got 403 from CareLink, postponing...');
        account.latestEntryDate = new Date().getTime() + HTTP_403_POSTPONE_TIME;
      }
  
      return `Error adding entries for ${account.username}: ${
        status ? `HTTP ${status}` : (error.message || error.statusCode || error)
      }`;
    })
    .catch((error) => {
      console.error('Got an error when processing errors.');
      console.error(error);
      return `Error adding entries for ${account.username}.`;
    });
  }

*/

  async function testi(user){
   
    return new Promise(function( resolve, reject ) {
        setTimeout(function(){ resolve(user)}, Math.random() * 4000 +1000);
    });
  }



async function createCareLinkConnect(userInformation){
  
  /*
  const accounts = {
    client: getClient(userInformation),
    converterOptions: {
      source: 'nightscout',
      target: 'fiphr',
      FHIR_userid: userInformation.username,
    },
  };
  logger.log('Users\n', JSON.stringify(VERBOSE ? accounts : users));
  */
  try{
   //If server is not response. Then go to timeout.
   const userCarelinkInformation = await Promise.race([testi(userInformation), timeoutChecker(3000)]); //await fetchAccountData(account);

   await CarelinkProcess.findOneAndUpdate({user_id: userInformation.userId},{run_date: Date.now()}, { new: true });
  
   logger.log('Final results', userCarelinkInformation);
   //Tähän tehdään omatietovaraston liitäntä, johon viedään käyttäjän tiedot. 

  }catch(error){
    //logger.log(`Error with account ${account}`);
    if(error.message === 'Timeout'){
      logger.log(`Error when try to connect to server and ${error}`);
      await CarelinkProcess.findOneAndUpdate({user_id: userInformation.userId},{error_date: Date.now(), 
       $push: { error_message: 'Timeout'}
      },
         { new: true });
     
    }else{
      logger.log(`Error with account ${userInformation} and error ${error}`);
      await CarelinkProcess.findOneAndUpdate({user_id: userInformation.userId},{error_date: Date.now(), $push: { error_message: error.toString()}}, { new: true });
    }
  }
}

export default async function carelinkProcessRun(){

      logger.log(`Starting carelink process`);
  
      const usersInStorage = await CarelinkInformation.find({}, 'user_id');
      usersInStorage.map(async (userIdValue, index) => {
        
        const userIdCheck = await CarelinkProcess.findByUser(userIdValue.user_id);
        
        if( userIdCheck.length === 0){
          const carelinkProcess = new CarelinkProcess({
            user_id: userIdValue.user_id
          });
           carelinkProcess.save();
      }
      });

      const findedProcessUsers = await CarelinkProcess.find({});

      let users = [];

     users = findedProcessUsers.map(async (value, index) => {
        const userInformation = await CarelinkInformation.findByOneUser(value.user_id);

        return {
          'username':  userInformation.user_name.toString(),
          'password':  decrypt(userInformation.user_password).toString(),
          'latestEntryDate': new Date().getTime(),
          'userId': value.user_id
        };
      });
     
     
      users.forEach(element => {
         element.then(async  (user) => {
           for(var x = 0; x <= 5; x++){
            //Delay for server call
            await delay(1000);
            console.log(x);
            await createCareLinkConnect(user);
           }
          });
      });
      
      /*
      function fetchAll() {
        if (busy) {
          if (busyStateCounter > 5) {
            // We don't want to wait indefinitely.
            logger.log(`Still busy, but skipped update ${
              busyStateCounter
            } times already. Resetting busy state.`);
            busyStateCounter = 0;
          } else {
            logger.log('Still busy with previous uploads, skipping update.');
            busyStateCounter += 1;
            return;
          }
        }
        busy = true;
        const startTime = new Date().getTime();
    
        
        const accounts = users.map(u => ({
          ...u,
          client: getClient(u),
          converterOptions: {
            source: 'nightscout',
            target: 'fiphr',
            FHIR_userid: u.username,
          },
        }));
        logger.log('Users\n', JSON.stringify(VERBOSE ? accounts : users));
        
        // Execute queries sequentially
        return accounts.reduce((promises, account) => {
          return promises
            .then((results) => {
              return fetchAccountData(account)
                .catch((error) => {
                  logger.log(`Error with account ${account}`);
                  return error;
                })
                .then((result) => {
                  results.push(result);
                  return results;
                });
          });
        }, Promise.resolve([]))
        //Tämä ala osa konvertoidaan omaan muotoonsa.
        .then((results) => {
          logger.log('Final results', results);
        })
        .then(() => {
          //Tämä muutetaan, niin että haetaan tietokannasta ja katsotaan tilanne.
          users = updateUsers(users, accounts);
        })
        .catch(logger.error)
        .then(() => {
          const executionTime = new Date().getTime() - startTime;
          logger.log(`Fetch and upload completed in ${executionTime} ms.`);
        })
        .finally(() => {
          busy = false;
        });
      }
     

      fetchAll()
      .catch((error) => {
        logger.error(`Error starting up!`, error);
      })
      .then(() => {
        intervalID = setInterval(fetchAll, INTERVAL);
        logger.log(`Scheduled the process to run continuously at ${INTERVAL} ms. intervals.`);
      });
   
    */

}


function timeoutChecker(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
} 

function delay(ms){
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Done')
    }, ms);
  });
}