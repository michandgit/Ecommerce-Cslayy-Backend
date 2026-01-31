import express from "express";
import { initializeCheckout,createOrder, getOrderById, updateOrderStatus, cancelOrder, getAllOrders, getUserOrders, deleteOrder } from "../controllers/ordersController.js";
import { verifyUser, verifyAdmin } from "../lib/middleware.js";


const router = express.Router();


router.get('/initialize', verifyUser, initializeCheckout);
router.post('/create', verifyUser, createOrder);
router.get('/:orderId', verifyUser, getOrderById);
router.get('/user/all', verifyUser, getUserOrders);
// Add item to cart

// Get order details

// Update order status(admin)
router.put("/update-status/:orderId",verifyUser, updateOrderStatus);
// Cancel order(user)
router.delete("/cancel/:orderId",verifyUser, cancelOrder);


//admin get all the orders
router.get("/" , verifyAdmin, getAllOrders);
//get all orders of a specific user
router.get("/user/:userId" ,verifyAdmin,  getUserOrders);

//amdin
router.delete("/delete/:orderId" ,verifyAdmin,  deleteOrder);

export default router;
