const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    user_id: { type: String, required: true },
    site_id: { type: String, required: true },
    site_secret: { type: String, required: true },
    sub: { type: String, required: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    token_expiry_date: { type: Date, required: true }
});


// Export the model
module.exports = mongoose.model('User', UserSchema);
