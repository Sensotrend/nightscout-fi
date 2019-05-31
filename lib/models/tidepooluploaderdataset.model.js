import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let TidepoolUploaderDataset = new Schema({
    dataset_id: { type: String, required: true, index: true},
    user_id: { type: String, required: true },
    date: { type: Date }
});

// Export the model
export default mongoose.model('TidepoolUploaderDataset', TidepoolUploaderDataset);
