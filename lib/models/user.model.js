import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    user_id: { type: String, required: true, index: true },
    site_id: { type: String, required: true },
    site_secret: { type: String, required: true, index: true },
    site_secret_SHA1: { type: String, required: true },
    sub: { type: String, required: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    token_expiry_date: { type: Date, required: true },
    email: {type: String, required: false},
    contact_notifications_flag: {type: Boolean},
    contact_development_flag: {type: Boolean}
});


// Export the model
export default mongoose.model('User', UserSchema);
