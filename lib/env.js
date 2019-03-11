
const nanoid = require('nanoid');

function env () {

    const TOKEN_ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;

    env.useWildcardDomains = false;
    if (process.env.WILDCARD_DOMAINS) env.useWildcardDomains = process.env.WILDCARD_DOMAINS;

    const SESSION_KEY = process.env.SESSION_KEY || '2466c1cc-3bed-11e9-a4de-53cf880a6d1a-2d2ea702-3bed-11e9-8842-ef5457fba264';
    env.session_key = SESSION_KEY;

    if (!TOKEN_ENCRYPTION_KEY) { console.error('TOKEN_ENCRYPTION_KEY missing, cannot start'); process.exit(); }

    const Auth = require('./Auth.js')(TOKEN_ENCRYPTION_KEY);
    const FIPHR = require('./FIPHR')(Auth);

    if (!process.env.FHIR_SERVER) { console.error('FHIR_SERVER missing, cannot start'); process.exit();}
    env.FHIRServer = process.env.FHIR_SERVER;

    env.userProvider = FIPHR;
    env.PassportStrategy = FIPHR.FIPHRStrategy;

    env.randomString = nanoid;

    env.uploadPath = __dirname + '/../uploads/';

    env.apiURL = process.env.API_URL;

    return env;
}

module.exports = env;

