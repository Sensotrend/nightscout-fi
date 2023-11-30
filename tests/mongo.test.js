import { nanoid } from 'nanoid';
import envModule from '../lib/env';
import should from 'should';

const env = envModule();
let Auth = env.userProvider;


describe.skip('auth_module_test', function () {

   it('should store and load users', async function () {

      let siteid = 'foo';
      let pw = 'bar';

      let u = await Auth.createUser(nanoid(5), siteid, pw, new Date()); // sub, access_token, refresh_token,token_expiry_date
      console.log('u:', u);
      console.log('Access decrypted: ', Auth.decryptAccessToken(u));
      console.log('Refesh decrypted: ', Auth.decryptRefreshToken(u));

      Auth.decryptRefreshToken(u).should.equal('bar');

      console.log('Searching u2: ', u.sub);
      let u2 = await Auth.findUserBySub(u.sub);
      console.log('u2:', u2);
      console.log('Searching u3');
      let u3 = await Auth.findUserBySiteId(u.site_id, u.site_secret);
      console.log('u3:', u3);
      let u4 = await Auth.createOrLoadAndUpdateUser(u.sub, 'bar', 'bar', new Date());

      Auth.decryptRefreshToken(u4).should.equal('bar');

      console.log('u4:', u4);
      let u5 = await Auth.findUserBySub(u.sub);
      console.log('u5:', u5);

      let u6 = await Auth.createOrLoadAndUpdateUser(nanoid(5), 'barx', 'barx', new Date());
      console.log('u6:', u6);

      let u7 = await Auth.findUserBySub(u6.sub);
      console.log('u7:', u7);

      Auth.decryptRefreshToken(u7).should.equal('barx');

   });

});
