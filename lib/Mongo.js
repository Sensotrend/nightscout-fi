const mongoose = require('mongoose');

function Mongo (env) {

   const logger = env.logger;

   if (!process.env.MONGODB_URI) {
      logger.error('MONGODB_URI missing, application cannot start');
      process.exit(1);
   }

   const mongoDB = process.env.MONGODB_URI;
   mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
   });
   mongoose.set('useCreateIndex', true);
   mongoose.set('useFindAndModify', false);
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
