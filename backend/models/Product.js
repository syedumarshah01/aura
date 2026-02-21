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

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
