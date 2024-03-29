import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import MongoStoreModule from 'connect-mongo';
import { decorateApp } from '@awaitjs/express';

import envModule from './env';
import NSRestService from './NSRESTService';
import NightscoutViewConsentService from './NightscoutConsentService.js';
import EmailVerificationService from './EmailVerificationService.js';
import TidepoolRESTService from './TidepoolRESTService';

import BootEvent from './bootevent.js';

import FIPHR from './oauthproviders/FIPHR.js';

import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

const env = envModule();
env.setOauthProvider(FIPHR(env));

BootEvent(env);

const MongoStore = MongoStoreModule(session);
const app = decorateApp(express());

app.env = env;

//app.use('/public', express.static(path.join(__dirname, '../public/')));

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

if (process.env.NODE_ENV !== 'production') {
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
   res.status(451).send('');;
});

app.deleteAsync('/api/deleteuser', async function (req, res) {
   if (!req.session || !req.session.user) {
      res.status(400).json('Not authenticated');
      return;
   }
   const user = await env.userProvider.findUserById(req.session.user.user_id);
   if (user) {
      const email = user.email;
      const success = await env.userProvider.deleteUser(req.session.user.user_id);
      if (success) {
         sgMail.setApiKey(SENDGRID_API_KEY);
         const msg = {
            to: email,
            from: 'info@sensotrend.com',
            templateId: 'd-98aef7de7c624cd7b931bde0daf67302' // Account deleted template
         };
         await sgMail.send(msg);
         console.log('Sent email confirmation on account deletion.');
      } else {
         console.error('Failed to send the email confirmation on account deletion. Status', success);
      }

   } else {
      console.error('Could not find matching user in database!', req.session.user);
   }
   req.session.destroy();
   res.redirect('/deleted');
});

function send451(req, res) {
   res.status(451).send('');;
} 

app.get('/api*', send451);
app.put('/api*', send451);
app.post('/api*', send451);
app.get('/auth/*', send451);
app.post('/auth/*', send451);
app.get('/emailverification*', send451);
app.post('/emailverification*', send451);
app.get('/fiphr*', send451);
app.post('/fiphr*', send451);
app.get('/nsconsent*', send451);
app.post('/nsconsent*', send451);
app.get('/pebble', send451);
app.get('/tp*', send451);
app.put('/tp*', send451);
app.post('/tp*', send451);


// Logout route
app.get('/logout', (req, res) => {
   req.session.destroy();
   // res.render('loggedout.ejs');
   res.status(200).json({ status: 'OK' });
});


//production mode
if (process.env.NODE_ENV === 'production') {
   app.use(express.static(path.resolve(__dirname + '/../build/')));
   app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname + '/../build/index.html'));
   })
}

app.use(function(err, req, res, next) {
   if (err.type && err.type === 'entity.parse.failed') {
      res.status(400).send('JSON parsing failed for your request'); 
   } else {
      env.logger.error('Problem serving URL ' + req.originalUrl);
      env.logger.error(err);
      env.logger.error(err.stack);
      res.status(500).send('');
   }
 });

app.listen(process.env.PORT, () => {
   const version = process.env.npm_package_version;
   env.logger.info('Started server ' + version);
});

export default app;
