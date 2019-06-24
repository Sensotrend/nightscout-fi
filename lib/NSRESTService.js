import * as httpContext from 'express-cls-hooked';
import bodyParser from 'body-parser';
import express from 'express';
import { decorateApp } from '@awaitjs/express';
import basicAuthParser from 'basic-auth';
import EntryProcessor from './nshandlers/entries';
import TreatmentProcessor from './nshandlers/treatments';
import nanoid from 'nanoid';

function NSRestServer (env) {

   const logger = env.logger;
   const Entries = EntryProcessor(env);
   const Treatments = TreatmentProcessor(env);

   // Nightscout

   const _app = express();
   _app.use(bodyParser.json());
   _app.use(httpContext.middleware);

   const NightscoutRESTServer = decorateApp(_app);

   async function loadUserFromRequest (req) {

      // Support getting the site_secret from
      // 1) 'api-secret' HTTP header
      // 2) query parameter 'secret'
      // 3) HTTP basic auth NAME component
      // 4) URL component for Pebble backward compatibility

      let site_secret = req.header('api-secret');

      if (!site_secret) { site_secret = req.query['secret']; }

      if (!site_secret) {
         const credentials = basicAuthParser(req);
         if (credentials) {
            site_secret = credentials.name;
         }
      }

      // Support /pebble/<api-secret>/pebble style url for old watchface API apps that don't
      // authenticate themselves properly with an api secret

      if (!site_secret) {
         let x = req.params[0].split('/');
         if (x.length == 3) {
            site_secret = x[1];
         }
      }

      if (site_secret) {
         const u = await env.userProvider.findUserBySiteSecret(site_secret);

         if (u && u.user_id) {
            return u;
         }
      }

      return false;
   }

   async function loadUserIntoSessionOrFail (req, res, next) {

      const user = await loadUserFromRequest(req);

      if (user) {
         logger.debug('Loaded user ' + user);
         req.user = user;
         req.userLoaded = true;
         next();
      } else {
         logger.info('Unauthorized API call ' + req.originalUrl);
         res.status(403).send('Unauthorized');
         res.end();
      }
   }

   NightscoutRESTServer.getAsync('/verifyauth*', async (req, res) => {
      const user = await loadUserFromRequest(req);

      res.send({
         'status': 200,
         'message': user ? 'OK' : 'UNAUTHORIZED'
      });
   });

   NightscoutRESTServer.getAsync('/treatments*', loadUserIntoSessionOrFail, async (req, res) => {
      env.requestLogger.startLogging(req.user.user_id, 'GET', req.originalUrl);      
      
      let token = await env.oauthProvider.getAccessTokenForUser(req.user);
      let treatments = await Treatments.getTreatments(env.FHIRServer, req.user.sub, token, req.query);
      env.requestLogger.setLogValue('access_key', req.user.site_secret);
      env.requestLogger.setLogValue('entries_returned', treatments);
      env.requestLogger.setLogValue('http_status', 200);
      env.requestLogger.writeLog();

      res.send(treatments);
   });

   async function putOrPostTreatment (req, res) {

      env.requestLogger.startLogging(req.user.user_id, 'POST', req.originalUrl);

      let data = req.body;

      if (data.constructor != Array) {
         if (data.created_at || data.date) {
            data = [data];
         } else {
            logger.error('POST body missing or data not json');
            res.status(400).send('POST body missing or data not json');
            return;
         }
      }
      let token = await env.oauthProvider.getAccessTokenForUser(req.user);
      let { uploadResults, records } = await Treatments.postTreatments(env.FHIRServer, req.user.sub, token, data);

      env.requestLogger.setLogValue('access_key', req.user.site_secret);
      env.requestLogger.setLogValue('nightscout_sourcedata', req.body);
      env.requestLogger.setLogValue('fhir_operation', 'create');
      env.requestLogger.addLogData(uploadResults);
      env.requestLogger.setLogValue('fhir_data', records);

      env.requestLogger.writeLog();

      res.send(true);
   }

   NightscoutRESTServer.putAsync('/treatments*', loadUserIntoSessionOrFail, async (req, res) => {
      logger.info('PUT ' + req.originalUrl);
      await putOrPostTreatment(req, res);
   });

   NightscoutRESTServer.postAsync('/treatments*', loadUserIntoSessionOrFail, async (req, res) => {
      logger.info('POST ' + req.originalUrl);
      await putOrPostTreatment(req, res);
   });

   NightscoutRESTServer.getAsync('/entries*', loadUserIntoSessionOrFail, async (req, res) => {
      let token = await env.oauthProvider.getAccessTokenForUser(req.user);
      env.requestLogger.startLogging(req.user.user_id, 'GET', req.originalUrl);
      env.requestLogger.setLogValue('access_key', req.user.site_secret);
      let entries = await Entries.getEntries(env.FHIRServer, req.user.sub, token, req.query);
      env.requestLogger.setLogValue('entries_returned', entries);
      env.requestLogger.setLogValue('http_status', 200);
      env.requestLogger.writeLog();
      res.send(entries);
   });

   NightscoutRESTServer.postAsync('/entries*', loadUserIntoSessionOrFail, async (req, res) => {
      logger.info('POST ' + req.originalUrl);
      if (req.body.constructor != Array) {
         res.status(400).send('POST body missing');
         return;
      }
      let token = await env.oauthProvider.getAccessTokenForUser(req.user);
      env.requestLogger.startLogging(req.user.user_id, 'POST', req.originalUrl);
      env.requestLogger.setLogValue('nightscout_sourcedata', req.body);
      env.requestLogger.setLogValue('access_key', req.user.site_secret);

      const { success, records, uploadResults } = await Entries.postEntries(env.FHIRServer, req.user.sub, token, req.body);

      env.requestLogger.setLogValue('fhir_operation', 'create');
      env.requestLogger.addLogData(uploadResults);

      if (!success) {
         env.requestLogger.setLogValue('http_status', 500);
         env.requestLogger.writeLog();
         res.status(500).send('Failed to store entries');
      } else {
         env.requestLogger.setLogValue('http_status', 200);
         env.requestLogger.setLogValue('fhir_data', records);
         env.requestLogger.writeLog();
         res.send(req.body);
      }
   });

   NightscoutRESTServer.postAsync('/devicestatus*', loadUserIntoSessionOrFail, async (req, res) => {
      env.requestLogger.startLogging(req.user.user_id, 'GET', req.originalUrl);
      env.requestLogger.writeLog();
      // TODO store the data
      logger.debug('Got device status for user ' + req.user.user_id + req.body);
      res.send(req.body);
   });

   NightscoutRESTServer.getAsync('/status*', loadUserIntoSessionOrFail, async (req, res) => {
      env.requestLogger.startLogging(req.user.user_id, 'GET', req.originalUrl);
      env.requestLogger.writeLog();

      let d = new Date();

      res.send({
         'status': 'ok',
         'name': 'nightscout',
         'version': '0.11.0-st',
         'serverTime': d.toISOString(),
         'serverTimeEpoch': d.getTime(),
         'apiEnabled': true,
         'careportalEnabled': true,
         'settings': {
            'units': 'mmol',
            'timeFormat': 24,
            'language': 'en',
            'baseURL': 'https://test.nightscout.fi',
            'authDefaultRoles': 'readable',
            'DEFAULT_FEATURES': ['bgnow', 'delta', 'direction', 'timeago', 'devicestatus', 'upbat', 'errorcodes', 'profile'],
            'alarmTypes': ['predict'],
            'enable': ['careportal', 'iob', 'basal', 'profile', 'bwp', 'cage', 'sage', 'openaps', 'rawbg', 'pump', 'speech', 'bage', 'pushover', 'treatmentnotify', 'bgnow', 'delta', 'direction', 'timeago', 'devicestatus', 'upbat', 'errorcodes', 'ar2']
         },
         'extendedSettings': {
            'devicestatus': {
               'advanced': true
            }
         },
         'authorized': null
      });
   });

   NightscoutRESTServer.putAsync('*', loadUserIntoSessionOrFail, async (req, res) => {
      logger.error('Unhandled REST API PUT CALL ' + req.originalUrl);
   });

   NightscoutRESTServer.postAsync('*', loadUserIntoSessionOrFail, async (req, res) => {
      logger.error('Unhandled REST API POST CALL ' + req.originalUrl);
   });

   NightscoutRESTServer.getAsync('*', loadUserIntoSessionOrFail, async (req, res) => {

      logger.info('REST API CALL ' + req.originalUrl);

      if (req.originalUrl.includes('pebble')) {
         env.requestLogger.startLogging(req.user.user_id, 'GET', req.originalUrl);

         let token = await env.oauthProvider.getAccessTokenForUser(req.user);
         let entries = await Entries.getPebble(env.FHIRServer, req.user.sub, token, req.query);
         res.send(entries);
      } else {
         logger.error('Unhandled REST API URL ' + req.originalUrl);
      }
   });

   return NightscoutRESTServer;
}

export default NSRestServer;
