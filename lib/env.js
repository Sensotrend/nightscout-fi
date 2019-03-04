
function env () {

    const TOKEN_ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;

    const SESSION_KEY = process.env.SESSION_KEY || '2466c1cc-3bed-11e9-a4de-53cf880a6d1a-2d2ea702-3bed-11e9-8842-ef5457fba264';
    env.session_key = SESSION_KEY;

    if (!TOKEN_ENCRYPTION_KEY) { console.error('TOKEN_ENCRYPTION_KEY missing, cannot start'); process.exit(); }

    const Auth = require('./Auth.js')(TOKEN_ENCRYPTION_KEY);
    const FIPHR = require('./FIPHR')(Auth);

    env.userProvider = FIPHR;
    env.PassportStrategy = FIPHR.FIPHRStrategy;

    return env;
}

module.exports = env;

