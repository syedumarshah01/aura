const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    price: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    phone: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    email: { type: String, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    orderItems: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'paid' },
    orderStatus: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
    orderNumber: { type: String, unique: true }
}, { timestamps: true });

// Auto-generate a short human-readable order number before saving
orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        this.orderNumber = 'AUR-' + Date.now().toString(36).toUpperCase();
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
