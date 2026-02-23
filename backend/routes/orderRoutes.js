const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, getOrderByNumber, updateOrderStatus, getAdminStats } = require('../controllers/orderController');

router.get('/stats', getAdminStats);
router.route('/').post(createOrder).get(getOrders);
router.route('/track/:orderNumber').get(getOrderByNumber);
router.route('/:id').get(getOrderById);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
