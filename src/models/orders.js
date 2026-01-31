import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: Number,
      price: Number,
      subtotal: Number
    }
  ],
  total: Number,
  shippingAddress: {
                       fullName: String,
                       phone: String,
                       email: String,
                       addressLine: String,
                     },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered','cancelled'], default: 'pending' },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;