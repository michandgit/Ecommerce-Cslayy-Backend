import express from "express";
import {getCartItems, addToCart, updateCartItem, removeFromCart, clearCart} from "../controllers/cartController.js";
import {verifyUser} from "../lib/middleware.js";
const router = express.Router();


router.get("/" ,verifyUser,  getCartItems);
router.post("/add",verifyUser, addToCart);
router.put("/update/:productId",verifyUser, updateCartItem);
router.delete("/remove/:productId",verifyUser, removeFromCart);
router.delete("/clear",verifyUser, clearCart);


export default router;