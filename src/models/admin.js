import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
     address: {
            type: String,
            default: null
          },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;