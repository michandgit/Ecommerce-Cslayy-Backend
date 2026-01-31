import jwt from "jsonwebtoken";
import User from "../models/users.js";
import Admin from "../models/admin.js";

export const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt || null;


    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};





export const verifyAdmin = async (req, res, next) => {
  try {

     const token = req.cookies?.jwt || null;

        if (!token) {
          return res.status(401).json({ message: "Unauthorized - No token provided" });
        }


    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.user = admin;
    next();
  } catch (error) {
    console.error("Error in verifyAdmin middleware:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

