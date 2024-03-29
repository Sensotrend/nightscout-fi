import express from 'express';
import cors from 'cors';
import { decorateApp } from '@awaitjs/express';
import bodyParser from 'body-parser';
import mongo from 'connect-mongo';
import session from 'express-session';
import { Issuer, custom } from 'openid-client';

const MongoStore = mongo(session);

const OauthClientId = process.env.OAUTH_CLIENT_ID;
const OauthClientSecret = process.env.OAUTH_CLIENT_SECRET;
const OAuthAuthorizationURL = process.env.OAUTH_AUTHORIZATION_URL;
const OauthTokenURL = process.env.OAUTH_TOKEN_URL;
const OauthCallbackURL = process.env.OAUTH_CALLBACK_URL;
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


   const corsOptions = {
      origin: 'http://localhost:3000',
      credentials: true,
      optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
   };

   // TODO: Don't allow in production?
   app.use(cors(corsOptions));
   app.options('*', cors(corsOptions));

   const tokenUrl = new URL(OauthTokenURL);

   const issuerUrl = `${tokenUrl.protocol}//${tokenUrl.host}`;

   const fiphrIssuer = new Issuer({
      issuer: issuerUrl,
      authorization_endpoint: OAuthAuthorizationURL,
      token_endpoint: OauthTokenURL
   }); // => Issuer
   env.logger.info('Set up issuer ' + fiphrIssuer.issuer + ' ' + JSON.stringify(fiphrIssuer.metadata, null, 2));

   const productionOpts = {
      client_id: OauthClientId,
      token_endpoint_auth_method: 'none',
      redirect_uris: [OauthCallbackURL],
      response_types: ['code'],
      disable_id_token_verification: true
   };

   const sandboxOpts = {
      client_id: OauthClientId,
      client_secret: OauthClientSecret,
      token_endpoint_auth_method: 'client_secret_post',
      redirect_uris: [OauthCallbackURL],
      response_types: ['code'],
      disable_id_token_verification: true
   };

   const client = new fiphrIssuer.Client((tokenUrl.host.indexOf('sandbox') > 0) ? sandboxOpts : productionOpts); // => Client

   if (env.https_certificate) {
      client[custom.http_options] = function (options) {
         // see https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
         // key, cert, ca, ciphers, clientCertEngine, crl, dhparam, ecdhCurve, honorCipherOrder, passphrase
         // pfx, rejectUnauthorized, secureOptions, secureProtocol, servername, sessionIdContext
         options.cert = env.https_certificate; // <string> | <string[]> | <Buffer> | <Buffer[]>
         options.key = env.https_privateKey ; // <string> | <string[]> | <Buffer> | <Buffer[]> | <Object[]>
         options.timeout = 10000;
         return options;
      };
   }

   app.get('/launch', async function (req, res) {

      const state = env.randomString();
      req.session.state = state;
      const scope = 'offline_access patient/Observation.read patient/MedicationAdministration.read patient/Observation.write patient/MedicationAdministration.write';

      const au_2 = client.authorizationUrl({
         redirect_uri: OauthCallbackURL,
         // aud: iss,
         scope: scope,
         state: state
      }); // => String (URL)
      env.logger.info('Redirecting launch request to \'' + au_2 + '\'.');
      res.redirect(au_2);
   });

   // Callback service parsing the authorization token and asking for the access token
   app.get('/callback', async (req, res) => {

      const {
         code,
         state,
      } = req.query;
      const storedState = req.session.state;
      if (state !== storedState) {
         env.logger.warn('Invalid state! ' + { request: state, session: storedState });
         return res.redirect(`${frontend}/?error=${encodeURIComponent('Invalid state')}`);
      }
      env.logger.info('Auth callback request, code: ' + code + ', state: ' + state + ', session state: ' + storedState);

      try {
         const token = await client.oauthCallback(OauthCallbackURL, req.query, { state: req.session.state, response_type: 'code' });
         env.logger.info('Got auth callback: ' + JSON.stringify(token, null, 2));
         const dateHeader = req.get('Date');
         const baseTime = dateHeader ? new Date(dateHeader) : new Date();
         const expiryTime = new Date(baseTime.getTime() + (token.expires_in * 1000));
         env.logger.info('Created token expiry time, ' + baseTime.getTime() + ' + ' + token.expires_in + ": " + expiryTime);
         const user = await env.userProvider.createOrLoadAndUpdateUser(token.sub, token.access_token, token.refresh_token, expiryTime);

         const { user_id, site_secret, email } = user;
         req.session.user = { user_id, site_secret, email };

         // Check if the email has been verified!
         if (email) {
            res.redirect(`${frontend}/`);
         } else {
            res.redirect(`${frontend}/registration`);
         }
      } catch (error) {
         env.logger.error('Access Token Error ' + JSON.stringify(error, null, 2));
         return res.redirect(`${frontend}/?error=${encodeURIComponent('Authentication failed')}`);
      }
   });

   // API to query for user info
   app.get('/config', async (req, res) => {
      const { user } = req.session;
      if (!user) {
         return res.status(204).json({ api: '' });
      }
      const { email } = user;
      const config = email ? { api: process.env.API_URL, email, secret: user.site_secret, development: user.contact_development_flag, notifications: user.contact_notifications_flag } : { status: 'Registration required.' };
      return res.send(config);
   });

   app.getAccessTokenForUser = async function (user) {
      const d = new Date();
      const timeLeft = user.token_expiry_date.getTime() - d.getTime() - TokenValidityOffsetTime;

      if (timeLeft > 0) {
         env.logger.info('Auth key still valid for user ' + user);
         return env.userProvider.decryptAccessToken(user);
      } else {
         env.logger.info('Refreshing token for user ' + user);
         const tokenSet = await client.refresh(env.userProvider.decryptRefreshToken(user));
         env.logger.info('Got new token for user ' + user + ": " + tokenSet.access_token);
         env.userProvider.updateTokensForUser(user, tokenSet.access_token, tokenSet.refresh_token);
         return tokenSet.access_token;
      }
   };

   return app;
}

export default FIPHR;
