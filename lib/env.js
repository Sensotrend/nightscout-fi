import nanoid from 'nanoid';
import Auth from './Auth'
import Mongo from './Mongo';
import fs from 'fs';
import { createLogger, format, transports } from 'winston';
import DeviceLastSeenService from './RecordSkipManager';
import { DefaultConversionService } from 'sensotrend-converter';

const { combine, timestamp, label } = format;

function getEnvBoolean (varname, defaultValue) {
   const v = process.env[varname];
   if (v) {
      if (v === 'true' || v === 'on' || v === '1') {
         return true;
      } else {
         return false;
      }
   }
   return defaultValue;
}

function makeLogger () {

   const alignedWithColorsAndTime = format.combine(
      format.colorize(),
      format.timestamp(),
      format.align(),
      format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
   );

   const level = process.env.LOGGING_LEVEL ? process.env.LOGGING_LEVEL : 'info';

   const logger = createLogger({
      level,
      format: combine(
         label({ label: 'right meow!' }),
         timestamp(),
         alignedWithColorsAndTime
      ),
      transports: [new transports.Console()]
   });

   return logger;
}

function Environment () {

   const env = {};
   env.logger = makeLogger();
   env.logger.info('Initializing the environment');

   const TOKEN_ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;
   if (!TOKEN_ENCRYPTION_KEY) {
      env.logger.error('TOKEN_ENCRYPTION_KEY missing, cannot start');
      process.exit();
   }
   const FHIR_SERVER = process.env.FHIR_SERVER;
   if (!FHIR_SERVER) {
      env.logger.error('FHIR_SERVER missing, cannot start');
      process.exit();
   }

   env.userProvider = Auth(TOKEN_ENCRYPTION_KEY, env);
   env.FHIRServer = FHIR_SERVER;
   if (process.env.MONGODB_URI) {
      env.MONGODB_URI = process.env.MONGODB_URI;
      env.mongo = Mongo(env);
   }

   env.lastSeenService = DeviceLastSeenService(env);

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
      env.logger.info('Using certificate and private key for HTTPS');
   }

   env.dataFormatConverter = DefaultConversionService(env.logger);

   return env;
}

export default Environment;
