const Mongo = require('../lib/Mongo.js')();
const Auth = require('../lib/Auth.js')('testpasswordtestpasswordtestpassword');
const nanoid = require('nanoid');
const FIPHR = require('../lib/FIPHR')(Auth);

//let m = new Mongo();

(async function () {
   let u = await Auth.createUser(nanoid(5), 'foo', 'foo', new Date()); // sub, access_token, refresh_token,token_expiry_date
   console.log('u:', u);
   console.log('Access decrypted: ', Auth.decryptAccessToken(u));
   console.log('Refesh decrypted: ', Auth.decryptRefreshToken(u));
   console.log('Searching u2: ', u.sub);
   let u2 = await Auth.findUserBySub(u.sub);
   console.log('u2:', u2);
   console.log('Searching u3');
   let u3 = await Auth.findUserBySiteId(u.site_id, u.site_pw);
   console.log('u3:', u3);
   let u4 = await Auth.createOrLoadAndUpdateUser(u.sub, 'bar', 'bar', new Date());
   console.log('u4:', u4);
   let u5 = await Auth.findUserBySub(u.sub);
   console.log('u5:', u5);

   let u6 = await Auth.createOrLoadAndUpdateUser(nanoid(5), 'barx', 'barx', new Date());
   console.log('u6:', u6);

   let u7 = await Auth.findUserBySub(u6.sub);
   console.log('u7:', u7);

   let u8 = await FIPHR.findUserBySub(u6.sub);
   console.log('u8:', u8);

   process.exit();
})();
