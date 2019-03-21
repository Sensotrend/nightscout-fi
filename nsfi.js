import cookieSession from 'cookie-session';
import { decorateApp } from '@awaitjs/express';
import express from 'express';
import expressmarkdown from 'express-markdown-reloaded';
import { initialize, session, use, serializeUser, deserializeUser, authenticate } from 'passport';
import { join } from 'path';
import { Renderer } from 'marked';

import ENV from './lib/env';
import NSRESTService from './lib/NSRESTService';
import TidepoolRESTService from './lib/TidepoolRESTService';

const env = ENV();
const nSRestService = NSRESTService(env);
const tidepoolRESTService = TidepoolRESTService(env);

const app = decorateApp(express());

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

// !!!IMPORTANT: place this before static or similar middleware
app.use('/public', expressmarkdown({
   directory: join(__dirname, '/public')
   , caseSensitive: app.get('case sensitive routing')
   , view: 'markdown'
   , includerawtext: false
   , loadepiceditor: false
   , marked: {
      renderer: new Renderer()
      , gfm: true
      , tables: true
      , breaks: false
      , pedantic: false
      , sanitize: true
      , smartLists: true
      , smartypants: false
      , highlight: function (code) {
         return highlightjs.highlightAuto(code).value;
      }
   }
   , context: {
      title: 'Nightscout.fi'
   }
}));

// cookieSession config
app.use(cookieSession({
   maxAge: 60 * 60 * 1000, //One hour
   keys: [env.session_key], // Key used to verify the session data, set this for production
   httpOnly: true
}));

app.use(initialize()); // Used to initialize passport
app.use(session()); // Used to persist login sessions

use(env.PassportStrategy);

// Used to stuff a piece of information into a cookie
serializeUser((user, done) => {
   done(null, user);
});

// Used to decode the received cookie and persist session
deserializeUser((user, done) => {
   done(null, user);
});

// Middleware to check if the user is authenticated
async function isUserAuthenticated (req, res, next) {
   if (req.user) {
      next();
   } else {
      res.redirect('/');
   }
}

// USER FACING URLS
app.getAsync('/', async (req, res) => {
   let pageEnv = {
      hideLogin: env.hideLogin
   };
   res.render('index.ejs', {pageEnv: pageEnv});
});

app.getAsync('/loggedin', isUserAuthenticated, async function (req, res) {
   let user = await env.userProvider.findUserById(req.user.userid);

   let pageEnv = {
      apiURL: env.apiURL
   };

   res.render('secret.ejs', {
      user: user
      , pageEnv: pageEnv
   });
});

// Logout route
app.get('/logout', (req, res) => {
   req.logout();
   res.render('loggedout.ejs');
});

// OAUTH
app.get('/auth/kanta', authenticate('oauth2', {
   state: env.randomString(), // TODO actually store this in session to validate it
   scope: ['offline_access', 'patient/Observation.read', 'patient/MedicationAdministration.read', 'patient/Observation.write', 'patient/MedicationAdministration.write'] // Used to specify the required data
}));

app.get('/auth/kanta/callback', authenticate('oauth2'), function (req, res) {
   res.redirect('/loggedin');
});

app.use('/api/v1', nSRestService);
app.use('/tpupload', tidepoolRESTService.uploadApp);
app.use('/tpapi', tidepoolRESTService.APIapp);
app.use('/tpdata', tidepoolRESTService.dataApp);

console.log('TidepoolRESTService started');

app.listen(process.env.PORT, () => {
   console.log('Server Started!');
});
