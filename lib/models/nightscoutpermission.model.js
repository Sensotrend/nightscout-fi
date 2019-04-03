const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let NSAccessSchema = new Schema({
    grant_id: { type: String, required: true },
    pwd_id: { type: String, required: true },
    pwd_email: { type: String, required: true },
    access_requested: {type: Date, required: true},
    access_granted: {type: Date},
    ns_secret: { type: String },
    ns_uri: { type: String },
    caretaker_id: { type: String },
    iss: { type: String }
});

// Export the model
module.exports = mongoose.model('NSAccessPermission', NSAccessSchema);
