const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DeviceDateSchema = new Schema({
   user_id: { type: String, required: true, index: true },
   dates: [{
      device_id: { type: String, required: true },
      newest_recorded_date: { type: Date, required: true }
    }]
});


// Export the model
module.exports = mongoose.model('DeviceNewestSeenDate', DeviceDateSchema);
