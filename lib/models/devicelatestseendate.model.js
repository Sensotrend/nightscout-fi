import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const DeviceDateSchema = new Schema({
   user_id: { type: String, required: true, index: true },
   dates: [{
      device_id: { type: String, required: true },
      newest_recorded_date: { type: Date, required: true }
    }]
});


// Export the model
export default mongoose.model('DeviceNewestSeenDate', DeviceDateSchema);
