const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered
} = require('../controllers/orderController');
const protect = require('../middleware/authMiddleware');

router.route('/').post(protect, createOrder).get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, updateOrderToDelivered);

module.exports = router;