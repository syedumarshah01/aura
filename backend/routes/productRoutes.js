const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getCategories } = require('../controllers/productController');

router.route('/').get(getProducts);
router.route('/categories').get(getCategories);
router.route('/:id').get(getProductById);

module.exports = router;
