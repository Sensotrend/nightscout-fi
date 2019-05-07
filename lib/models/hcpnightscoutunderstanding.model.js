const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let HCPUnderstandingSchema = new Schema({
    hcp_id: { type: String, required: true },
    has_accepted: { type: Boolean, required: true },
    accept_date: {type: Date, required: true}
});

// Export the model
module.exports = mongoose.model('HCPUnderstandingSchema', HCPUnderstandingSchema);
