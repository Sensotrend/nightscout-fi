/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint no-console: 0, import/no-unresolved: 0 */
import express from 'express';
import { decorateApp } from '@awaitjs/express';
import { nanoid } from 'nanoid';
import NSAccessPermission from './models/nightscoutpermission.model.js';
import session from 'express-session';
import MongoStoreProvider from 'connect-mongo';
import simpleOauthModule from 'simple-oauth2';
import Client from 'fhir-kit-client';
import bodyParser from 'body-parser';
import sgMail from '@sendgrid/mail';
import axios from 'axios';

const MongoStore = MongoStoreProvider(session);

const NSCONSENT_BASE_URL = process.env.NSCONSENT_BASE_URL ? process.env.NSCONSENT_BASE_URL : 'http://localhost:1300/nsconsent';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const frontend = process.env.FRONTEND;

function getClientID (system) {
   let key = 'NSCONSENT_CLIENT_ID_' + system.toUpperCase();
   return process.env[key];
}

function NightscoutViewConsentService (env) {

   const logger = env.logger;

   const app = decorateApp(express());

   app.use(bodyParser.urlencoded({
      extended: false
   }));

   app.use(bodyParser.json({}));

   // Use session to pass the iss information to the callback
   app.use(session({
      secret: env.session_key,
      cookie: { maxAge: 30 * 60 * 1000 },
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({
         mongooseConnection: env.mongo.getConnection(),
         ttl: 30 * 60
      })
   }));

   app.get('/launch/:system', async function (req, res) {
      let { iss, launch } = req.query;

      iss = unescape(iss);
      launch = unescape(launch);

      const fhirClient = new Client({ baseUrl: iss });

      let { authorizeUrl, tokenUrl } = await fhirClient.smartAuthMetadata();

      req.session.iss = iss;

      let clientId = getClientID(req.params.system);

      // Create a new oAuth2 object using the Client capability statement:
      const oauth2 = simpleOauthModule.create({
         client: {
            id: clientId,
         },
         auth: {
            tokenHost: `${tokenUrl.protocol}//${tokenUrl.host}`,
            tokenPath: tokenUrl.pathname,
            authorizeHost: `${authorizeUrl.protocol}//${authorizeUrl.host}`,
            authorizePath: authorizeUrl.pathname,
         },
         options: {
            authorizationMethod: 'body',
         },
      });

      let urlContent = {
         response_type: 'code',
         client_id: clientId,
         redirect_uri: NSCONSENT_BASE_URL + '/callback/' + req.params.system,
         launch: launch,
         state: nanoid(10),
         scope: 'openid profile patient/Patient.read launch',
         aud: iss
      };

      const authorizationUri = oauth2.authorizationCode.authorizeURL(urlContent);

      logger.info('REDIRECTING TO ' + authorizationUri);

      res.redirect(authorizationUri);
   });

   // Callback service parsing the authorization token and asking for the access token
   app.get('/callback/:system', async (req, res) => {

      const { iss } = req.session;

      const fhirClient = new Client({
         baseUrl: iss
      });
      const { authorizeUrl, tokenUrl } = await fhirClient.smartAuthMetadata();

      // TODO validate JWT, load JWK from server

      let clientId = getClientID(req.params.system);

      // Create a new OAuth2 object using the Client capability statement:
      const oauth2 = simpleOauthModule.create({
         client: {
            id: clientId
         },
         auth: {
            tokenHost: `${tokenUrl.protocol}//${tokenUrl.host}`,
            tokenPath: tokenUrl.pathname,
            authorizeHost: `${authorizeUrl.protocol}//${authorizeUrl.host}`,
            authorizePath: authorizeUrl.pathname
         },
         options: {
            authorizationMethod: 'body'
         }
      });

      const { code } = req.query;
      const options = {
         code,
         redirect_uri: NSCONSENT_BASE_URL + '/callback/' + req.params.system
      };

      try {
         const result = await oauth2.authorizationCode.getToken(options);
         const { token } = oauth2.accessToken.create(result);

         req.session.token = token;
         fhirClient.bearerToken = token.access_token;

         let permission = await NSAccessPermission.findOne({
            pwd_id: token.patient,
            iss: iss
         });

         if (permission && permission.access_granted && permission.iss === iss) {
            let uri = permission.ns_uri + '?secret=' + permission.ns_secret;
            res.redirect(307, uri);
         } else {
            // TODO: message existing permission to UI
            res.redirect(307, frontend + '/nsconsent/request');
         }
      } catch (error) {
         logger.error('Access Token Error ' + error.message);
         return res.status(500).json('Authentication failed');
      }
   });

   app.post('/permissionrequest', async (req, res) => {

      if (!req.session.token) {
         logger.error('No token in session, cannot process permission request');
         return;
      }

      let accessRequest = await NSAccessPermission.findOne({
         pwd_id: req.session.token.patient,
         iss: req.session.iss
      });

      let requestID = nanoid(18);

      if (accessRequest) {
         requestID = accessRequest.grant_id;
         logger.info('Earlier consent request was found, just resending email');
      } else {
         logger.info('No consent request found for patient, creating');

         accessRequest = new NSAccessPermission({
            grant_id: requestID,
            pwd_id: req.session.token.patient,
            pwd_email: req.body.email,
            access_requested: new Date(),
            accessgranted: false,
            iss: req.session.iss
         });

         try {
            await accessRequest.save();
         } catch (error) {
            logger.error('Error creating accessRequest: ' + JSON.stringify(error, null, 2));
         }
      } 

      sgMail.setApiKey(SENDGRID_API_KEY);

      const msg = {
         to: req.body.email,
         from: 'info@sensotrend.com',
         templateId: 'd-f05f8627d4f649c8b53fa7a617593c85',
         dynamic_template_data: {
            buttonURL: NSCONSENT_BASE_URL + '/grantpermission?grantid=' + requestID,
            name: 'Some One',
            message: req.body.message
         }
      };

      try {
         await sgMail.send(msg);
         return res.send({
            success: true
         });
      } catch (error) {
         logger.error('Error sending email ' + JSON.stringify(error, null, 2));
         return res.status(500).json({ error });
      }
   });

   app.get('/grantpermission', async (req, res) => {

      const grantid = req.query.grantid;

      const permission = await NSAccessPermission.findOne({
         grant_id: grantid
      });

      if (!permission) {
         const msg = escape('No consent request was found with the idenfifier in your email.')
         res.redirect(307, frontend + '/nsconsent/error?message=' + msg);
      } else {
         if (permission.access_granted) {
            const msg = escape('This consent request has already been processed.')
            res.redirect(307, frontend + '/nsconsent/error?message=' + msg);
         } else {
            res.redirect(307, frontend + '/nsconsent/grant?grantid=' + req.query.grantid);
         }
      }
   });

   app.post('/grantpermission', async (req, res) => {

      if (req.body.secret && req.body.url) {

         try {
            const NSurl = new URL(req.body.url);
            const NSUrlString = `https://${NSurl.host}/api/v1/entries.json`;

            const c = {
               url: NSUrlString,
               maxRedirects: 0,
               method: 'get',
               headers: { 'api-secret': req.body.secret }
            };

            logger.debug('Requesting data from ' + NSUrlString);

            const response = await axios(c);

            const firstEntry = response.data[0];

            if (firstEntry.sgv || firstEntry.mbg) {

               logger.info('Got Nightscout data, granting permission');

               let requestid = req.body.grantid;
               let permission = await NSAccessPermission.findOne({
                  grant_id: requestid
               });

               logger.info('Permission found');

               permission.access_granted = new Date();
               permission.ns_secret = req.body.secret;
               permission.ns_uri = `https://${NSurl.host}/`;
               await permission.save();

               return res.send({
                  success: true
               });
            } else {
               throw new Error('No NS data found');
            }
         } catch (error) {
            logger.error('Error connecting to Nightscout ' +  JSON.stringify(error));
         }
      }
      return res.status(500).send({
         success: false
      });
   });

   return app;
}

export default NightscoutViewConsentService;
