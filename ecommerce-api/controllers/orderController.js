const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @route POST /api/orders
const createOrder = async (req, res) => {
  const { shippingAddress } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('cartItems.product');
    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = cart.cartItems.map(item => ({
      product: item.product._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const totalPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      totalPrice,
    });

    // Clear the cart after order is placed
    await Cart.findOneAndDelete({ user: req.user.id });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/pay
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isPaid = true;
    order.paidAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/deliver
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderToPaid, updateOrderToDelivered };