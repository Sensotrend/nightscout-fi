import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const DatesetTempStorageSchema = new Schema({
    user_id: { type: String, required: true, index: true },
    dataset_id: {type: String, required: true },
    create_date: { type: Date},
    deviceInformation: { type: Buffer }
 });

 DatesetTempStorageSchema.pre('save',function(next){
     if( !this.create_date) { this.create_date = new Date; }

     next();
 })

// Export the model
export default mongoose.model('DatesetTempStorage', DatesetTempStorageSchema);