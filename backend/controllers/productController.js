const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 20;
        const page = Number(req.query.page) || 1;

        // Build filter query
        const filter = {};
        if (req.query.keyword) {
            filter.title = { $regex: req.query.keyword, $options: 'i' };
        }
        if (req.query.subcategory) {
            filter.subcategory = { $regex: req.query.subcategory, $options: 'i' };
        }

        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .lean();

        // Convert blurry thumbnails to high-res images
        products.forEach(product => {
            if (product.images && product.images.length > 0) {
                product.images = product.images.map(img => img.replace(/\/cache\/[a-zA-Z0-9]+\//, '/'));
            }
        });

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id).lean();

        if (product) {
            // Convert blurry thumbnails to high-res images
            if (product.images && product.images.length > 0) {
                product.images = product.images.map(img => img.replace(/\/cache\/[a-zA-Z0-9]+\//, '/'));
            }
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Fetch distinct product subcategories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('subcategory');
        // Filter out nulls/empty strings and sort
        const clean = categories
            .filter(c => c && c.trim() !== '')
            .sort((a, b) => a.localeCompare(b));
        res.json(clean);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getCategories,
};
