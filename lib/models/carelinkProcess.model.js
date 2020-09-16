import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CarelinkProcessSchema = new Schema({
    user_id: { type: String, required: true, index: true },
    ready_date: {type: Date},
    run_date: {type: Date},
    start_date: {type: Date},
    error_message: [String],
    error_date: {type: String}
 });

 CarelinkProcessSchema.static('findByUser', function(userId){
     return this.find({ user_id: userId });
 })

 CarelinkProcessSchema.pre('save', function(next){
     let now = Date.now();
     
     if(!this.start_date){
         this.start_date = now;
     }

     next();
 });




// Export the model
export default mongoose.model('CarelinkProcess', CarelinkProcessSchema);