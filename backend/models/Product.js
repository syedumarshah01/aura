const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  in_stock: {
    type: Boolean,
    default: false
  },
  subcategory: {
    type: String
  },
  highlights: [{
    type: String
  }],
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// Performance Indexes
productSchema.index({ title: 'text' });
productSchema.index({ in_stock: 1, subcategory: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
