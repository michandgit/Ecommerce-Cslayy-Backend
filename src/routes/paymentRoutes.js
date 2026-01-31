import express from "express";
import { verifyUser, verifyAdmin } from "../lib/middleware.js";
import { createPaymentIntent, verifyPayment } from "../controllers/paymentsController.js";
const router = express.Router();


router.post('/create-intent', verifyUser, createPaymentIntent);
router.post('/verify', verifyUser, verifyPayment);

//
//
//// Add item to cart
//router.post("/create" , verifyUser, createPayment);
//
//// Get payment details
//router.get("/:paymentId" ,verifyUser, getPaymentById);
//
//// Update payment status
//router.put("/update-status/:paymentId" ,verifyUser, updatePaymentStatus);
//
//// Refund payment
//router.post("/refund/:paymentId" , verifyUser,refundPayment);
//
//
////User payments
//router.get("/user/:userId" ,verifyUser,  getUserPayments);
//
////Admin - Get all payments
//router.get("/" ,verifyAdmin,  getAllPayments);
//
//// Delete payment
//router.delete("/delete/:paymentId" ,verifyAdmin, deletePayment);

export default router;