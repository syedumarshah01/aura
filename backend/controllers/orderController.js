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
    const storeUrl = process.env.STORE_URL || 'http://localhost:3001';

    const { firstName, lastName, address, city, postalCode, phone } = order.shippingAddress;
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-PK', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    const itemsHtml = order.orderItems.map(item => {
        const title = cleanTitle(item.title).split(' - ')[0] || cleanTitle(item.title);
        const imageHtml = item.image
            ? `<img src="${item.image}" alt="${title}" width="52" height="52" style="object-fit:contain;border-radius:6px;background:#f5f0ed;display:block;" />`
            : `<div style="width:52px;height:52px;background:#f5f0ed;border-radius:6px;"></div>`;
        return `
            <tr>
                <td style="padding:14px 0;border-bottom:1px solid #ede8e3;vertical-align:middle;width:64px;">
                    ${imageHtml}
                </td>
                <td style="padding:14px 12px;border-bottom:1px solid #ede8e3;vertical-align:middle;color:#2d2825;font-size:14px;line-height:1.4;">
                    ${title}
                    <div style="color:#9e948f;font-size:12px;margin-top:2px;">Qty: ${item.quantity}</div>
                </td>
                <td style="padding:14px 0;border-bottom:1px solid #ede8e3;vertical-align:middle;text-align:right;color:#2d2825;font-weight:600;font-size:14px;white-space:nowrap;">
                    ${item.price || '—'}
                </td>
            </tr>
        `;
    }).join('');

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Order Confirmed — Aura</title>
    </head>
    <body style="margin:0;padding:0;background:#f0ebe6;font-family:'Helvetica Neue',Arial,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ebe6;padding:40px 16px;">
            <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

                    <!-- ▸ Header -->
                    <tr>
                        <td style="background:#2d2825;padding:40px 40px 32px;border-radius:16px 16px 0 0;text-align:center;">
                            <div style="font-family:Georgia,serif;font-style:italic;font-size:36px;color:#c9a99d;letter-spacing:-0.5px;margin-bottom:20px;">Aura.</div>
                            <div style="display:inline-block;background:#3d3530;border:1px solid #4a3f3a;border-radius:30px;padding:8px 20px;">
                                <span style="font-size:13px;color:#c9a99d;letter-spacing:0.08em;text-transform:uppercase;">Order Confirmed</span>
                            </div>
                        </td>
                    </tr>

                    <!-- ▸ Green tick banner -->
                    <tr>
                        <td style="background:#fff;padding:36px 40px 28px;text-align:center;border-left:1px solid #ede8e3;border-right:1px solid #ede8e3;">
                            <div style="width:64px;height:64px;border-radius:50%;background:#eaf5ec;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
                                <!-- checkmark -->
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <h1 style="font-family:Georgia,serif;font-size:26px;color:#2d2825;margin:0 0 10px;">Thank you, ${firstName}!</h1>
                            <p style="color:#7a726d;font-size:15px;line-height:1.7;margin:0;max-width:400px;margin:0 auto;">
                                Your order has been confirmed and is being carefully prepared. We'll send you a shipping update shortly.
                            </p>
                        </td>
                    </tr>

                    <!-- ▸ Order meta cards -->
                    <tr>
                        <td style="background:#fff;padding:0 40px 28px;border-left:1px solid #ede8e3;border-right:1px solid #ede8e3;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="50%" style="padding-right:8px;">
                                        <div style="background:#faf7f5;border:1px solid #ede8e3;border-radius:10px;padding:16px 20px;">
                                            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#9e948f;margin-bottom:6px;">Order Number</div>
                                            <div style="font-size:15px;font-weight:700;color:#a8867a;">${order.orderNumber}</div>
                                        </div>
                                    </td>
                                    <td width="50%" style="padding-left:8px;">
                                        <div style="background:#faf7f5;border:1px solid #ede8e3;border-radius:10px;padding:16px 20px;">
                                            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#9e948f;margin-bottom:6px;">Order Date</div>
                                            <div style="font-size:15px;font-weight:500;color:#2d2825;">${orderDate}</div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- ▸ Divider -->
                    <tr>
                        <td style="background:#fff;padding:0 40px;border-left:1px solid #ede8e3;border-right:1px solid #ede8e3;">
                            <hr style="border:none;border-top:1px solid #ede8e3;margin:0 0 24px;" />
                        </td>
                    </tr>

                    <!-- ▸ Items -->
                    <tr>
                        <td style="background:#fff;padding:0 40px 28px;border-left:1px solid #ede8e3;border-right:1px solid #ede8e3;">
                            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#9e948f;margin-bottom:16px;">Items Ordered</div>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                ${itemsHtml}
                                <tr>
                                    <td colspan="2" style="padding:20px 0 0;font-size:15px;font-weight:600;color:#2d2825;">Total</td>
                                    <td style="padding:20px 0 0;text-align:right;font-size:18px;font-weight:700;color:#a8867a;">PKR ${Number(order.totalAmount).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td colspan="3" style="padding:6px 0 0;text-align:right;">
                                        <span style="font-size:12px;color:#2e7d32;background:#eaf5ec;padding:3px 10px;border-radius:20px;">✓ Free Shipping</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- ▸ Shipping address -->
                    <tr>
                        <td style="background:#fff;padding:0 40px 32px;border-left:1px solid #ede8e3;border-right:1px solid #ede8e3;">
                            <div style="background:#faf7f5;border:1px solid #ede8e3;border-radius:10px;padding:20px 24px;">
                                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#9e948f;margin-bottom:10px;">Shipping To</div>
                                <div style="font-size:14px;color:#2d2825;line-height:1.7;">
                                    <strong>${firstName} ${lastName}</strong><br/>
                                    ${address}<br/>
                                    ${city}${postalCode ? ', ' + postalCode : ''}<br/>
                                    ${phone ? `<span style="color:#7a726d;">${phone}</span>` : ''}
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- ▸ CTA -->
                    <tr>
                        <td style="background:#fff;padding:0 40px 40px;text-align:center;border-left:1px solid #ede8e3;border-right:1px solid #ede8e3;">
                            <a href="${storeUrl}/track" style="display:inline-block;background:#2d2825;color:#fff;text-decoration:none;padding:15px 40px;border-radius:30px;font-size:14px;font-weight:600;letter-spacing:0.04em;">
                                Track Your Order →
                            </a>
                            <p style="margin:20px 0 0;font-size:13px;color:#9e948f;line-height:1.6;">
                                Need to return something?
                                <a href="${storeUrl}/returns" style="color:#a8867a;text-decoration:none;">Visit our Returns page</a>.<br/>
                                Questions? <a href="${storeUrl}/contact" style="color:#a8867a;text-decoration:none;">Contact us</a> — we're happy to help.
                            </p>
                        </td>
                    </tr>

                    <!-- ▸ Footer -->
                    <tr>
                        <td style="background:#2d2825;padding:24px 40px;border-radius:0 0 16px 16px;text-align:center;">
                            <p style="margin:0 0 8px;font-family:Georgia,serif;font-style:italic;font-size:18px;color:#c9a99d;">Aura.</p>
                            <p style="margin:0;font-size:12px;color:#7a726d;line-height:1.6;">
                                © ${new Date().getFullYear()} Aura Beauty. Karachi, Pakistan.<br/>
                                You're receiving this because you placed an order with us.
                            </p>
                        </td>
                    </tr>

                </table>
            </td></tr>
        </table>

    </body>
    </html>
    `;

    await transporter.sendMail({
        from: `"Aura Beauty" <${process.env.GMAIL_USER}>`,
        to: order.email,
        subject: `Order Confirmed — ${order.orderNumber} | Aura`,
        html: emailHtml,
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
