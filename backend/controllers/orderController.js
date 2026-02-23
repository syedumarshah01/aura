const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// Shared transporter factory (uses same Gmail SMTP as contact form)
const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: { rejectUnauthorized: false }
});

const cleanTitle = (t) => t ? t.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/gi, '').trim() : 'Product';

// @desc    Create a new order after payment confirmation
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    try {
        const { email, shippingAddress, orderItems, totalAmount } = req.body;

        if (!email || !shippingAddress || !orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'Missing required order fields.' });
        }

        const order = new Order({
            email,
            shippingAddress,
            orderItems,
            totalAmount,
            paymentStatus: 'paid',
            orderStatus: 'processing'
        });

        const savedOrder = await order.save();

        // Fire-and-forget confirmation email — don't let email failure block the response
        sendOrderConfirmationEmail(savedOrder).catch(err =>
            console.error('Order confirmation email failed:', err.message)
        );

        res.status(201).json({
            message: 'Order created successfully.',
            orderId: savedOrder._id,
            orderNumber: savedOrder.orderNumber
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Failed to create order.', error: error.message });
    }
};

// Builds and sends the branded HTML order confirmation email
async function sendOrderConfirmationEmail(order) {
    const transporter = createTransporter();

    const itemsHtml = order.orderItems.map(item => {
        const title = cleanTitle(item.title).split(' - ')[0] || cleanTitle(item.title);
        return `
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E1DC; color: #2D2825; font-size: 0.9rem;">${title}</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E1DC; text-align: center; color: #7A726D; font-size: 0.9rem;">×${item.quantity}</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E1DC; text-align: right; color: #2D2825; font-weight: 500; font-size: 0.9rem;">${item.price || '—'}</td>
            </tr>
        `;
    }).join('');

    const { firstName, lastName, address, city, postalCode } = order.shippingAddress;
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

    await transporter.sendMail({
        from: `"Aura Beauty" <${process.env.GMAIL_USER}>`,
        to: order.email,
        subject: `Order Confirmed — ${order.orderNumber} | Aura`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #FCFAf8; border: 1px solid #E8E1DC; border-radius: 12px; overflow: hidden;">

                <!-- Header -->
                <div style="background: #2D2825; padding: 32px; text-align: center;">
                    <h1 style="color: #C9A99D; font-family: Georgia, serif; font-style: italic; font-size: 2rem; margin: 0;">Aura.</h1>
                </div>

                <!-- Body -->
                <div style="padding: 36px;">
                    <h2 style="color: #2D2825; font-family: Georgia, serif; font-size: 1.6rem; margin-bottom: 0.5rem;">Your order is confirmed ✓</h2>
                    <p style="color: #7A726D; line-height: 1.7; margin-bottom: 2rem;">
                        Hi ${firstName}, thank you for shopping with Aura. We&rsquo;re carefully preparing your order and will notify you once it ships.
                    </p>

                    <!-- Order Meta -->
                    <div style="display: flex; gap: 24px; margin-bottom: 2rem;">
                        <div style="flex: 1; background: #fff; border: 1px solid #E8E1DC; border-radius: 8px; padding: 16px;">
                            <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #7A726D; margin: 0 0 4px;">Order Number</p>
                            <p style="font-weight: 700; color: #A8867A; margin: 0;">${order.orderNumber}</p>
                        </div>
                        <div style="flex: 1; background: #fff; border: 1px solid #E8E1DC; border-radius: 8px; padding: 16px;">
                            <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #7A726D; margin: 0 0 4px;">Order Date</p>
                            <p style="font-weight: 500; color: #2D2825; margin: 0;">${orderDate}</p>
                        </div>
                    </div>

                    <!-- Items -->
                    <h3 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; color: #7A726D; border-bottom: 1px solid #E8E1DC; padding-bottom: 8px; margin-bottom: 0;">Items Ordered</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
                        ${itemsHtml}
                        <tr>
                            <td colspan="2" style="padding: 16px 0 0; font-weight: 600; color: #2D2825;">Total</td>
                            <td style="padding: 16px 0 0; text-align: right; font-weight: 700; font-size: 1.1rem; color: #A8867A;">PKR ${Number(order.totalAmount).toLocaleString()}</td>
                        </tr>
                    </table>

                    <!-- Shipping -->
                    <div style="background: #fff; border: 1px solid #E8E1DC; border-radius: 8px; padding: 20px; margin-bottom: 2rem;">
                        <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #7A726D; margin: 0 0 8px;">Shipping To</p>
                        <p style="color: #2D2825; line-height: 1.7; margin: 0; font-size: 0.9rem;">
                            ${firstName} ${lastName}<br/>
                            ${address}, ${city}${postalCode ? ' ' + postalCode : ''}
                        </p>
                    </div>

                    <!-- Track -->
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <a href="http://localhost:3000/track" style="display: inline-block; background: #2D2825; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-size: 0.9rem; font-weight: 600;">Track Your Order</a>
                    </div>

                    <p style="color: #7A726D; font-size: 0.85rem; line-height: 1.6; text-align: center;">
                        Need to return something? Visit our <a href="http://localhost:3000/returns" style="color: #A8867A;">Returns page</a>.<br/>
                        Questions? <a href="http://localhost:3000/contact" style="color: #A8867A;">Contact us</a> — we&rsquo;re happy to help.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #F5F0ED; padding: 20px; text-align: center; border-top: 1px solid #E8E1DC;">
                    <p style="color: #7A726D; font-size: 0.75rem; margin: 0;">© 2026 Aura Beauty. Karachi, Pakistan.</p>
                </div>
            </div>
        `
    });
}


// @desc    Get all orders (admin view)
// @route   GET /api/orders
// @access  Public (lock down later with auth middleware)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get a single order by MongoDB _id
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).lean();
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get a single order by its human-readable order number
// @route   GET /api/orders/track/:orderNumber
// @access  Public
const getOrderByNumber = async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber }).lean();
        if (!order) return res.status(404).json({ message: 'No order found with that order number.' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus: status },
            { new: true }
        ).lean();
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        res.json({ message: 'Order status updated.', order });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
const ReturnRequest = require('../models/ReturnRequest');
const getAdminStats = async (req, res) => {
    try {
        const [totalOrders, revenueAgg, ordersByStatus, pendingReturns, totalReturns] = await Promise.all([
            Order.countDocuments(),
            Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
            ReturnRequest.countDocuments({ status: 'pending' }),
            ReturnRequest.countDocuments()
        ]);
        res.json({
            totalOrders,
            totalRevenue: revenueAgg[0]?.total || 0,
            ordersByStatus: Object.fromEntries(ordersByStatus.map(s => [s._id, s.count])),
            pendingReturns,
            totalReturns
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { createOrder, getOrders, getOrderById, getOrderByNumber, updateOrderStatus, getAdminStats };
