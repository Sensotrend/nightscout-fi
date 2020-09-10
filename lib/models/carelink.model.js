import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CarelinkSchema = new Schema({
    user_id: { type: String, required: true, index: true },
    user_name: { type: String, required: true, unique: true},
    user_password: { type: Buffer, required: true },
    create_date: { type: Date },
    update_date: { type: Date }
 });

 CarelinkSchema.static('findByOneUser', function(userId){
    return this.findOne({ user_id: userId }, 'user_name user_password');
})

// Export the model
export default mongoose.model('CarelinkInformation', CarelinkSchema);
