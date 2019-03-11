const bodyParser = require('body-parser');
const express = require('express');
const {
   decorateApp
} = require('@awaitjs/express');
const basicAuthParser = require('basic-auth');

function NSRestServer (env) {

   const Entries = require('./nshandlers/entries')();

   // Nightscout

   const NightscoutRESTServer = decorateApp(express());
   //const NSPort = 1400;

   NightscoutRESTServer.use(bodyParser.json());

   async function getUser (req, res, next) {

      var u;

      if (env.useWildcardDomains) {

         // Load user based on a custom domain / user

         let user;
         let credentials = basicAuthParser(req);

         if (credentials) {
            user = credentials.name;
         } else {
            user = req.header('api-secret');
         }
         if (!user) return false;
         let site = req.header('Host').split('.')[0];

         console.log('Trying to login on site', site);

         u = await env.userProvider.findUserBySiteId(site, user);
      } else {
         let site_secret;
         let credentials = basicAuthParser(req);

         if (credentials) {
            site_secret = credentials.name;
         } else {
            site_secret = req.header('api-secret');
         }

         if (!site_secret) return false;
         u = await env.userProvider.findUserBySiteSecret(site_secret);
      }

      if (u) {
         req.user = u;
         req.isAuthenticated = true;
         next();
      } else {
         res.status(403).send('Unauthorized');
      }
   }

   NightscoutRESTServer.getAsync('/entries', getUser, async (req, res) => {

      let token = await env.userProvider.getAccessTokenForUser(req.user);
      let entries = await Entries.getEntries(env.FHIRServer, req.user.sub, token);
      res.send(entries);
   });

   NightscoutRESTServer.postAsync('/entries', getUser, async (req, res) => {

      if (req.body.constructor != Array) {
         res.status(400).send('POST body missing');
         return;
      }
      let token = await env.userProvider.getAccessTokenForUser(req.user);
      let entries = await Entries.postEntries(env.FHIRServer, req.user.sub, token, req.body);
      res.send(entries);
   });

   //NightscoutRESTServer.listen(NSPort, () => console.log(`NS app listening on port ${NSPort}!`));

   return NightscoutRESTServer;
}

module.exports = NSRestServer;
