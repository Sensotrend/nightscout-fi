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

   const logger = env.logger;

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
      cookie: { maxAge: 30 * 60 * 1000 },
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({
         mongooseConnection: env.mongo.getConnection(),
         ttl: 30 * 60
      }),
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

      logger.info('Generating email request form');
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
         contact_notifications_flag: req.body.notifications,
         contact_development_flag: req.body.development
      });

      try {
         await accessRequest.save();
      } catch (error) {
         logger.error('Error creating accessRequest ' + error);
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

      return res.send({
         success: true
      });
   });

   app.get('/verifyemail/:requestid', async (req, res) => {

      const requestid = req.params.requestid;

      if (!requestid) {
         logger.warning('Rejecting invalid email request id ' + requestid);
         return res.redirect(`${frontend}/?error=${encodeURIComponent('Invalid request id')}`);
      }

      const emailRequest = await EmailVerificationRequest.findOne({
         request_id: requestid
      });

      if (!emailRequest) {
         logger.error('Did not find the email request for id ' + requestid);
         return res.redirect(`${frontend}/?error=${encodeURIComponent('Registration not found')}`);
      }

      logger.info('Finding user ' + emailRequest.user_id);

      let user = await env.userProvider.findUserById(emailRequest.user_id);

      if (!user) {
         logger.error('Did not find the user associated with email ' + { requestid, emailRequest });
         return res.redirect(`${frontend}/?error=${encodeURIComponent('User not found')}`);
      }

      logger.info('Adding email to user ' + user.user_id);
      user.email = emailRequest.email;
      user.contact_notifications_flag = emailRequest.contact_notifications_flag;
      user.contact_development_flag= emailRequest.contact_development_flag;
      
      req.session.user = user;
      try {
         await user.save();
         logger.info('Deleting request id ' + emailRequest._id);
         try {
            await EmailVerificationRequest.deleteOne({ _id: emailRequest._id });
         } catch (error) {
            logger.info('Error deleting request');
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
         logger.info('Welcome message status ' + status);
      } catch (error) {
         logger.info('Error saving user');
      }
      return res.redirect(`${frontend}/?verified`);
   });

   app.post('/verify', async (req, res) => {

      logger.debug('Locating email request ' + req.body.requestid);

      let requestid = req.body.requestid;
      let emailRequest = await EmailVerificationRequest.findOne({
         request_id: requestid
      });

      if (emailRequest) {

         logger.debug('Finding user' + emailRequest.user_id);

         let user = await env.userProvider.findUserById(emailRequest.user_id);

         if (user) {
            logger.debug('Adding email to user ' + user.user_id);
            user.email = emailRequest.email;
            req.session.user = user;
            try {
               await user.save();
            } catch (error) {
               logger.error('Error saving user');
            }

            logger.debug('Deleting request id ' + emailRequest._id);
            try {
               await EmailVerificationRequest.deleteOne({ _id: emailRequest._id });
            } catch (error) {
               logger.info('Error deleting request');
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

            return res.send({
               success: true
            });
         }

      } else {
         logger.info('Email verification request not found');

         if (!req.session || !req.session.user) {
            res.status(400).json('Request not found');
            return;
         }
      }

   });

   return app;
}

export default EmailVerificationService;
