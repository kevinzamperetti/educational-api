const express = require('express');
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getOrdersByUser,
} = require('../controllers/orderController');

const router = express.Router();

router.route('/').post(createOrder).get(getOrders);
router.route('/:id').get(getOrderById).delete(deleteOrder);
router.route('/:id/status').put(updateOrderStatus);
router.route('/user/:userId').get(getOrdersByUser);

module.exports = router;