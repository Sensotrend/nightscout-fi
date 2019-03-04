const express = require('express');
const passport = require('passport');

const cookieSession = require('cookie-session');
const axios = require('axios');
const nanoid = require('nanoid');

const Mongo = require('./lib/Mongo.js')();

const { decorateApp } = require('@awaitjs/express');
const { wrap } = require('@awaitjs/express');
const app = decorateApp(express());

const bodyParser = require('body-parser');

const env = require('./lib/env')();

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
    console.log('deserializeUser');
    done(null, user);
});

// Middleware to check if the user is authenticated
async function isUserAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.send('You must login!');
    }
}


// USER FACING URLS

app.getAsync('/', async (req, res) => {
    console.log(req.headers);
    res.render('index.ejs');
});

app.getAsync('/loggedin', isUserAuthenticated, async function (req, res) {
    console.log(req.user);
    
    let user = await env.userProvider.findUserById(req.user.userid);
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

let NSRestService = require('./lib/NSRESTService')(env);

app.use('/api/v1', NSRestService);
