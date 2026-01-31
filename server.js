import express from "express";
import './src/env.js';
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import productRoutes from "./src/routes/productRoutes.js";
import {connectDb} from "./src/lib/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import adminAuthRoutes from "./src/routes/adminauthRoutes.js";
import cloudinary from './src/lib/cloudinary.js';

const app = express();
const PORT = process.env.PORT || 5000;
connectDb();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/auth", adminAuthRoutes);

app.listen(PORT , ()=>{
console.log(`Server is running on port ${PORT}`)
})