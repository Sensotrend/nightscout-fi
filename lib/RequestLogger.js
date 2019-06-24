import LogEntry from './models/logentry.model.js';
import * as httpContext from 'express-cls-hooked';

/**
 * Mongo based request logger with entry counts
 */
export class RequestLogger {

   constructor(env) {
      this.env = env;
   }

   startLogging(user_id, method, url) {
      const e = {
         user_id,
         rest_http_method: method,
         rest_url: url
      };

      this.env.logger.info(method + ' ' + url + ' for ' + user_id);
      httpContext.set('logentry', e);
   }

   addLogData(data) {
      const entry = httpContext.get('logentry');
      const merged = {...entry, ...data};
      httpContext.set('logentry', merged);
   }

   setLogValue(key, value) {
      const entry = httpContext.get('logentry');
      entry[key] = value;
      httpContext.set('logentry', entry);
   }

   async writeLog () {
      const entry = httpContext.get('logentry');

      try {
         await LogEntry.collection.insert(entry, {});
         httpContext.set('logentry', {});
      } catch (error) {
         this.env.logger.error(error);
      }

      this.env.logger.info('-------------------------------------------');
      this.env.logger.info('entry' + JSON.stringify(entry));
   }
}

/*
user_id: { type: String, required: true, index: true },
  access_key: { type: String },
  rest_http_method: { type: String, required: true },
  rest_url: { type: String, required: true },
  rest_records_returned: { type: Number },
  fhir_operation: { type: String },
  fhir_records_saved: { type: Number },
  fhir_records_skipped: { type: Number },
  conversion_records_skipped_old: { type: Number },
  conversion_records_unrecognized: { type: Number }
*/
