import mongoose from 'mongoose';

function Mongo () {

   if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI missing, application cannot start');
      process.exit(1);
   }

   let mongoDB = process.env.MONGODB_URI;
   mongoose.connect(mongoDB);
   mongoose.Promise = global.Promise;
   var _db = mongoose.connection;
   _db.on('error', console.error.bind(console, 'MongoDB connection error:'));

   Mongo.getConnection = function () {
      return _db;
   };

   return Mongo;
}

export default Mongo;
