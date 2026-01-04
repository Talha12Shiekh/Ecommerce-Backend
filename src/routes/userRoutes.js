const express = require('express');

const { getAllUsers, getSingleUser } = require('../controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection and authorization to all routes
router.use(protect);
router.use(authorize('admin'));


router.get('/', getAllUsers);
router.get('/:id', getSingleUser);

module.exports = router;
