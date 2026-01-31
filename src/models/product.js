import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    image: {
      type: String,
      required: true
    },

    details: {
      type: String,
      required: true
    },

    instructions: {
      type: [String],
      default: []
    },

    stock: {
      type: Number,
      default: true
    },

    category:{
        type: String,
        required:true,
        enum:['men','women','unisex'],
        default:'unisex'
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
