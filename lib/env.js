import nanoid from 'nanoid';

function getEnvVar(varname, defaultValue) {
    if (process.env[varname]) return process.env[varname];
    return defaultValue;
}

function env () {

    const TOKEN_ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;

    env.useWildcardDomains = getEnvVar('WILDCARD_DOMAINS', false);
    env.hideLogin = getEnvVar('HIDE_LOGIN', true);

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

export default env;

