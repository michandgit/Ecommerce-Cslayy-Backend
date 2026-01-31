import Product from "../models/product.js";
import Cart from "../models/cart.js";

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;
    console.log("ADD TO CART BODY:", req.body);

    const product = await Product.findById(productId);
    console.log("found product in backend:", product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [
          {
            product: productId,
            quantity:1,
            priceAtAdd: product.price,
            subtotal: product.price * 1,
          },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subtotal =
          existingItem.quantity * existingItem.priceAtAdd;
      } else {
        cart.items.push({
          product:productId,
          quantity: 1,
          priceAtAdd: product.price,
          subtotal: product.price * 1,
        });
      }
    }

    await cart.save();
    await cart.populate("items.product");

    console.log("Cart now:" , cart);
    return res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity -=1;
    if (item.quantity > 0) {
      item.subtotal = item.priceAtAdd * item.quantity;
    } else {

      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    }

    await cart.save();
    await cart.populate("items.product");
    res.status(200).json({
      message: "Item removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get cart items
export const getCartItems = async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ message: "Your cart is empty", items: [] });
    }
    await cart.populate("items.product");
    res.status(200).json({
      success: true,
      items: cart.items,
      totalItems: cart.items.length,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    item.subtotal = item.priceAtAdd * quantity;

    await cart.save();
    await cart.populate("items.product");
    res
      .status(200)
      .json({ message: "Cart item updated successfully", cart });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
