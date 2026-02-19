const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const { getDashboardStats } = require('../controllers/dashboardController');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);

module.exports = router;
