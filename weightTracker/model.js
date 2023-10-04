const mongoose = require("mongoose");
const validator = require("validator");
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const weightTrackingSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentWeight: { type: Number, required: true },
    goalWeight: { type: Number, required: true },
    proof_Image: { type: String,required: true }, 
    proof_Image_key: { type: String }, 
    isPassed: { type: Boolean, default: false }, // Pending, Approved, Rejected
  },{timestamps:true});
  
  module.exports = mongoose.model('WeightTracking', weightTrackingSchema);
  