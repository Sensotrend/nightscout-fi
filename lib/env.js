import nanoid from 'nanoid';
import Auth from './Auth'
import Mongo from './Mongo';
import fs from 'fs';
import monq from 'monq';


function getEnvBoolean(varname, defaultValue) {
    const v = process.env[varname];
    if (v) {
        if (v === 'true' || v === 'on' || v === '1')
        {
            return true;
        } else {
            return false;
        }
    }
    return defaultValue;
}

function env () {
    const TOKEN_ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;
    if (!TOKEN_ENCRYPTION_KEY) {
        console.error('TOKEN_ENCRYPTION_KEY missing, cannot start');
        process.exit();
    }
    const FHIR_SERVER = process.env.FHIR_SERVER;
    if (!FHIR_SERVER) {
        console.error('FHIR_SERVER missing, cannot start');
        process.exit();
    }

    const monqClient = monq(process.env.MONGODB_URI);
    env.monq = monqClient;

    env.userProvider = Auth(TOKEN_ENCRYPTION_KEY);
    env.FHIRServer = FHIR_SERVER;
    if (process.env.MONGODB_URI) {
        env.MONGODB_URI = process.env.MONGODB_URI;
        env.mongo = Mongo();
    }
    env.randomString = nanoid;
    env.session_key = process.env.SESSION_KEY || '2466c1cc-3bed-11e9-a4de-53cf880a6d1a-2d2ea702-3bed-11e9-8842-ef5457fba264';
    env.hideLogin = getEnvBoolean('HIDE_LOGIN', true);

    env.setOauthProvider = function (oauthProvider) {
        env.oauthProvider = oauthProvider;
    }
    env.uploadPath = __dirname + '/../uploads/';
    env.apiURL = process.env.API_URL;

    const authCert = process.env.FIPHR_AUTH_CERT_PATH;
    const authKey = process.env.FIPHR_AUTH_KEY_PATH;

    if (authCert) {
        env.https_privateKey = fs.readFileSync(authKey, 'utf8');
        env.https_certificate = fs.readFileSync(authCert, 'utf8');
        console.log('Using certificate and private key for HTTPS');
    }

    return env;
}

export default env;


