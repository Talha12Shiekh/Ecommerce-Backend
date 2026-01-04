const express = require('express');
const { createProduct, updateProduct, deleteProduct, uploadProductImage, getProductsByCategory } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/upload", uploadProductImage);
router.get("/category/:id", getProductsByCategory);

module.exports = router;
