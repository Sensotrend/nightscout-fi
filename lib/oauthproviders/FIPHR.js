import express from 'express';
import cors from 'cors';
import { decorateApp }  from '@awaitjs/express';
import bodyParser from 'body-parser';
import mongo from 'connect-mongo';
import session from 'express-session';
import simpleOauthModule from 'simple-oauth2';

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
      secret: env.session_key
      , cookie: {
         maxAge: 60000
      }
      , resave: false
      , saveUninitialized: false
      , store: new MongoStore({ mongooseConnection: env.mongo.getConnection() })
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

   const oauth2 = simpleOauthModule.create({
      client: {
         id: OauthClientId
         , secret: OauthClientSecret
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

   app.get('/launch', async function (req, res) {

      const state = env.randomString();
      req.session.state = state;
      const scope = 'offline_access patient/Observation.read patient/MedicationAdministration.read patient/Observation.write patient/MedicationAdministration.write';

      // Authorization uri definition
      const authorizationUri = oauth2.authorizationCode.authorizeURL({
         redirect_uri: OauthCallbackURL,
         aud: iss,
         scope,
         state: state,
      });

      console.log(authorizationUri);

      res.redirect(authorizationUri);
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
         return res.status(400).json('Invalid state parameter');
      }

      const options = {
         code,
         redirect_uri: OauthCallbackURL,
      };

      try {
         const result = await oauth2.authorizationCode.getToken(options);
         const {
            token
         } = oauth2.accessToken.create(result);

         const dateHeader = req.get('Date');
         const baseTime = dateHeader ? new Date(dateHeader) : new Date();
         const expiryTime = new Date(baseTime.getTime() + token.expires_in);
         const user = await env.userProvider.createOrLoadAndUpdateUser(token.sub, token.access_token, token.refresh_token, expiryTime);

         const { user_id, site_secret } = user;
         req.session.user = { user_id, site_secret };
         console.log('Identified user', user);

         // Check if the email has been verified!
         if (user.email) {
            res.redirect(`${frontend}/?site=${site_secret}&api=${process.env.API_URL}`);
         } else {
            res.redirect(`${frontend}/registration`);
         }
      } catch (error) {
         console.error('Access Token Error', error.message);
         return res.status(500).json('Authentication failed');
      }
   });

   // API to query for user info
   app.get('/config', async (req, res) => {
      const { user } = req.session;
      console.log('Session', req.session, user);
      return user
      ? res.status(200).json({ secret: user.site_secret, api: env.API_URL })
      : res.status(206).json({});
   });

   app.getAccessTokenForUser = async function (user) {
      const d = new Date();
      if ((d.getTime() + TokenValidityOffsetTime) < user.token_expiry_date.getTime()) {
         console.log('Auth key still valid');
         return env.userProvider.decryptAccessToken(user);
      } else {
         const tokenObject = {
            'access_token': env.userProvider.decryptAccessToken(user)
            , 'refresh_token': env.userProvider.decryptRefreshToken(user)
            , 'expires_in': '7200'
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
