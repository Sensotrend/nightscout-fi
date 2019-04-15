import bodyParser from 'body-parser';
import express from 'express';
import { decorateApp } from '@awaitjs/express';
import basicAuthParser from 'basic-auth';
import EntryProcessor from './nshandlers/entries';
import TreatmentProcessor from './nshandlers/treatments';

function NSRestServer (env) {

   const Entries = EntryProcessor();
   const Treatments = TreatmentProcessor();

   // Nightscout

   const NightscoutRESTServer = decorateApp(express());
   //const NSPort = 1400;

   NightscoutRESTServer.use(bodyParser.json());

   async function getUser (req, res, next) {

      var u;

      if (env.useWildcardDomains) {

         // Load user based on a custom domain / user

         let user;
         let credentials = basicAuthParser(req);

         if (credentials) {
            user = credentials.name;
         } else {
            user = req.header('api-secret');
         }
         if (!user) return false;
         let site = req.header('Host').split('.')[0];

         console.log('Trying to login on site', site);

         u = await env.userProvider.findUserBySiteId(site, user);
      } else {
         let site_secret;
         let credentials = basicAuthParser(req);

         if (credentials) {
            site_secret = credentials.name;
         } else {
            site_secret = req.header('api-secret');
         }

         // Support /pebble/<api-secret>/pebble style url for Pebbles that don't authenticate themselves properly with an api secret

         if (!site_secret) {
            let x = req.params[0].split('/');
            if (x.length == 3) {
               site_secret = x[1];
            }
         }

         console.log('Loading data based on site secret');

         if (site_secret) u = await env.userProvider.findUserBySiteSecret(site_secret);
      }

      req.userLoaded = false;

      if (u && u.user_id) {
         req.user = u;
         req.userLoaded = true;
         next();
      } else {
         console.log('Unauthorized API call', req.originalUrl);
         res.status(403).send('Unauthorized');
         res.end();
      }
   }

   NightscoutRESTServer.getAsync('/treatments*', getUser, async (req, res) => {
      console.log('GET to', req.originalUrl);
      let token = await env.oauthProvider.getAccessTokenForUser(req.user);
      let treatments = await Treatments.getTreatments(env.FHIRServer, req.user.sub, token, req.query);
      res.send(treatments);
   });

   async function putOrPostTreatment(req, res) {

      let data = req.body;

      if (data.constructor != Array) {
         if (data.created_at || data.date) {
            data = [data];
         } else {
            console.error('POST body missing or data not json');
            res.status(400).send('POST body missing or data not json');
            return;
         }
      }
      let token = await env.oauthProvider.getAccessTokenForUser(req.user);
      let treatments = await Treatments.postTreatments(env.FHIRServer, req.user.sub, token, data);
      res.send(treatments);
   }

   NightscoutRESTServer.putAsync('/treatments*', getUser, async (req, res) => {
      console.log('PUT to', req.originalUrl);
      await putOrPostTreatment(req, res);
   });

   NightscoutRESTServer.postAsync('/treatments*', getUser, async (req, res) => {
      console.log('POST to', req.originalUrl);
      await putOrPostTreatment(req, res);
   });

   NightscoutRESTServer.getAsync('/entries*', getUser, async (req, res) => {
      console.log('GET to', req.originalUrl);
      let token = await env.oauthProvider.getAccessTokenForUser(req.user);
      let entries = await Entries.getEntries(env.FHIRServer, req.user.sub, token, req.query);
      res.send(entries);
   });

   NightscoutRESTServer.postAsync('/entries*', getUser, async (req, res) => {
      console.log('POST to', req.originalUrl);
      if (req.body.constructor != Array) {
         res.status(400).send('POST body missing');
         return;
      }
      let token = await env.oauthProvider.getAccessTokenForUser(req.user);
      let entries = await Entries.postEntries(env.FHIRServer, req.user.sub, token, req.body);
      if (!entries) {
         res.status(500).send('Failed to store entries');
      } else {
         res.send(entries);
      }
   });

   NightscoutRESTServer.postAsync('/devicestatus*', getUser, async (req, res) => {
      console.log('POST to', req.originalUrl);
      // TODO store the data
      console.log('Got device status for user', req.user.user_id, req.body);
      res.send(req.body);
   });

   NightscoutRESTServer.getAsync('/status*', getUser, async (req, res) => {
      console.log('GET to', req.originalUrl);

      console.log('Status request', req.user);

      let d = new Date();

      res.send({
         "status": "ok"
         , "name": "nightscout"
         , "version": "0.11.0-st"
         , "serverTime": d.toISOString()
         , "serverTimeEpoch": d.getTime()
         , "apiEnabled": true
         , "careportalEnabled": true
         , "settings": {
            "units": "mmol"
            , "timeFormat": 24
            , "language": "en"
            , "baseURL": "https://test.nightscout.fi"
            , "authDefaultRoles": "readable"
            , "DEFAULT_FEATURES": ["bgnow", "delta", "direction", "timeago", "devicestatus", "upbat", "errorcodes", "profile"]
            , "alarmTypes": ["predict"]
            , "enable": ["careportal", "iob", "basal", "profile", "bwp", "cage", "sage", "openaps", "rawbg", "pump", "speech", "bage", "pushover", "treatmentnotify", "bgnow", "delta", "direction", "timeago", "devicestatus", "upbat", "errorcodes", "ar2"]
         }
         , "extendedSettings": {
            "devicestatus": {
               "advanced": true
            }
         }
         , "authorized": null
      });
   });

   NightscoutRESTServer.putAsync('*', getUser, async (req, res) => {
      console.log('REST API PUT CALL', req.originalUrl);
   });

   NightscoutRESTServer.postAsync('*', getUser, async (req, res) => {
      console.log('REST API POST CALL', req.originalUrl);
   });
   
   NightscoutRESTServer.getAsync('*', getUser, async (req, res) => {

      console.log('REST API CALL', req.originalUrl);

      if (req.originalUrl.includes('pebble')) {
         let token = await env.oauthProvider.getAccessTokenForUser(req.user);
         let entries = await Entries.getPebble(env.FHIRServer, req.user.sub, token, req.query);
         res.send(entries);
      } else {
         console.log('Unhandled REST API URL', req.originalUrl);
      }
   });

   //NightscoutRESTServer.listen(NSPort, () => console.log(`NS app listening on port ${NSPort}!`));

   return NightscoutRESTServer;
}

export default NSRestServer;
