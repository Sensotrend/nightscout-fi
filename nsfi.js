const express = require('express');
const passport = require('passport');

const cookieSession = require('cookie-session');
const axios = require('axios');
const nanoid = require('nanoid');

const Mongo = require('./lib/Mongo.js')();

const { decorateApp } = require('@awaitjs/express');
const { wrap } = require('@awaitjs/express');
const app = decorateApp(express());

const basicAuthParser = require('basic-auth');
const bodyParser = require('body-parser');

const TOKEN_ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;

const SESSION_KEY = process.env.SESSION_KEY || '2466c1cc-3bed-11e9-a4de-53cf880a6d1a-2d2ea702-3bed-11e9-8842-ef5457fba264';

if (!TOKEN_ENCRYPTION_KEY) { console.error('TOKEN_ENCRYPTION_KEY missing, cannot start'); process.exit(); }

const Auth = require('./lib/Auth.js')(TOKEN_ENCRYPTION_KEY);
const FIPHR = require('./lib/FIPHR')(Auth);

// cookieSession config
app.use(cookieSession({
    maxAge: 60 * 60 * 1000, //One hour
    keys: [SESSION_KEY], // Key used to verify the session data, set this for production
    httpOnly: true
}));

app.use(passport.initialize()); // Used to initialize passport
app.use(passport.session()); // Used to persist login sessions

passport.use(FIPHR.FIPHRStrategy);

// Used to stuff a piece of information into a cookie
passport.serializeUser((user, done) => {
    done(null, user);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
    console.log('deserializeUser');
    done(null, user);
});

// Middleware to check if the user is authenticated
async function isUserAuthenticated(req, res, next) {
    if (req.user) {
        console.log('isUserAuthenticated');
        next();
    } else {
        res.send('You must login!');
    }
}


// USER FACING URLS

app.getAsync('/', async (req, res) => {
    res.render('index.ejs');
});

app.getAsync('/loggedin', isUserAuthenticated, async function (req, res) {
    console.log(req.user);
    
    let user = await FIPHR.findUserBySub(req.user.sub);
    console.log('Got user', user);
    res.render('secret.ejs', {user: user});
});

// Logout route
app.get('/logout', (req, res) => {
    req.logout(); 
    res.redirect('/');
});

// OAUTH

app.get('/auth/kanta', passport.authenticate('oauth2', {
    state: nanoid(), // TODO actually store this in session to validate it
    scope: ['offline_access', 'patient/Observation.read', 'patient/MedicationAdministration.read', 'patient/Observation.write', 'patient/MedicationAdministration.write' ] // Used to specify the required data
}));

app.get('/auth/kanta/callback', passport.authenticate('oauth2'), function (req, res) {
    res.redirect('/loggedin');
});

app.listen(process.env.PORT, () => {
    console.log('Server Started!');
});


const Entries = require('./lib/nshandlers/entries')();

// Nightscout

const NightscoutRESTServer = decorateApp(express());
const NSPort = 1400;

NightscoutRESTServer.use(bodyParser.json());

async function getUser(req) {
    let user;
    let credentials = basicAuthParser(req);

    if (credentials) {
     user = credentials.name;
    } else {
        user = req.header('api-secret');
    }
    
    if (!user) return false;

    return FIPHR.findUserBySiteId(user);
}

NightscoutRESTServer.getAsync('/api/v1/entries', async (req, res) => {

    let user = await getUser(req);
    
    if (!user) {
        res.status(403).send('Unauthorized');
    } else {
        let token = await FIPHR.getAccessTokenForUser(user);
        let entries = await Entries.getEntries('https://fhirsandbox2.kanta.fi/phr-resourceserver/baseStu3', user.sub, token);
        res.send(entries);
    }
});

NightscoutRESTServer.postAsync('/api/v1/entries', async (req, res) => {

    if (req.body.constructor != Array) {
        res.status(400).send('POST body missing');
        return;
    }

    let user = await getUser(req);

    if (!user) {
        res.status(403).send('Unauthorized');
    } else {
        let token = await FIPHR.getAccessTokenForUser(user);
        let entries = await Entries.postEntries('https://fhirsandbox2.kanta.fi/phr-resourceserver/baseStu3', user.sub, token, req.body );
        res.send(entries);
    }


    /*NightscoutRESTServer.postAsync('/api/v1/entries', async (req, res) => {

    console.log('/entries POST REQUEST' + JSON.stringify(req.headers));

    if (req.body.constructor != Array) {
        res.status(400).send('POST body missing');
        return;
    }

    let credentials = basicAuthParser(req);
    var auth = await getUserInfo(credentials.name, credentials.pass);

    if (auth.authentication) {
        console.log('We got a body');
        console.log(credentials.name, credentials.pass);
        console.log(auth);
        let userid = auth.data.userid;
        let fhirserver = auth.data.server;
*/
});

NightscoutRESTServer.listen(NSPort, () => console.log(`NS app listening on port ${NSPort}!`));
