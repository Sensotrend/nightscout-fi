/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint no-console: 0, import/no-unresolved: 0 */
import express from 'express';
import { decorateApp } from '@awaitjs/express';
import nanoid from 'nanoid';
import NSAccessPermission from './models/nightscoutpermission.model.js';
import path from 'path';
import session from 'express-session';
import MongoStoreProvider from 'connect-mongo';
import simpleOauthModule from 'simple-oauth2';
import Client from 'fhir-kit-client';
import bodyParser from 'body-parser';
import sgMail from '@sendgrid/mail';

const MongoStore = MongoStoreProvider(session);

const NSCONSENT_BASE_URL = process.env.NSCONSENT_BASE_URL ? process.env.NSCONSENT_BASE_URL : 'http://localhost:1300/nsconsent';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

function getClientID (system) {
   let key = 'NSCONSENT_CLIENT_ID_' + system.toUpperCase();
   return process.env[key];
}

function NightscoutViewConsentService (env) {

   const app = decorateApp(express());

   app.use(bodyParser.urlencoded({
      extended: false
   }));

   app.set('views', path.join(__dirname, '../nsview/views'));
   app.set('view engine', 'ejs');

   app.use('/static', express.static(path.join(__dirname, '../nsview/static')));

   // Use session to pass the iss information to the callback
   app.use(session({
      secret: env.session_key
      , cookie: { maxAge: 60000 }
      , resave: false
      , saveUninitialized: false
      , store: new MongoStore({ mongooseConnection: env.mongo.getConnection() })
   }));

   app.get('/launch/:system', async function (req, res) {
      const { iss, launch } = req.query;
      const fhirClient = new Client({ baseUrl: iss });
      const { authorizeUrl, tokenUrl } = await fhirClient.smartAuthMetadata();

      req.session.iss = iss;

      let clientId = getClientID(req.params.system);

      // Create a new oAuth2 object using the Client capability statement:
      const oauth2 = simpleOauthModule.create({
         client: {
            id: clientId
         , }
         , auth: {
            tokenHost: `${tokenUrl.protocol}//${tokenUrl.host}`
            , tokenPath: tokenUrl.pathname
            , authorizeHost: `${authorizeUrl.protocol}//${authorizeUrl.host}`
            , authorizePath: authorizeUrl.pathname
         , }
         , options: {
            authorizationMethod: 'body'
         , }
      , });

      // Authorization uri definition
      const authorizationUri_ = oauth2.authorizationCode.authorizeURL({
         redirect_uri: NSCONSENT_BASE_URL + '/callback/' + req.params.system
         , launch: launch
         , aud: iss
         , scope: 'launch openid profile user/Patient.read patient/*.*'
         , state: '3(#0/!~'
         , client_id: clientId
      , });

      let urlContent = {
         response_type: 'code'
         , client_id: clientId
         , redirect_uri: NSCONSENT_BASE_URL + '/callback/' + req.params.system
         , launch: launch
         , state: nanoid(10)
         , scope: 'openid profile patient/*.read launch'
         , aud: iss
      };

      const authorizationUri = oauth2.authorizationCode.authorizeURL(urlContent);

      res.redirect(authorizationUri);
   });

   // Callback service parsing the authorization token and asking for the access token
   app.get('/callback/:system', async (req, res) => {
      const { iss } = req.session;

      const fhirClient = new Client({
         baseUrl: iss
      });
      const { authorizeUrl, tokenUrl } = await fhirClient.smartAuthMetadata();

      let clientId = getClientID(req.params.system);

      // Create a new OAuth2 object using the Client capability statement:
      const oauth2 = simpleOauthModule.create({
         client: {
            id: clientId
         }
         , auth: {
            tokenHost: `${tokenUrl.protocol}//${tokenUrl.host}`
            , tokenPath: tokenUrl.pathname
            , authorizeHost: `${authorizeUrl.protocol}//${authorizeUrl.host}`
            , authorizePath: authorizeUrl.pathname
         }
         , options: {
            authorizationMethod: 'body'
         }
      });

      const { code } = req.query;
      const options = {
         code
         , redirect_uri: NSCONSENT_BASE_URL + '/callback/' + req.params.system
      };

      try {
         const result = await oauth2.authorizationCode.getToken(options);

         const { token } = oauth2.accessToken.create(result);

         req.session.token = token;

         fhirClient.bearerToken = token.access_token;
         let permission = await NSAccessPermission.findOne({
            pwd_id: token.patient
         });

         if (permission && permission.access_granted && permission.iss == iss) {
            let uri = permission.ns_uri + '?api-secret=' + permission.ns_secret;
            res.redirect(307, uri);
         } else {
            generatePermissionRequestForm(req, res);
         }
      } catch (error) {
         console.error('Access Token Error', error.message);
         return res.status(500).json('Authentication failed');
      }
   });

   async function generatePermissionRequestForm (req, res) {

      console.log('Generating consent form');
      const { iss } = req.session;

      const fhirClient = new Client({
         baseUrl: iss
      });

      fhirClient.bearerToken = req.session.token.access_token;

      const patientRequest = await fhirClient.read({
         resourceType: 'Patient'
         , id: req.session.token.patient
      });

      const patient = patientRequest.body;

      let name = patient.name[0].given + ' ' + patient.name[0].family;

      return res.render('nightscoutpermission_request.ejs', {
         name: name
      });
   }

   app.post('/permissionrequest', async (req, res) => {

      let requestID = nanoid(18);

      let accessRequest = new NSAccessPermission({
         grant_id: requestID
         , pwd_id: req.session.token.patient
         , pwd_email: req.body.email
         , access_requested: new Date()
         , accessgranted: false
         , iss: req.session.iss
      });

      try {
         await accessRequest.save();
      } catch (error) {
         console.error('Error creating accessRequest', error);
      }

      sgMail.setApiKey(SENDGRID_API_KEY);

      const msg = {
         to: req.body.email
         , from: 'info@sensotrend.com'
         , templateId: 'd-f05f8627d4f649c8b53fa7a617593c85'
         , dynamic_template_data: {
            buttonURL: NSCONSENT_BASE_URL + '/grantpermission?grantid=' + requestID
            , name: 'Some One'
            , message: req.body.message
         }
      };
      let status = await sgMail.send(msg);
      console.log('status', status.statusMessage);

      return res.send({
         success: true
      });
   });

   app.get('/grantpermission', async (req, res) => {

      let requestid = req.query.grantid;

      let permission = await NSAccessPermission.findOne({
         grant_id: requestid
      });

      if (!permission) {
         res.send('Invalid request id');
      } else {
         if (permission.access_granted) {
            res.send('Request already processed');
         } else {
            return res.render('nightscoutpermission_grant.ejs', {
               requestid: requestid
            });
         }
      }
   });

   app.post('/grantpermission', async (req, res) => {

      let requestid = req.body.requestid;
      let permission = await NSAccessPermission.findOne({
         grant_id: requestid
      });

      permission.access_granted = new Date();
      permission.ns_secret = req.body.secret;
      permission.ns_uri = req.body.nsurl;
      await permission.save();

      return res.send({
         success: true
      });

   });

   return app;
}

export default NightscoutViewConsentService;
