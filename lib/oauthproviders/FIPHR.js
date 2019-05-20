import express from 'express';
import cors from 'cors';
import { decorateApp } from '@awaitjs/express';
import bodyParser from 'body-parser';
import mongo from 'connect-mongo';
import session from 'express-session';

const MongoStore = mongo(session);

const OauthClientId = process.env.OAUTH_CLIENT_ID;
const OauthClientSecret = process.env.OAUTH_CLIENT_SECRET;
const OAuthAuthorizationURL = process.env.OAUTH_AUTHORIZATION_URL;
const OauthTokenURL = process.env.OAUTH_TOKEN_URL;
const OauthCallbackURL = process.env.OAUTH_CALLBACK_URL;
const iss = process.env.FHIR_SERVER;
const frontend = process.env.FRONTEND;

const authCert = process.env.FIPHR_AUTH_CERT_PATH;
const authKey = process.env.FIPHR_AUTH_KEY_PATH;

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

   const fiphrIssuer = new Issuer({
      issuer: urli,
      authorization_endpoint: OAuthAuthorizationURL,
      token_endpoint: OauthTokenURL
   }); // => Issuer
   console.log('Set up issuer %s %O', fiphrIssuer.issuer, fiphrIssuer.metadata);

   const client = new fiphrIssuer.Client({
      client_id: OauthClientId,
      client_secret: OauthClientSecret,
      token_endpoint_auth_method: 'client_secret_post',
      redirect_uris: [OauthCallbackURL],
      response_types: ['code'],
      disable_id_token_verification: true
   }); // => Client


   if (authCert) {
      var privateKey = fs.readFileSync(authKey, 'utf8');
      var certificate = fs.readFileSync(authCert, 'utf8');

      //const { custom } = require('openid-client');

      client[Issuer.http_options] = function (options) {
         // see https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
         // key, cert, ca, ciphers, clientCertEngine, crl, dhparam, ecdhCurve, honorCipherOrder, passphrase
         // pfx, rejectUnauthorized, secureOptions, secureProtocol, servername, sessionIdContext
         options.cert = certificate; // <string> | <string[]> | <Buffer> | <Buffer[]>
         options.key = privateKey; // <string> | <string[]> | <Buffer> | <Buffer[]> | <Object[]>

         return options;
      };
   }

   app.get('/launch', async function (req, res) {

      const state = env.randomString();
      req.session.state = state;
      const scope = 'offline_access patient/Observation.read patient/MedicationAdministration.read patient/Observation.write patient/MedicationAdministration.write';

      console.log(OauthCallbackURL);

      const au_2 = client.authorizationUrl({
         redirect_uri: OauthCallbackURL,
         aud: iss,
         scope: scope,
         state: state
      }); // => String (URL)

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

         let token;
         console.log('OauthCallbackURL', OauthCallbackURL);
         console.log('req.query', req.query);

         console.log('client', client);

         try {
            token = await client.callback(OauthCallbackURL, req.query, { state: req.session.state, response_type: 'code' }); // => Promise
         } catch (error) {
            console.log('error', error);
         }

         console.log('token', token);

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

         let tokenSet = await client.refresh(env.userProvider.decryptRefreshToken(user));  // => Promise
        
         // console.log('Got tokenSet from refresh:', tokenSet);

         env.userProvider.updateTokensForUser(user, tokenSet.access_token, tokenSet.refresh_token);
         return tokenSet.access_token;
      }
   };

   return app;
}

export default FIPHR;
