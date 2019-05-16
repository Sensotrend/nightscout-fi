import express from 'express';
import cors from 'cors';
import { decorateApp } from '@awaitjs/express';
import bodyParser from 'body-parser';
import mongo from 'connect-mongo';
import session from 'express-session';
import simpleOauthModule from 'simple-oauth2';
//import OpenIdClient from 'openid-client';

//import { Issuer } from 'openid-client';


const MongoStore = mongo(session);

const OauthClientId = process.env.OAUTH_CLIENT_ID;
const OauthClientSecret = process.env.OAUTH_CLIENT_SECRET;
const OAuthAuthorizationURL = process.env.OAUTH_AUTHORIZATION_URL;
const OauthTokenURL = process.env.OAUTH_TOKEN_URL;
const OauthCallbackURL = process.env.OAUTH_CALLBACK_URL;
const iss = process.env.FHIR_SERVER;
const frontend = process.env.FRONTEND;

// How long we need the token to be valid after inspection
// (we're not using it at the exact same millisecond...)
const TokenValidityOffsetTime = 60000;

function FIPHR (env) {

   const app = decorateApp(express());

   app.use(bodyParser.urlencoded({
      extended: false
   }));

   // Use session to pass the iss information to the callback
   app.use(session({
      secret: env.session_key,
      cookie: {
         maxAge: 30 * 60 * 1000
      },
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({
         mongooseConnection: env.mongo.getConnection(),
         ttl: 30 * 60
      })
   }));


   var corsOptions = {
      origin: 'http://localhost:3000',
      credentials: true,
      optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
   };

   // TODO: Don't allow in production?
   app.use(cors(corsOptions));
   app.options('*', cors(corsOptions));

   const tokenUrl = new URL(OauthTokenURL);
   const authorizeUrl = new URL(OAuthAuthorizationURL);

   const { Issuer } = require('openid-client');

   const urli = `${tokenUrl.protocol}//${tokenUrl.host}`;
   console.log('urli', urli);

   const fiphrIssuer = new Issuer({
      issuer: urli,
      authorization_endpoint: OAuthAuthorizationURL,
      token_endpoint: OauthTokenURL
   }); // => Issuer
   console.log('Set up issuer %s %O', fiphrIssuer.issuer, fiphrIssuer.metadata);

   const oauth2 = simpleOauthModule.create({
      client: {
         id: OauthClientId,
         secret: OauthClientSecret,
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

   const client = new fiphrIssuer.Client({
      client_id: OauthClientId,
      client_secret: OauthClientSecret,
      token_endpoint_auth_method: 'client_secret_post',
      redirect_uris: [OauthCallbackURL],
      response_types: ['code']
    }); // => Client

   app.get('/launch', async function (req, res) {

      const state = env.randomString();
      req.session.state = state;
      const scope = 'offline_access profile patient/Observation.read patient/MedicationAdministration.read patient/Observation.write patient/MedicationAdministration.write';

      console.log(OauthCallbackURL);

      const au_2 = client.authorizationUrl({
         redirect_uri: OauthCallbackURL,
         aud: iss,
         scope: scope,
         state: state
       }); // => String (URL)

      // Authorization uri definition
      const authorizationUri = oauth2.authorizationCode.authorizeURL({
         redirect_uri: OauthCallbackURL,
         aud: iss,
         scope,
         state: state,
      });

      console.log(au_2);
      console.log(authorizationUri);

      res.redirect(au_2);
   });

   // Callback service parsing the authorization token and asking for the access token
   app.get('/callback', async (req, res) => {

      console.log('query', req.query);

      const {
         code,
         state,
      } = req.query;
      const storedState = req.session.state;
      if (state !== storedState) {
         console.warn('Invalid state!', { request: state, session: storedState });
         return res.redirect(`${frontend}/?error=${encodeURIComponent('Invalid state')}`);
      }

      const options = {
         code,
         redirect_uri: OauthCallbackURL,
      };

      try {

         //const { state, response_type } = session[authorizationRequestState];

         let _token;
         console.log('OauthCallbackURL', OauthCallbackURL);
         console.log('req.query', req.query);

         console.log('client', client);

         try {
            _token = await client.authorizationCallback(OauthCallbackURL, req.query, { state: req.session.state, response_type: 'code' }); // => Promise
         } catch (error) {
            console.log('error', error);
         }

         console.log('_tken', _token);

/*         .then(function (tokenSet) {
             console.log('received and validated tokens %j', tokenSet);
             console.log('validated id_token claims %j', tokenSet.claims);
           });
*/

         const result = await oauth2.authorizationCode.getToken(options);
         const {
            token
         } = oauth2.accessToken.create(result);

         const dateHeader = req.get('Date');
         const baseTime = dateHeader ? new Date(dateHeader) : new Date();
         const expiryTime = new Date(baseTime.getTime() + token.expires_in);
         const user = await env.userProvider.createOrLoadAndUpdateUser(token.sub, token.access_token, token.refresh_token, expiryTime);

         const { user_id, site_secret, email } = user;
         req.session.user = { user_id, site_secret, email };
         console.log('Identified user', user);

         // Check if the email has been verified!
         if (email) {
            res.redirect(`${frontend}/`);
         } else {
            res.redirect(`${frontend}/registration`);
         }
      } catch (error) {
         console.error('Access Token Error', error);
         return res.redirect(`${frontend}/?error=${encodeURIComponent('Authentication failed')}`);
      }
   });

   // API to query for user info
   app.get('/config', async (req, res) => {
      const { user } = req.session;
      if (!user) {
         return res.status(204).json({});
      }
      const { email } = user;
      const config = email ? { api: process.env.API_URL, email, secret: user.site_secret, development: user.contact_development_flag, notifications: user.contact_notifications_flag } : { status: 'Registration required.' };
      console.log('Returning config', config);
      return res.send(config);
   });

   app.getAccessTokenForUser = async function (user) {
      const d = new Date();
      if ((d.getTime() + TokenValidityOffsetTime) < user.token_expiry_date.getTime()) {
         console.log('Auth key still valid');
         return env.userProvider.decryptAccessToken(user);
      } else {
         const tokenObject = {
            'access_token': env.userProvider.decryptAccessToken(user),
            'refresh_token': env.userProvider.decryptRefreshToken(user),
            'expires_in': '7200'
         };

         let accessToken = oauth2.accessToken.create(tokenObject);

         try {
            accessToken = await accessToken.refresh();
         } catch (error) {
            console.log('Error refreshing access token: ', error.message);
         }

         // console.log('New token:', accessToken.token.access_token);

         env.userProvider.updateTokensForUser(user, accessToken.token.access_token, accessToken.token.refresh_token);
         return accessToken.token.access_token;
      }
   };

   return app;
}

export default FIPHR;
