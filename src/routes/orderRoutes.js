const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, getCurrentUserOrders, getAllOrders, getSingleOrder, updateOrder } = require('../controllers/orderController');
const { authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createOrder);
router.get('/', authorize('admin'), getAllOrders);
router.get('/showAllMyOrders', getCurrentUserOrders);
router.get('/:id', getSingleOrder);
router.patch('/:id', authorize('admin'), updateOrder);

module.exports = router;
