import express from 'express';
import path from 'path';
import session from 'express-session';
import MongoStoreModule from 'connect-mongo';
import expressmarkdown from 'express-markdown-reloaded';
import marked from 'marked';
import { decorateApp } from '@awaitjs/express';

import envModule from './lib/env';
import NSRestService from './lib/NSRESTService';
import NightscoutViewConsentService from './lib/NightscoutConsentService.js';
import TidepoolRESTService from './lib/TidepoolRESTService';

const env = envModule();
const MongoStore = MongoStoreModule(session);
const app = decorateApp(express());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// !!!IMPORTANT: place this before static or similar middleware
app.use('/public', expressmarkdown({
   directory: path.join(__dirname, '/public')
   , caseSensitive: app.get('case sensitive routing')
   , view: 'markdown'
   , includerawtext: false
   , loadepiceditor: false
   , marked: {
      renderer: new marked.Renderer()
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

app.use(session({
   secret: env.session_key
   , cookie: {
      maxAge: 60000
   }
   , resave: true
      //, saveUninitialized: true
   , store: new MongoStore({
      mongooseConnection: env.mongo.getConnection()
   })
}));

// Middleware to check if the user is authenticated
async function isUserAuthenticated (req, res, next) {
   if (req.session.user) {
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
   res.render('index.ejs', {
      pageEnv: pageEnv
   });
});

app.getAsync('/loggedin', isUserAuthenticated, async function (req, res) {

   let user = await env.userProvider.findUserById(req.session.user.userid);

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

/// Kanta authentication

app.use('/fiphr', env.userProvider);

////

let nsrest = NSRestService(env);
app.use('/api/v1', nsrest);

let tidepoolService = TidepoolRESTService(env);

app.use('/tpupload', tidepoolService.uploadApp);
app.use('/tpapi', tidepoolService.APIapp);
app.use('/tpdata', tidepoolService.dataApp);

console.log('TidepoolRESTService started');

let nightscoutService = NightscoutViewConsentService(env);

app.use('/nsconsent', nightscoutService);

console.log('Epic Smart Service started');

app.listen(process.env.PORT, () => {
         console.log('Server Started!');
});
