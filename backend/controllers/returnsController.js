const nodemailer = require('nodemailer');
const ReturnRequest = require('../models/ReturnRequest');

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: { rejectUnauthorized: false }
});

// @desc    Submit a return request — saves to DB then emails store + customer
// @route   POST /api/returns
// @access  Public
const sendReturnRequest = async (req, res) => {
    const { orderNumber, email, firstName, lastName, phone, returnItems, reason, condition, preferredResolution, additionalNotes } = req.body;

    if (!orderNumber || !email || !firstName || !reason || !returnItems) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
        // 1. Persist to MongoDB first
        const returnDoc = new ReturnRequest({
            orderNumber, email, firstName, lastName, phone,
            returnItems, condition, preferredResolution, reason, additionalNotes
        });
        const savedReturn = await returnDoc.save();

        // 2. Fire-and-forget emails — don't block the response if email fails
        sendReturnEmails(savedReturn).catch(err =>
            console.error('Return email failed:', err.message)
        );

        res.status(201).json({
            message: 'Return request submitted successfully.',
            refNumber: savedReturn.refNumber
        });
    } catch (error) {
        console.error('Return request error:', error);
        res.status(500).json({ message: 'Failed to submit return request.', error: error.message });
    }
};

async function sendReturnEmails(doc) {
    const transporter = createTransporter();
    const { orderNumber, email, firstName, lastName, phone, returnItems, condition, preferredResolution, reason, additionalNotes, refNumber } = doc;

    const itemsList = returnItems
        ? returnItems.split('\n').filter(l => l.trim()).map(l => `<li style="margin-bottom:4px;color:#2D2825;">${l.trim()}</li>`).join('')
        : '<li style="color:#7A726D;">Not specified</li>';

    // Email to store owner
    await transporter.sendMail({
        from: `"Aura Returns" <${process.env.GMAIL_USER}>`,
        to: 'syedumarshah04@gmail.com',
        replyTo: email,
        subject: `[Return Request] ${refNumber} — Order ${orderNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #FCFAf8; border: 1px solid #E8E1DC; border-radius: 12px; overflow: hidden;">
                <div style="background: #2D2825; padding: 24px 32px;">
                    <h1 style="color: #C9A99D; font-family: Georgia, serif; font-style: italic; font-size: 1.5rem; margin: 0;">Aura. — Return Request</h1>
                </div>
                <div style="padding: 32px;">
                    <table style="width:100%; border-collapse: collapse; margin-bottom: 24px;">
                        <tr><td style="padding:8px 0;color:#7A726D;font-size:0.85rem;width:180px;">Return Ref</td><td style="padding:8px 0;font-weight:700;color:#A8867A;">${refNumber}</td></tr>
                        <tr><td style="padding:8px 0;color:#7A726D;font-size:0.85rem;">Order Number</td><td style="padding:8px 0;font-weight:600;color:#2D2825;">${orderNumber}</td></tr>
                        <tr><td style="padding:8px 0;color:#7A726D;font-size:0.85rem;">Customer</td><td style="padding:8px 0;color:#2D2825;">${firstName} ${lastName || ''}</td></tr>
                        <tr><td style="padding:8px 0;color:#7A726D;font-size:0.85rem;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#A8867A;">${email}</a></td></tr>
                        ${phone ? `<tr><td style="padding:8px 0;color:#7A726D;font-size:0.85rem;">Phone</td><td style="padding:8px 0;color:#2D2825;">${phone}</td></tr>` : ''}
                        <tr><td style="padding:8px 0;color:#7A726D;font-size:0.85rem;">Condition</td><td style="padding:8px 0;color:#2D2825;">${condition || '—'}</td></tr>
                        <tr><td style="padding:8px 0;color:#7A726D;font-size:0.85rem;">Resolution</td><td style="padding:8px 0;color:#2D2825;">${preferredResolution || '—'}</td></tr>
                        <tr><td style="padding:8px 0;color:#7A726D;font-size:0.85rem;">Reason</td><td style="padding:8px 0;color:#2D2825;">${reason}</td></tr>
                    </table>
                    <div style="background:#fff;border:1px solid #E8E1DC;border-radius:8px;padding:20px;margin-bottom:${additionalNotes ? '16px' : '0'};">
                        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#7A726D;margin:0 0 10px;">Items to Return</p>
                        <ul style="margin:0;padding-left:20px;">${itemsList}</ul>
                    </div>
                    ${additionalNotes ? `
                    <div style="background:#fff;border:1px solid #E8E1DC;border-radius:8px;padding:20px;">
                        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#7A726D;margin:0 0 10px;">Additional Notes</p>
                        <p style="color:#2D2825;line-height:1.7;margin:0;">${additionalNotes}</p>
                    </div>` : ''}
                </div>
            </div>
        `
    });

    // Auto-reply to customer with their ref number
    await transporter.sendMail({
        from: `"Aura Beauty" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Return Request Received — ${refNumber} | Aura`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #FCFAf8; border: 1px solid #E8E1DC; border-radius: 12px; overflow: hidden;">
                <div style="background: #2D2825; padding: 32px; text-align: center;">
                    <h1 style="color: #C9A99D; font-family: Georgia, serif; font-style: italic; font-size: 2rem; margin: 0;">Aura.</h1>
                </div>
                <div style="padding: 36px; text-align: center;">
                    <h2 style="color: #2D2825; font-family: Georgia, serif; font-size: 1.5rem; margin-bottom: 0.75rem;">Return Request Received</h2>
                    <p style="color: #7A726D; line-height: 1.7; max-width: 420px; margin: 0 auto 1.5rem;">
                        Hi ${firstName}, we've received your return request for order <strong style="color:#2D2825;">${orderNumber}</strong>.
                    </p>
                    <div style="display:inline-block;background:#fff;border:1px solid #E8E1DC;border-radius:8px;padding:16px 28px;margin-bottom:2rem;">
                        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#7A726D;margin:0 0 4px;">Your Return Reference</p>
                        <p style="font-weight:700;font-size:1.2rem;color:#A8867A;margin:0;">${refNumber}</p>
                    </div>
                    <p style="color:#7A726D;line-height:1.7;max-width:400px;margin:0 auto 2rem;font-size:0.9rem;">
                        Our team will review your request and get back to you within <strong style="color:#2D2825;">2 business days</strong> with next steps and a return label.
                    </p>
                    <a href="http://localhost:3000/track" style="display:inline-block;background:#2D2825;color:#fff;text-decoration:none;padding:14px 32px;border-radius:30px;font-size:0.9rem;font-weight:600;">Track Your Order</a>
                </div>
                <div style="background:#F5F0ED;padding:20px;text-align:center;border-top:1px solid #E8E1DC;">
                    <p style="color:#7A726D;font-size:0.75rem;margin:0;">© 2026 Aura Beauty. Karachi, Pakistan.</p>
                </div>
            </div>
        `
    });
}

// @desc    Get all return requests
// @route   GET /api/returns
// @access  Public (restrict with auth later)
const getReturnRequests = async (req, res) => {
    try {
        const returns = await ReturnRequest.find({}).sort({ createdAt: -1 }).lean();
        res.json(returns);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update return request status
// @route   PATCH /api/returns/:id/status
// @access  Admin
const updateReturnStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }
        const doc = await ReturnRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).lean();
        if (!doc) return res.status(404).json({ message: 'Return request not found.' });
        res.json({ message: 'Return status updated.', returnRequest: doc });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { sendReturnRequest, getReturnRequests, updateReturnStatus };
