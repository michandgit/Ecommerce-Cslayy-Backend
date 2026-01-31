import express from 'express';
import { login,register,logout,checkAuth } from '../controllers/authController.js';
import {verifyUser} from "../lib/middleware.js"

const router = express.Router();

router.post("/login" , login)
router.post("/register" , register)
router.post("/logout" ,verifyUser, logout)
router.get("/check" ,verifyUser, checkAuth)

export default router;


