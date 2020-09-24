import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const DatesetTempStorageSchema = new Schema({
    user_id: { type: String, required: true, index: true },
    dataset_id: {type: String, required: true },
    create_date: { type: Date},
    upload_date: { type: Date},
    process_date: {type: Date},
    error_date: {type: Date},
    status: {type: String,
            enum: ['not_sended','process','ok','error'],
            default: 'not_sended'},
    deviceInformation: { type: Buffer },
    how_many_times_try: {
        type: Number,
        default: 5
    }
 });


 DatesetTempStorageSchema.pre('save',function(next){
     if( !this.create_date) { this.create_date = new Date; }

     next();
 })


// Export the model
export default mongoose.model('DatesetTempStorage', DatesetTempStorageSchema);