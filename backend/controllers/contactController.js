const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: { rejectUnauthorized: false }
});

// @desc    Send a contact form email
// @route   POST /api/contact
// @access  Public
const sendContactEmail = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email and message are required.' });
    }

    try {
        const transporter = createTransporter();

        // Notify store owner
        await transporter.sendMail({
            from: `"Aura Contact" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: email,
            subject: subject ? `[Contact] ${subject}` : `[Contact Form] Message from ${name}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fcfaf8;border:1px solid #e8e1dc;border-radius:12px;overflow:hidden;">
                    <div style="background:#2d2825;padding:24px 32px;">
                        <h1 style="color:#c9a99d;font-family:Georgia,serif;font-style:italic;font-size:1.5rem;margin:0;">Aura. — Contact Form</h1>
                    </div>
                    <div style="padding:32px;">
                        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                            <tr><td style="padding:8px 0;color:#7a726d;font-size:0.85rem;width:120px;">Name</td><td style="padding:8px 0;color:#2d2825;font-weight:600;">${name}</td></tr>
                            <tr><td style="padding:8px 0;color:#7a726d;font-size:0.85rem;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#a8867a;">${email}</a></td></tr>
                            ${subject ? `<tr><td style="padding:8px 0;color:#7a726d;font-size:0.85rem;">Subject</td><td style="padding:8px 0;color:#2d2825;">${subject}</td></tr>` : ''}
                        </table>
                        <div style="background:#fff;border:1px solid #e8e1dc;border-radius:8px;padding:20px;">
                            <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#7a726d;margin:0 0 10px;">Message</p>
                            <p style="color:#2d2825;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
                        </div>
                    </div>
                </div>
            `
        });

        // Auto-reply to sender
        await transporter.sendMail({
            from: `"Aura Beauty" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `We received your message | Aura`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fcfaf8;border:1px solid #e8e1dc;border-radius:12px;overflow:hidden;">
                    <div style="background:#2d2825;padding:32px;text-align:center;">
                        <h1 style="color:#c9a99d;font-family:Georgia,serif;font-style:italic;font-size:2rem;margin:0;">Aura.</h1>
                    </div>
                    <div style="padding:36px;text-align:center;">
                        <h2 style="color:#2d2825;font-family:Georgia,serif;font-size:1.5rem;margin-bottom:0.75rem;">Message Received</h2>
                        <p style="color:#7a726d;line-height:1.7;max-width:420px;margin:0 auto 1.5rem;">
                            Hi ${name}, thank you for reaching out. We'll get back to you within <strong style="color:#2d2825;">1–2 business days</strong>.
                        </p>
                    </div>
                    <div style="background:#f5f0ed;padding:20px;text-align:center;border-top:1px solid #e8e1dc;">
                        <p style="color:#7a726d;font-size:0.75rem;margin:0;">© ${new Date().getFullYear()} Aura Beauty. Karachi, Pakistan.</p>
                    </div>
                </div>
            `
        });

        res.json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Contact email error:', error);
        res.status(500).json({ message: 'Failed to send message.', error: error.message });
    }
};

module.exports = { sendContactEmail };
