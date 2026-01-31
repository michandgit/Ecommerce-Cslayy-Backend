import mongoose from "mongoose";


const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  method: {
              type: String,
              enum: ['card', 'upi', 'netbanking', 'wallet', 'cod'],
              required: true
            },
  amount: {type:Number, required:true},
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String },
    gatewayResponse: { type: Object }
}, { timestamps: true });



const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;