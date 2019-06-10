import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let EmailVerificationSchema = new Schema({
    request_id: { type: String, required: true },
    user_id: { type: String, required: true },
    email: { type: String, required: true },
    last_sent: { type: Date, required: true, expires: 60*60*24, default: Date.now },
    contact_notifications_flag: {type: Boolean},
    contact_development_flag: {type: Boolean}
});

// Export the model
export default mongoose.model('EmailVerificationRequest', EmailVerificationSchema);
