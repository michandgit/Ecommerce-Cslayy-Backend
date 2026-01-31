import Admin from "../models/admin.js";
import bcrypt from "bcrypt";
import { generateTokenAdmin } from "../lib/util.js";


// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    generateTokenAdmin(admin._id, res);

    return res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    // Generate token after saving
    generateTokenAdmin(newAdmin._id, res);

    return res.status(201).json({
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
    });
  } catch (error) {
    console.error("Error in register controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Logout
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          expires: new Date(0),
          domain: ".onrender.com"
        });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Check authentication
export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



export const uploadProductImage = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({message: "No file uploaded"});
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
             folder: "products"
           });

        res.json({ url: result.secure_url });
    }catch(error){
        console.error("Error uploading product image:", error.message);
        res.status(500).json({message: "Server Error"});
    }
}