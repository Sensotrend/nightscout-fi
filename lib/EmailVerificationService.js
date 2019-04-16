/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint no-console: 0, import/no-unresolved: 0 */
import express from 'express';
import { decorateApp } from '@awaitjs/express';
import nanoid from 'nanoid';
import EmailVerificationRequest from './models/emailverificationrequest.model';
import path from 'path';
import session from 'express-session';
import MongoStoreProvider from 'connect-mongo';
import bodyParser from 'body-parser';
import sgMail from '@sendgrid/mail';

const MongoStore = MongoStoreProvider(session);

const EMAILVERIFICATION_BASE_URL = process.env.EMAILVERIFICATION_BASE_URL ? process.env.EMAILVERIFICATION_BASE_URL : 'http://localhost:1300/emailverification';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const frontend = process.env.FRONTEND;

function EmailVerificationService (env) {

   const app = decorateApp(express());

   app.use(bodyParser.urlencoded({
      extended: false
   }));

   app.use(bodyParser.json());

   app.set('views', path.join(__dirname, '../emailverification/views'));
   app.set('view engine', 'ejs');

   app.use('/static', express.static(path.join(__dirname, '../emailverification/static')));

   // Use session to pass the iss information to the callback
   app.use(session({
      secret: env.session_key,
      cookie: { maxAge: 60000 },
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: env.mongo.getConnection() }),
   }));

   // Callback service parsing the authorization token and asking for the access token
   app.get('/generateRequest', async (req, res) => {
      if (req.session.user) {
         generateRequestForm(req, res);
      } else {
         res.redirect('/');
      }
   });

   async function generateRequestForm (req, res) {

      console.log('Generating email request form');
      return res.render('emailrequest_request.ejs', {

      });
   }

   app.post('/sendverificationrequest', async (req, res) => {

      if (!req.session || !req.session.user) {
         return res.status(400).json({ error: 'Not authenticated' });
      }

      let requestID = nanoid(18);

      let accessRequest = new EmailVerificationRequest({
         request_id: requestID,
         user_id: req.session.user.user_id,
         email: req.body.email,
         last_sent: new Date(),
      });

      try {
         await accessRequest.save();
      } catch (error) {
         console.error('Error creating accessRequest', error);
      }

      sgMail.setApiKey(SENDGRID_API_KEY);

      const msg = {
         to: req.body.email,
         from: 'info@sensotrend.com',
         templateId: 'd-f7b71eb82f274078a6e0481f911806b8',
         dynamic_template_data: {
            buttonURL: EMAILVERIFICATION_BASE_URL + '/verifyemail/' + requestID,
            name: 'Some One',
            message: req.body.message,
         },
      };

      let status = await sgMail.send(msg);
      console.log('status', status.statusMessage);

      return res.send({
         success: true
      });
   });

   app.get('/verifyemail/:requestid', async (req, res) => {

      const requestid = req.params.requestid;

      if (!requestid) {
         console.warn('Rejecting invalid email request id', requestid);
         return res.redirect(`${frontend}/?error=${encodeURIComponent('Invalid request id')}`);
      }

      const emailRequest = await EmailVerificationRequest.findOne({
         request_id: requestid
      });

      if (!emailRequest) {
         console.error('Did not find the email request for id', requestid);
         return res.redirect(`${frontend}/?error=${encodeURIComponent('Registration not found')}`);
      }

      console.log('Finding user', emailRequest.user_id);

      let user = await env.userProvider.findUserById(emailRequest.user_id);

      if (!user) {
         console.error('Did not find the user associated with email', { requestid, emailRequest });
         return res.redirect(`${frontend}/?error=${encodeURIComponent('User not found')}`);
      }

      console.log('Adding email to user', user.user_id);
      user.email = emailRequest.email;
      req.session.user = user;
      try {
         await user.save();
         console.log('Deleting request id', emailRequest._id);
         try {
            await EmailVerificationRequest.deleteOne({ _id: emailRequest._id });
         } catch (error) {
            console.log('Error deleting request');
         }
         // Send welcome email
         sgMail.setApiKey(SENDGRID_API_KEY);

         const msg = {
            to: user.email,
            from: 'info@sensotrend.com',
            templateId: 'd-5409b88cc7824b998797d8dc6ce0c07e',
            dynamic_template_data: {},
         };

         const status = await sgMail.send(msg);
         console.log('Welcome message status', status);
      } catch (error) {
         console.log('Error saving user');
      }
      return res.redirect(`${frontend}/?verified`);
   });

   app.post('/verify', async (req, res) => {

      console.log('Locating email request', req.body.requestid);

      let requestid = req.body.requestid;
      let emailRequest = await EmailVerificationRequest.findOne({
         request_id: requestid
      });

      if (emailRequest) {

         console.log('Finding user', emailRequest.user_id);

         let user = await env.userProvider.findUserById(emailRequest.user_id);

         if (user) {
            console.log('Adding email to user', user.user_id);
            user.email = emailRequest.email;
            req.session.user = user;
            try {
               await user.save();
            } catch (error) {
               console.log('Error saving user');
            }

            console.log('Deleting request id', emailRequest._id);
            try {
               await EmailVerificationRequest.deleteOne({ _id: emailRequest._id });
            } catch (error) {
               console.log('Error deleting request');
            }

            // Send welcome email

            sgMail.setApiKey(SENDGRID_API_KEY);

            const msg = {
               to: user.email,
               from: 'info@sensotrend.com',
               templateId: 'd-5409b88cc7824b998797d8dc6ce0c07e',
               dynamic_template_data: {},
            };

            let status = await sgMail.send(msg);
            console.log('status', status.statusMessage);

            return res.send({
               success: true
            });
         }

      } else {
         console.log('Email verification request not found');

         if (!req.session || !req.session.user) {
            res.status(400).json('Request not found');
            return;
         }
      }

   });

   return app;
}

export default EmailVerificationService;
