import User from "../models/users.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/util.js";


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      name: `${user.name.firstName} ${user.name.lastName}`,
      email: user.email,
      phone: user.phone || '',
      address: user.address.street || '',
      city: user.address.city || '',
      state: user.address.state || '',
      zipCode: user.address.zipcode || '',
      country: user.address.country || ''
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

// REGISTER
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[1] || ".";

    const newUser = new User({
      name:{
      firstName,
      lastName
      },
      email,
      password: hashedPassword,
    });

    await newUser.save();
    generateToken(newUser._id, res);

    return res.status(201).json({
      _id: newUser._id,
      name: `${newUser.name.firstName} ${newUser.name.lastName}`,
      email: newUser.email,
      phone: newUser.phone || '',
      address: newUser.address.street || '',
      city: newUser.address.city || '',
      state: newUser.address.state || '',
      zipCode: newUser.address.zipcode || '',
      country: newUser.address.country || ''
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// LOGOUT
export const logout = (req, res) => {
  try {
     res.cookie("jwt", "", {
              httpOnly: true,
              secure: true,
              sameSite: "none",
              expires: new Date(0),
            });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};


export const checkAuth = (req, res) => {
  try {
    const isAuthenticated = !!req.user;
    
    const formattedUser = isAuthenticated ? {
      _id: req.user._id,
      name: `${req.user.name.firstName} ${req.user.name.lastName}`,
      email: req.user.email,
      phone: req.user.phone || '',
      address: req.user.address.street || '',
      city: req.user.address.city || '',
      state: req.user.address.state || '',
      zipCode: req.user.address.zipcode || '',
      country: req.user.address.country || ''
    } : null;

    return res.status(200).json({
      isAuthenticated,
      user: formattedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phone, address, city, state, zipCode, country } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!name || !email || !phone || !address) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[1] || ".";

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: {
          firstName,
          lastName
        },
        email,
        phone,
        address: {
          street: address,
          city,
          state,
          zipcode: zipCode,
          country
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const formattedUser = {
      _id: updatedUser._id,
      name: `${updatedUser.name.firstName} ${updatedUser.name.lastName}`,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address.street,
      city: updatedUser.address.city,
      state: updatedUser.address.state,
      zipCode: updatedUser.address.zipcode,
      country: updatedUser.address.country
    };

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: formattedUser
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
