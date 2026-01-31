import Razorpay from 'razorpay';
import crypto from 'crypto';
import Cart from '../models/cart.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


export const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod } = req.body;

    // Validate address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ message: "Invalid shipping address" });
    }

    const cart = await Cart.findOne({ user: userId })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate final amount
    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.18;
    const shippingFee = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shippingFee;

    // Handle different payment methods
    if (paymentMethod === 'card' || paymentMethod === 'upi' || paymentMethod === 'netbanking') {

      // Create Razorpay Order
      const options = {
        amount: Math.round(total * 100), // Amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId: userId.toString(),
          cartId: cart._id.toString()
        }
      };

      const razorpayOrder = await razorpay.orders.create(options);

      return res.json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      });

    } else if (paymentMethod === 'cod') {

      // For COD, no payment gateway needed
      return res.json({
        paymentMethod: 'cod',
        amount: total,
        message: 'Cash on Delivery selected'
      });

    } else {
      return res.status(400).json({ message: "Invalid payment method" });
    }

  } catch (error) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

// Verify Razorpay Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Create signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    // Verify signature
    if (razorpay_signature === expectedSign) {
      return res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

export const createPayment = async (req, res) => {
    res.status(201).json({ message: "Payment created" });
}
export const getPaymentById = async (req, res) => {
    res.status(200).json({ message: "Payment details fetched" });
}
export const updatePaymentStatus = async (req, res) => {
    res.status(200).json({ message: "Payment status updated" });
}
export const refundPayment = async (req, res) => {
    res.status(200).json({ message: "Payment refunded" });
}
export const getUserPayments = async (req, res) => {
    res.status(200).json({ message: "User payments fetched" });
}
export const getAllPayments = async (req, res) => {
    res.status(200).json({ message: "All payments fetched" });
}
export const deletePayment = async (req, res) => {
    res.status(200).json({ message: "Payment deleted" });
}