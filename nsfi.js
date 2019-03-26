const express = require('express');
const path = require('path');

//const cookieSession = require('cookie-session');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const {
   decorateApp
} = require('@awaitjs/express');

const app = decorateApp(express());

//const bodyParser = require('body-parser');

const expressmarkdown = require('express-markdown-reloaded');
const marked = require('marked');

const env = require('./lib/env')();

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
   , store: new MongoStore({ mongooseConnection: env.mongo.getConnection() })
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
   res.render('index.ejs', {pageEnv: pageEnv});
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

let NSRestService = require('./lib/NSRESTService')(env);

app.use('/api/v1', NSRestService);

let TidepoolRESTService = require('./lib/TidepoolRESTService')(env);

app.use('/tpupload', TidepoolRESTService.uploadApp);
app.use('/tpapi', TidepoolRESTService.APIapp);
app.use('/tpdata', TidepoolRESTService.dataApp);

console.log('TidepoolRESTService started');

let NightscoutViewConsentService = require('./lib/NightscoutConsentService.js')(env);
app.use('/nsconsent', NightscoutViewConsentService);

console.log('Epic Smart Service started');

app.listen(process.env.PORT, () => {
   console.log('Server Started!');
});
