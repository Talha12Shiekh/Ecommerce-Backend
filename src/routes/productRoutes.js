const { createProduct, updateProduct, deleteProduct, uploadProductImage, getProductsByCategory, getAllProducts, getSingleProduct } = require('../controllers/productController');
const express = require("express");
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get("/", getAllProducts);
router.get("/category/:id", getProductsByCategory);
router.get("/:id", getSingleProduct);

router.use(protect);
router.use(authorize('admin'));

router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/upload", uploadProductImage);

module.exports = router;
