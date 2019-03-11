const express = require('express');
const passport = require('passport');
const path = require('path');

const cookieSession = require('cookie-session');
const axios = require('axios');

const Mongo = require('./lib/Mongo.js')();

const { decorateApp } = require('@awaitjs/express');
const { wrap } = require('@awaitjs/express');
const app = decorateApp(express());

const bodyParser = require('body-parser');

const expressmarkdown = require('express-markdown-reloaded');
const marked = require('marked');

const env = require('./lib/env')();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// !!!IMPORTANT: place this before static or similar middleware
app.use('/public',expressmarkdown({
    directory: path.join(__dirname,'/public'),
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

/*
app.use(require('express-markdown-reloaded')({
    directory: __dirname + '/public',
    view: 'markdown',
}));
*/
// cookieSession config
app.use(cookieSession({
    maxAge: 60 * 60 * 1000, //One hour
    keys: [env.session_key], // Key used to verify the session data, set this for production
    httpOnly: true
}));

app.use(passport.initialize()); // Used to initialize passport
app.use(passport.session()); // Used to persist login sessions

passport.use(env.PassportStrategy);

// Used to stuff a piece of information into a cookie
passport.serializeUser((user, done) => {
    done(null, user);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Middleware to check if the user is authenticated
async function isUserAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}


// USER FACING URLS

app.getAsync('/', async (req, res) => {
//    console.log(req.headers);
    res.render('index.ejs');
});

app.getAsync('/loggedin', isUserAuthenticated, async function (req, res) {
    let user = await env.userProvider.findUserById(req.user.userid);

    let pageEnv = {
        apiUrl: env.apiURL
    };

    res.render('secret.ejs', {user: user, pageEnv: pageEnv});
});

// Logout route
app.get('/logout', (req, res) => {
    req.logout(); 
    res.render('loggedout.ejs');
});

// OAUTH

app.get('/auth/kanta', passport.authenticate('oauth2', {
    state: env.randomString(), // TODO actually store this in session to validate it
    scope: ['offline_access', 'patient/Observation.read', 'patient/MedicationAdministration.read', 'patient/Observation.write', 'patient/MedicationAdministration.write' ] // Used to specify the required data
}));

app.get('/auth/kanta/callback', passport.authenticate('oauth2'), function (req, res) {
    res.redirect('/loggedin');
});

let NSRestService = require('./lib/NSRESTService')(env);

app.use('/api/v1', NSRestService);

let TidepoolRESTService = require('./lib/TidepoolRESTService')(env);

app.use('/tpupload', TidepoolRESTService.uploadApp);
app.use('/tpapi', TidepoolRESTService.APIapp);
app.use('/tpdata', TidepoolRESTService.dataApp);

console.log('TidepoolRESTService started');

app.listen(process.env.PORT, () => {
    console.log('Server Started!');
});
