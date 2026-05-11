const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @route GET /api/cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('cartItems.product');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/cart
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        cartItems: [{ product: productId, name: product.name, price: product.price, quantity }]
      });
    } else {
      const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);
      if (itemIndex > -1) {
        cart.cartItems[itemIndex].quantity += quantity;
      } else {
        cart.cartItems.push({ product: productId, name: product.name, price: product.price, quantity });
      }
      await cart.save();
    }
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.cartItems = cart.cartItems.filter(item => item.product.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };