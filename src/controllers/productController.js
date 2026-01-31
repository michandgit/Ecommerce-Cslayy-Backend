import mongoose from 'mongoose';
import Product from '../models/product.js';
import cloudinary from '../lib/cloudinary.js'

export const getAllProducts = async (req , res) =>{
    try{

        const data = await Product.find();
        return res.status(200).json({data});
    }catch(error){
        res.status(500).json({message: "Server Error"});
    }

}


export const getProductsByCategory = async (req,res) =>{
    try{
        const {category} = req.params;
        const products = await Product.find({category:category});
        return res.status(200).json({products});
    }catch(error){
        res.status(500).json({message: `${error.message}`});
    }
}

export const getProductById = async (req,res) =>{
try{
        const {id} = req.params;
        const product = await Product.findById(id);
        if(!product){
            return res.status(404).json({message: "Product not found"});
        }
        return res.status(200).json({product});
    }catch(error){
        res.status(500).json({message: "Server Error"});
    }
}

export const getLatestProducts = async (req,res) =>{
    try{
        const products = await Product.find().sort({createdAt: -1}).limit(4);
        return res.status(200).json({products});
    } catch (error) {
         res.status(500).json({ message: error.message });
       }
}

//admin routes

export const createProduct = async (req,res) =>{
    try{

          const { name, price, details, instructions, stock,category } = req.body;

          if (!name || !price || !stock) {
            return res.status(400).json({ message: "Name, price, and stock are required" });
          }

          if (typeof instructions === "string") {
            instructions = JSON.parse(instructions);
          }

          // upload image to cloudinary
          let imageUrl = "";
          if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
              folder: "products",
            });
            imageUrl = result.secure_url;
          } else {
            return res.status(400).json({ message: "Product image is required" });
          }

          const newProduct = new Product({
            name,
            price,
            image: imageUrl,
            details,
            instructions: instructions ? instructions : [],
            stock,
            category
          });

          await newProduct.save();

          return res.status(201).json({
            message: "Product created successfully",
            product: newProduct,
          });
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

export const updateProduct = async (req,res) =>{
    try{
        const {id} = req.params;
        const {name, price, details, instructions, stock, category} = req.body || {};

        const product = await Product.findById(id);
        if(!product){
            return res.status(404).json({message: "Product not found"});
        }

        if (typeof instructions === "string") {
          instructions = JSON.parse(instructions);
        }

        product.name = name || product.name;
        product.details = details || product.details;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        product.category = category || product.category;
        product.instructions = instructions || product.instructions;

        if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path, {
              folder: "products",
            });
            product.image = result.secure_url;
        }


        await product.save();
        return res.status(200).json({message: "Product updated successfully", product});

    }catch(error){
        res.status(500).json({message: `${error.message}`});
    }
}

export const deleteProduct = async (req,res) =>{
    try{
        const {id} = req.params;

        const product = await Product.findByIdAndDelete(id);
        if(!product){
            return res.status(404).json({message: "Product not found"});
        }

        return res.status(200).json({message: "Product deleted successfully"});

    }catch(error){
        res.status(500).json({message: `${error.message}`});
    }
}