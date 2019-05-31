import mongoose from 'mongoose';
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
export default mongoose.model('NSAccessPermission', NSAccessSchema);
