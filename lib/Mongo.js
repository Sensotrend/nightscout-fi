const mongoose = require('mongoose');

function Mongo (env) {

   const logger = env.logger;

   if (!process.env.MONGODB_URI) {
      logger.error('MONGODB_URI missing, application cannot start');
      process.exit(1);
   }

   const mongoDB = process.env.MONGODB_URI;
   mongoose.connect(mongoDB, {
      reconnectTries : Number.MAX_VALUE,
      autoReconnect : true,
      reconnectInterval: 2000,
      useNewUrlParser: true,
      useUnifiedTopology: true
   });
   mongoose.set('useCreateIndex', true);
   mongoose.Promise = global.Promise;
   const _db = mongoose.connection;
   _db.on('error', logger.error.bind(console, 'MongoDB connection error:'));

   Mongo.getConnection = function () {
      return _db;
   };

   Mongo.closeConnection = function () {
      mongoose.connection.close();
   };

   return Mongo;
}

module.exports = Mongo;
