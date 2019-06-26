import LogEntry from './models/logentry.model.js';
import * as httpContext from 'express-cls-hooked';

const logRequestData = process.env.ENABLE_REQUEST_LOGGING ? !!process.env.ENABLE_REQUEST_LOGGING : false;
const logSensitiveRequestData = process.env.ENABLE_SENSITIVE_LOGGING ? !!process.env.ENABLE_SENSITIVE_LOGGING && logRequestData : false;

/**
 * Mongo based request logger with entry counts
 */
export class RequestLogger {

   constructor(env) {
      this.env = env;
   }

   startLogging(user_id, req) {
      if (!logRequestData) return;
      const rest_http_method = req.method;
      const rest_url = req.originalUrl;

      const e = {
         user_id,
         rest_http_method,
         rest_url
      };
      this.env.logger.info(`${rest_http_method} ${rest_url} for ${user_id}`);
      httpContext.set('logentry', e);
   }

   addSensitiveLogValue(key, value) {
      if (!logSensitiveRequestData) return;
      this.setLogValue(key, value);
   }

   addLogData(data) {
      if (!logRequestData) return;
      const entry = httpContext.get('logentry');
      const merged = {...entry, ...data};
      httpContext.set('logentry', merged);
   }

   setLogValue(key, value) {
      if (!logRequestData) return;
      const entry = httpContext.get('logentry');
      entry[key] = value;
      httpContext.set('logentry', entry);
   }

   async writeLog () {
      if (!logRequestData) return;
      const entry = httpContext.get('logentry');

      try {
         await LogEntry.collection.insert(entry, {});
         httpContext.set('logentry', {});
      } catch (error) {
         this.env.logger.error(error);
      }

      this.env.logger.info('request log ' + JSON.stringify(entry));
   }
}
