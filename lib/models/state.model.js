import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const StateSchema = new Schema({
    state_id: { type: String, required: true, index: true },
    site_name: { type: String, required: true},
 });



// Export the model
export default mongoose.model('StateInformation', StateSchema);