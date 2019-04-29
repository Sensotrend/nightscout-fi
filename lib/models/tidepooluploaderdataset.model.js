const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TidepoolUploaderDataset = new Schema({
    dataset_id: { type: String, required: true, index: true},
    user_id: { type: String, required: true },
    date: { type: Date }
});

// Export the model
module.exports = mongoose.model('TidepoolUploaderDataset', TidepoolUploaderDataset);
