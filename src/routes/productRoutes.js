import express from 'express';
import { getAllProducts,getProductById,createProduct,deleteProduct,updateProduct,getProductsByCategory, getLatestProducts } from '../controllers/productController.js';
import {verifyUser, verifyAdmin } from '../lib/middleware.js';
import upload from '../lib/upload.js';
import cloudinary from '../lib/cloudinary.js';


const router = express.Router();


router.get("/" ,verifyUser,  getAllProducts);
router.get("/latest-products" , getLatestProducts);
router.get("/category/:category" ,verifyUser, getProductsByCategory);
router.get("/:id", verifyUser, getProductById);



//admin routes
router.post("/create", verifyAdmin,upload.single("image"), createProduct);
router.put("/update/:id", verifyAdmin,upload.single("image"), updateProduct);
router.delete("/delete/:id", verifyAdmin, deleteProduct);

export default router;
