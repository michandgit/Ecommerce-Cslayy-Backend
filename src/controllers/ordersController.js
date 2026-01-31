import Product from "../models/product.js";
import Order from "../models/orders.js";
import Cart from "../models/cart.js";
import Payment from "../models/payments.js";
import Razorpay from 'razorpay';


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const initializeCheckout = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }


    for (let item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(400).json({
          message: `Product ${item.product.name} no longer available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Only ${product.stock} units of ${product.name} available`
        });
      }

      if (product.price !== item.priceAtAdd) {
        item.priceAtAdd = product.price;
        item.subtotal = product.price * item.quantity;
      }
    }

    await cart.save();

    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.18;
    const shippingFee = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shippingFee;

    return res.json({
      cartItems: cart.items,
      pricing: {
        subtotal,
        tax,
        shippingFee,
        total
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod, razorpayPaymentId, razorpayOrderId } = req.body;


    let paymentStatus = 'pending';

    // Order status
    let orderStatus = 'pending';

    let transactionId = null;

    if (paymentMethod !== 'cod') {
      // Fetch payment details from Razorpay
      try {
        const payment = await razorpay.payments.fetch(razorpayPaymentId);

        if (payment.status !== 'captured' && payment.status !== 'authorized') {
          return res.status(400).json({
            message: "Payment not completed",
            paymentStatus: payment.status
          });
        }

        paymentStatus = 'success';
        orderStatus = 'paid';
        transactionId = razorpayPaymentId;
      } catch (err) {
        return res.status(400).json({
          message: "Payment verification failed"
        });
      }
    }

    const cart = await Cart.findOne({ user: userId })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 3. Final stock check
    for (let item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }
    }

    // 4. Calculate amounts
    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.18;
    const shippingFee = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shippingFee;

     const orderItems = cart.items.map((item) => ({
                 product: item.product._id,
                 quantity: item.quantity,
                 price: item.priceAtAdd,
                 subtotal: item.subtotal,
               }));


               const order = new Order({
                 user: userId,
                 items: orderItems,
                 total,
                 shippingAddress,
                 status: orderStatus,
               });
               await order.save();


    const payment = new Payment({
        order: order._id,
      method: paymentMethod,
      amount: total,
      status: paymentStatus,
      transactionId: transactionId,
      gatewayResponse: {
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId
      }
    });

    await payment.save();

    order.payment = payment._id;
    await order.save();

    // 9. Reduce product stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // 10. Clear cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      order: {
        _id: order._id,
        total: order.total,
        status: order.status,
        items: order.items
      }
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId
    })
    .populate('items.product')
    .populate('payment');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All User Orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.product')
      .populate('payment');

    const count = await Order.countDocuments({ user: userId });

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Cancel order (user)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    const cart = await Cart.findOne({ user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden - You can only cancel your own orders" });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    }
        for (const item of order.items) {
          const { product, quantity, price, subtotal } = item;

          cart.items.push({
            product,
            quantity,
            priceAtAdd: price,
            subtotal,
          });
        }

        await cart.save();

    order.status = "cancelled";
    await order.save();

    return res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



// ==========================
// ADMIN CONTROLLERS
// ==========================

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .populate("user", "name email");

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {

    const { orderId } = req.params;

    const { status } = req.body;

    const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      updatedOrder: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete order (admin)
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.findByIdAndDelete(orderId);

    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
