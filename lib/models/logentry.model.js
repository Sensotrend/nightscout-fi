import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let LogEntry = new Schema({
   user_id: { type: String, required: true, index: true },
   access_key: { type: String },
   rest_http_method: { type: String, required: true },
   rest_url: { type: String, required: true },
   rest_records_returned: { type: Number },
   fhir_operation: { type: String },
   fhir_records_saved: { type: Number },
   fhir_records_skipped: { type: Number },
   conversion_records_skipped_old: { type: Number },
   conversion_records_unrecognized: { type: Number }
}, {
   timestamps: true,
   strict: false
});


// Export the model
export default mongoose.model('LogEntry', LogEntry);
