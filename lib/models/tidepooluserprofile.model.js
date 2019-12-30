import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TidepoolProfile = new Schema({
    user_id: { type: String, required: true, index: true },
    birthday: { type: String },
    diagnosisDate: { type: String },
    diagnosisType: { type: String },
    targetDevices : { type : Array , "default" : [] },
    targetTimezone: { type: String }
});

// Export the model
export default mongoose.model('TidepoolProfile', TidepoolProfile);
