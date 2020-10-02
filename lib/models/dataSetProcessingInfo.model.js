import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const DatesetProcessingInfoSchema = new Schema({
    pid: {type: Number},
    hostname: {type: String},
    dataset_temp_storage_id: {type: String},
    start_to_handle_date: { type: Date},
    process_time: {type: Date},
    error_date: {type: Date},
    flag: {type: Number, default: 0}
});

DatesetProcessingInfoSchema.pre('save',function(next){
    if( !this.start_to_handle_date) { this.start_to_handle_date = new Date; }

    next();
})

// Export the model
export default mongoose.model('DatesetProcessingInfo', DatesetProcessingInfoSchema);