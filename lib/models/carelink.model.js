import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const carelinkSchema = new Schema({
    user_id: { type: String, required: true, index: true },
    user_name: { type: String, required: true},
    user_password: { type: Buffer, required: true },
    create_date: { type: Date },
    update_date: { type: Date }
 });



// Export the model
export default mongoose.model('carelinkInformation', carelinkSchema);