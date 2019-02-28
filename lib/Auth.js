const User = require('./models/user.model.js');
const nanoid = require('nanoid');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

function Auth(encryption_key) {

   _key = encryption_key;

   function encrypt(text) {
      var cipher = crypto.createCipher(algorithm, _key);
      var crypted = cipher.update(text, 'utf8', 'hex');
      crypted += cipher.final('hex');
      return crypted;
   }

   function decrypt(text) {
      var decipher = crypto.createDecipher(algorithm, _key)
      var dec = decipher.update(text, 'hex', 'utf8')
      dec += decipher.final('utf8');
      return dec;
   }

   Auth.decryptAccessToken = function(user) {
      return decrypt(user.access_token);
   }

   Auth.decryptRefreshToken = function(user) {
      return decrypt(user.refresh_token);
   }

   Auth.findUserBySiteId = async function(siteID) {

      let user = await User.findOne({
         $or: [{
            site_id: siteID
         }, {
            site_id_sha1: siteID
         }]
      });

      return user;
   };

   Auth.updateTokensForUser = async function(user, accessToken, refreshToken) {
      user.access_token = encrypt(accessToken);
      user.refresh_token = encrypt(refreshToken);
      var expiryTime = new Date();
      expiryTime = new Date(expiryTime.getTime() + 1000 * 3500); // TODO: use actual value

      user.token_expiry_date = expiryTime;
      try {
         await user.save();
      } catch (error) {
         console.log('Problem persisting refreshed token', error);
      }
   };

   Auth.createOrLoadAndUpdateUser = async function(sub, access_token, refresh_token, token_expiry_date) {
      try {
         var u = await Auth.findUserBySub(sub);

         if (!u) {
            u = await Auth.createUser(sub, access_token, refresh_token, token_expiry_date);
            console.log('created user', u);
         } else {
            u.access_token = encrypt(access_token);
            u.refresh_token = encrypt(refresh_token);
            u.token_expiry_date = token_expiry_date;
            await u.save();
         }
         return u;

      } catch (error) {
         console.error('Problem accessing user', error);
         return false;
      }
   };

   Auth.findUserBySub = async function(sub) {
      //       console.log('Searching user for sub', sub);
      return await User.findOne({
         sub: sub
      }).exec();
      //let promise = query.exec();
      //return promise;
   };

   Auth.createUser = async function(sub, access_token, refresh_token, token_expiry_date) {

      let siteID = nanoid(16);
      let shasum = crypto.createHash('sha1');
      shasum.update(siteID);
      let siteIDSHA1 = shasum.digest('hex');

      let user = new User({
         site_id: siteID
         , site_id_sha1: siteIDSHA1
         , sub: sub
         , access_token: encrypt(access_token)
         , refresh_token: encrypt(refresh_token)
         , token_expiry_date: token_expiry_date
      });

      try {
         await user.save();
         return user;
      } catch (error) {
         console.error('Error creating user', error);
         return false;
      }
   };

   return Auth;
}

module.exports = Auth;