const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    phone: { type: String },
    returnItems: { type: String, required: true },
    condition: { type: String },
    preferredResolution: { type: String },
    reason: { type: String, required: true },
    additionalNotes: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    refNumber: { type: String, unique: true }
}, { timestamps: true });

// Auto-generate a short return reference number
returnRequestSchema.pre('save', async function () {
    if (!this.refNumber) {
        this.refNumber = 'RET-' + Date.now().toString(36).toUpperCase();
    }
});

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
module.exports = ReturnRequest;
