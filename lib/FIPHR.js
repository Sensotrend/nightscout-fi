const express = require('express');
const {
   decorateApp
} = require('@awaitjs/express');
const bodyParser = require('body-parser');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const simpleOauthModule = require('simple-oauth2');

const OauthClientId = process.env.OAUTH_CLIENT_ID;
const OauthClientSecret = process.env.OAUTH_CLIENT_SECRET;
const OAuthAuthorizationURL = process.env.OAUTH_AUTHORIZATION_URL;
const OauthTokenURL = process.env.OAUTH_TOKEN_URL;
const OauthCallbackURL = process.env.OAUTH_CALLBACK_URL;
const iss = process.env.FHIR_SERVER;

function FIPHR (authmanager, env) {

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
      , resave: true
      , store: new MongoStore({ mongooseConnection: env.mongo.getConnection() })
   }));

   const _auth = authmanager;

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

      const state = env.randomString(); // TODO actually store this in session to validate it
      const scope = 'offline_access patient/Observation.read patient/MedicationAdministration.read patient/Observation.write patient/MedicationAdministration.write';

      // Authorization uri definition
      const authorizationUri = oauth2.authorizationCode.authorizeURL({
         redirect_uri: OauthCallbackURL
         , aud: iss
         , scope
         , state: state
      });

      res.redirect(authorizationUri);
   });

   // Callback service parsing the authorization token and asking for the access token
   app.get('/callback', async (req, res) => {

      console.log('query', req.query);

      const {
         code
      } = req.query;
      const options = {
         code
         , redirect_uri: OauthCallbackURL
      };

      try {
         const result = await oauth2.authorizationCode.getToken(options);
         const {
            token
         } = oauth2.accessToken.create(result);

         var expiryTime = new Date();
         expiryTime = new Date(expiryTime.getTime() + token.expires_in - 10);
         let u = await _auth.createOrLoadAndUpdateUser(token.sub, token.access_token, token.refresh_token, expiryTime);

         let user = {
            userid: u.user_id
         };

         req.session.user = user;

         res.redirect('/loggedin');

      } catch (error) {
         console.error('Access Token Error', error.message);
         return res.status(500).json('Authentication failed');
      }
   });

   app.getAccessTokenForUser = async function (user) {

      let d = new Date();
      if (d.getTime() < user.token_expiry_date.getTime()) {
         console.log('Auth key still valid');
         return _auth.decryptAccessToken(user);
      } else {

         const tokenObject = {
            'access_token': _auth.decryptAccessToken(user)
            , 'refresh_token': _auth.decryptRefreshToken(user)
            , 'expires_in': '7200'
         };

         let accessToken = oauth2.accessToken.create(tokenObject);

         try {
            accessToken = await accessToken.refresh();
         } catch (error) {
            console.log('Error refreshing access token: ', error.message);
         }

         // console.log('New token:', accessToken.token.access_token);

         _auth.updateTokensForUser(user, accessToken.token.access_token, accessToken.token.refresh_token);
         return accessToken.token.access_token;
      }
   };

   app.findUserBySiteSecret = async function (siteSecret) {
      return await _auth.findUserBySiteSecret(siteSecret);
   }

   app.findUserById = async function (id) {
      return await _auth.findUserById(id);
   };

   app.findUserBySub = async function (sub) {
      return await _auth.findUserBySub(sub);
   };

   app.findUserBySiteId = async function (siteID, sitePW) {
      return await _auth.findUserBySiteId(siteID, sitePW);
   };

   return app;
}

module.exports = FIPHR;
