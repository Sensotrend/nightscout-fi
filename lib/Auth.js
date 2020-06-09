import User from './models/user.model.js';
import uuidv4 from 'uuid/v4';
import crypto from 'crypto';

const algorithm = 'aes-256-ctr';

function Auth (encryption_key, env) {

   const logger = env.logger;

   const _key = encryption_key;

   function encrypt (text) {
      const cipher = crypto.createCipher(algorithm, _key);
      let crypted = cipher.update(text, 'utf8', 'hex');
      crypted += cipher.final('hex');
      return crypted;
   }

   function decrypt (text) {
      const decipher = crypto.createDecipher(algorithm, _key)
      let dec = decipher.update(text, 'hex', 'utf8')
      dec += decipher.final('utf8');
      return dec;
   }

   function sha1(string) {
      const shasum = crypto.createHash('sha1');
      shasum.update(string);
      return shasum.digest('hex');
   }

   Auth.sha1 = sha1;

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
         logger.debug('Loaded user ' + userId);
         return user;
      } else {
         logger.error('No user found for id ' + userId);
         return false;
      }
   };

   Auth.deleteUser = async function (userId) {
      logger.info('Deleting user ' + userId);
      try {
         await User.deleteOne({
            user_id: userId
         });
         return true;
      } catch (error) {
         logger.error('Deleting user failed ' + userId);
         return false;
      }
   };

   Auth.findUserByEmailAndSecret = async function (email, password) {

      let user = await User.findOne({
         email: email,
         password: sha1(password)
      });

      if (user) {
         logger.debug('Loaded user:' + user.email);
         return user;
      } else {
       logger.error('User not found: ' + email + ' / ' + password + '(' + sha1(password) + ').');
       return false;
      }
   };

   Auth.findUserBySiteId = async function (siteID, siteSecret) {

      let user = await User.findOne({
         site_id: siteID
      });

      if (user) logger.debug('Loaded user: ' + user.site_id);
      else logger.error('User ' + siteID + ' not found');

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
         logger.info('Problem persisting refreshed token ' + error);
      }
   };

   Auth.createOrLoadAndUpdateUser = async function (sub, access_token, refresh_token, token_expiry_date) {
      try {
         let u = await Auth.findUserBySub(sub);

         if (!u) {
            u = await Auth.createUser(sub, access_token, refresh_token, token_expiry_date);
            logger.debug('created user' + u);
         } else {
            u.access_token = encrypt(access_token);
            u.refresh_token = encrypt(refresh_token);
            u.token_expiry_date = token_expiry_date;
            await u.save();
         }

         logger.info('Loaded user: ' + JSON.stringify(u));

         return u;

      } catch (error) {
         logger.error('Problem accessing user ' + error);
         return false;
      }
   };

   Auth.findUserBySub = async function (sub) {
      return await User.findOne({
         sub: sub
      }).exec();
   };

   Auth.createUser = async function (sub, access_token, refresh_token, token_expiry_date) {

      const user = new User({
         user_id: uuidv4(),
         sub: sub,
         access_token: encrypt(access_token),
         refresh_token: encrypt(refresh_token),
         token_expiry_date: token_expiry_date
      });

      try {
         await user.save();
         logger.info('Created new user: ' + JSON.stringify(user));
         return user;
      } catch (error) {
         logger.error('Error creating user ' + error);
         return false;
      }
   };

   return Auth;
}

export default Auth;
