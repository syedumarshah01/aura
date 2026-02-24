const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getCategories, getTrendingProducts } = require('../controllers/productController');

router.route('/').get(getProducts);
router.route('/categories').get(getCategories);
router.route('/trending').get(getTrendingProducts);
router.route('/:id').get(getProductById);

module.exports = router;
