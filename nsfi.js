import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import MongoStoreModule from 'connect-mongo';
import expressmarkdown from 'express-markdown-reloaded';
import marked from 'marked';
import { decorateApp } from '@awaitjs/express';

import envModule from './lib/env';
import NSRestService from './lib/NSRESTService';
import NightscoutViewConsentService from './lib/NightscoutConsentService.js';
import EmailVerificationService from './lib/EmailVerificationService.js';
import TidepoolRESTService from './lib/TidepoolRESTService';

import FIPHR from './lib/oauthproviders/FIPHR.js';

import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

const env = envModule();
env.setOauthProvider(FIPHR(env));

const MongoStore = MongoStoreModule(session);
const app = decorateApp(express());

app.env = env;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/public', expressmarkdown({
   directory: path.join(__dirname, '/public'),
   caseSensitive: app.get('case sensitive routing'),
   view: 'markdown',
   includerawtext: false,
   loadepiceditor: false,
   marked: {
      renderer: new marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: false,
      highlight: function (code) {
         return highlightjs.highlightAuto(code).value;
      }
   },
   context: {
      title: 'Nightscout.fi'
   }
}));

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

if (process.env.NODE_ENV != 'production') {
   var corsOptions = {
      origin: 'http://localhost:3000',
      credentials: true,
      optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
   };
   app.use(cors(corsOptions));
   app.options('*', cors(corsOptions));
}

// Middleware to check if the user is authenticated
async function isUserAuthenticated (req, res, next) {
   if (req.session && req.session.user) {
      next();
   } else {
      res.redirect('/');
   }
}

app.getAsync('/loggedin', isUserAuthenticated, async function (req, res) {

   const user = await env.userProvider.findUserById(req.session.user.user_id);

   if (!user.email) {
      res.redirect('/emailverification/generateRequest');
   } else {
      const pageEnv = { apiURL: env.apiURL };

      res.render('secret.ejs', {
         user: user,
         pageEnv,
      });
   }
});

app.deleteAsync('/api/deleteuser', async function (req, res) {

   if (!req.session || !req.session.user) {
      res.status(400).json('Not authenticated');
      return;
   }

   const user = await env.userProvider.findUserById(req.session.user.user_id);
   const email = user.email;
   const success = await env.userProvider.deleteUser(req.session.user.user_id);

   if (success) {

      sgMail.setApiKey(SENDGRID_API_KEY);

      const msg = {
         to: email,
         from: 'info@sensotrend.com',
         templateId: 'd-98aef7de7c624cd7b931bde0daf67302' // Account deleted template
      };

      let status = await sgMail.send(msg);

      req.session.destroy();
      res.send({ status: 'OK' });
   } else {
      res.send({ status: 'FAILED' });
   }
});

// Logout route
app.get('/logout', (req, res) => {
   req.session.destroy();
   // res.render('loggedout.ejs');
   res.status(200).json({ status: 'OK' });
});

/// Kanta authentication

app.use('/fiphr', env.oauthProvider);
app.use('/auth/kanta', env.oauthProvider);
////

let nsrest = NSRestService(env);
app.use('/api/v1', nsrest);
app.use('/pebble', nsrest);

let tidepoolService = TidepoolRESTService(env);

app.use('/tpupload', tidepoolService.uploadApp);
app.use('/tpapi', tidepoolService.APIapp);
app.use('/tpdata', tidepoolService.dataApp);

env.logger.info('TidepoolRESTService started');

let nightscoutService = NightscoutViewConsentService(env);

app.use('/nsconsent', nightscoutService);

env.logger.info('Nightscout access consent Service started');

let emailService = EmailVerificationService(env);

app.use('/emailverification', emailService);

env.logger.info('Email verification Service started');

//production mode
if (process.env.NODE_ENV === 'production') {
   app.use(express.static(path.join(__dirname, 'build/')));
   //
   app.get('*', (req, res) => {
      res.sendfile(path.join(__dirname = 'build/index.html'));
   })
}

app.listen(process.env.PORT, () => {
   env.logger.info('Server Started!');
});

export default app;
