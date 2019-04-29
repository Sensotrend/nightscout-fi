const User = require('./models/user.model.js');
const nanoid = require('nanoid');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

function Auth (encryption_key) {

   _key = encryption_key;

   function encrypt (text) {
      var cipher = crypto.createCipher(algorithm, _key);
      var crypted = cipher.update(text, 'utf8', 'hex');
      crypted += cipher.final('hex');
      return crypted;
   }

   function decrypt (text) {
      var decipher = crypto.createDecipher(algorithm, _key)
      var dec = decipher.update(text, 'hex', 'utf8')
      dec += decipher.final('utf8');
      return dec;
   }

   function sha1 (string) {
      let shasum = crypto.createHash('sha1');
      shasum.update(string);
      return shasum.digest('hex');
   }

   Auth.decryptAccessToken = function (user) {
      return decrypt(user.access_token);
   }

   Auth.decryptRefreshToken = function (user) {
      return decrypt(user.refresh_token);
   }

   Auth.findUserById = async function (userId) {

      let user = await User.findOne({
         user_id: userId
      });

      if (user) {
         console.log('Loaded user', userId);
         return user;
      } else {
         console.log('Not user found for id', userId);
         return false;
      }
   };

   Auth.deleteUser = async function (userId) {
      try {
         let user = await User.deleteOne({
            user_id: userId
         });
         return true;
      } catch (error) {
         console.log('Deleting user failed', userId);
         return false;
      }
   };

   Auth.findUserBySiteSecret = async function (siteSecret) {

      let user = await User.findOne({
         $or: [{
            site_secret: siteSecret
         }, {
            site_secret_SHA1: siteSecret
         }]
      });

      if (user) {
         console.log('Loaded user:', user.site_id);
         return user;
      } else {
         console.log('Not site found for secret', siteSecret);
         return false;
      }
   };

   Auth.findUserByEmailAndSecret = async function (email, siteSecret) {

      let user = await User.findOne({
         email: email,
         site_secret: siteSecret
      });

      if (user) {
         console.log('Loaded user:', user.email);
         return user;
      } else {
       console.log('User', email, 'not found');
       return false;
      }
   };

   Auth.findUserBySiteId = async function (siteID, siteSecret) {

      let user = await User.findOne({
         site_id: siteID
      });

      if (user) console.log('Loaded user:', user.site_id);
      else console.log('User', siteID, 'not found');

      let siteIDSHA1 = sha1(siteSecret);

      if (user && (user.site_secret == siteIDSHA1 || user.site_secret == siteSecret)) return user;

      return false;
   };

   Auth.updateTokensForUser = async function (user, accessToken, refreshToken) {
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

   Auth.createOrLoadAndUpdateUser = async function (sub, access_token, refresh_token, token_expiry_date) {
      try {
         let u = await Auth.findUserBySub(sub);

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

   Auth.findUserById = async function (user_id) {
      return await User.findOne({
         user_id: user_id
      }).exec();
   };

   Auth.findUserBySub = async function (sub) {
      return await User.findOne({
         sub: sub
      }).exec();
   };

   Auth.createUser = async function (sub, access_token, refresh_token, token_expiry_date) {

      const secret = nanoid(18);

      const user = new User({
         user_id: uuidv4(),
         site_id: nanoid(8).toLowerCase(),
         site_secret: secret,
         site_secret_SHA1: sha1(secret),
         sub: sub,
         access_token: encrypt(access_token),
         refresh_token: encrypt(refresh_token),
         token_expiry_date: token_expiry_date
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
