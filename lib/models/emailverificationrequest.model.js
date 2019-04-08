const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let EmailVerificationSchema = new Schema({
    request_id: { type: String, required: true },
    user_id: { type: String, required: true },
    email: { type: String, required: true },
    last_sent: { type: Date, required: true }
});

// Export the model
module.exports = mongoose.model('EmailVerificationRequest', EmailVerificationSchema);
