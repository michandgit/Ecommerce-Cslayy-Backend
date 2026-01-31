import express from 'express';
import { login,register,logout,checkAuth } from '../controllers/adminAuthController.js';
import {verifyAdmin} from "../lib/middleware.js"

const router = express.Router();

router.post("/login" , login)
router.post("/register" , register)
router.post("/logout" ,verifyAdmin, logout)
router.get("/check" ,verifyAdmin, checkAuth)

export default router;