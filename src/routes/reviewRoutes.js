import express from 'express';
import {createProductReview, getProductReviews, updateProductReview, deleteProductReview} from '../controllers/reviewsController.js';
import { verifyUser } from "../lib/middleware.js";
const router = express.Router();


router.post("/:productId", verifyUser, createProductReview);
router.get("/:productId",verifyUser,  getProductReviews);
router.put("/:reviewId", verifyUser,updateProductReview);
router.delete("/:reviewId",verifyUser,    deleteProductReview);

export default router;