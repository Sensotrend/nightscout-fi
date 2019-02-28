const OauthStrategy = require('passport-oauth2');
const refresh = require('passport-oauth2-refresh');

const OauthClientId = process.env.OAUTH_CLIENT_ID;
const OauthClientSecret = process.env.OAUTH_CLIENT_SECRET;
const OAuthAuthorizationURL = process.env.OAUTH_AUTHORIZATION_URL;
const OauthTokenURL = process.env.OAUTH_TOKEN_URL;
const OauthCallbackURL = process.env.OAUTH_CALLBACK_UR;

function FIPHR (authmanager) {

   const _auth = authmanager;

   // Strategy config
   FIPHR.FIPHRStrategy = new OauthStrategy({
         authorizationURL: OAuthAuthorizationURL
         , tokenURL: OauthTokenURL
         , clientID: OauthClientId
         , clientSecret: OauthClientSecret
         , callbackURL: OauthCallbackURL
         , skipUserProfile: true
         , passReqToCallback: true
      }
      , async (req, accessToken, refreshToken, params, profile, done) => {

         //console.log('Got Oauth params', params);

         var expiryTime = new Date();
         expiryTime = new Date(expiryTime.getTime() + params.expires_in);
         let u = await _auth.createOrLoadAndUpdateUser(params.sub, accessToken, refreshToken, expiryTime);

         let user = {
            sub: u.sub
         };

         done(null, user); // passes the profile data to serializeUser for session
      }
   );

   refresh.use('fiphr', FIPHR.FIPHRStrategy);

   FIPHR.getAccessTokenForUser = async function (user) {

      let p = new Promise(function (resolve, reject) {

         let d = new Date();
         if (d.getTime() < user.token_expiry_date.getTime()) {
            console.log('Auth key still valid');
            resolve(_auth.decryptAccessToken(user));
         } else {
            refresh.requestNewAccessToken('fiphr', _auth.decryptRefreshToken(user), function (err, accessToken, refreshToken) {

               console.log('REFRESHED for ' + user);
               console.log('New token:', accessToken);
               console.log('New refresh token:', refreshToken);

               _auth.updateTokensForUser(user, accessToken, refreshToken);
               resolve(accessToken);
            });
         }
      });

      return p;
   };


   FIPHR.findUserBySub = async function (sub) {
      return await _auth.findUserBySub(sub);
   };

   FIPHR.findUserBySiteId = async function (siteID) {
      return await _auth.findUserBySiteId(siteID);
   };

   return FIPHR;
}

module.exports = FIPHR;
