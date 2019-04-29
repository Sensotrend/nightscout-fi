const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TidepoolProfile = new Schema({
    user_id: { type: String, required: true, index: true },
    birthday: { type: String },
    diagnosisDate: { type: String },
    diagnosisType: { type: String },
    targetDevices : { type : Array , "default" : [] },
    targetTimezone: { type: String }
});

// Export the model
module.exports = mongoose.model('TidepoolProfile', TidepoolProfile);
