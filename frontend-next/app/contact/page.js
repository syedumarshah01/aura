'use client';

import { useState } from 'react';
import InteractiveClientWrapper from '../../components/InteractiveClientWrapper';
import Link from 'next/link';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [sendError, setSendError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSendError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send.');
            setIsSuccess(true);
        } catch (err) {
            setSendError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem 1.2rem',
        border: '1px solid var(--clr-border)',
        borderRadius: '8px',
        fontSize: '1rem',
        fontFamily: 'var(--font-sans)',
        backgroundColor: 'var(--clr-bg)',
        color: 'var(--clr-text-main)',
        outline: 'none',
        transition: 'border-color 0.3s ease',
    };

    return (
        <InteractiveClientWrapper>
            <main style={{ paddingTop: '6rem', paddingBottom: '6rem', backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>

                {/* Page Header */}
                <div style={{ textAlign: 'center', marginBottom: '5rem', padding: '0 2rem' }}>
                    <span className="eyebrow">reach out</span>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '1rem', lineHeight: 1.15 }}>
                        We&rsquo;d Love to <em>Hear</em> From You
                    </h1>
                    <p style={{ color: 'var(--clr-text-muted)', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto' }}>
                        Whether you have a question about an order, a product, or simply want to say hello — our team is here.
                    </p>
                </div>

                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)', gap: '4rem', alignItems: 'start' }}>

                    {/* Left: Info Panel */}
                    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                        {/* Contact Cards */}
                        {[
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.74a16 16 0 0 0 6 6l.91-.97a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2.02z"></path>
                                    </svg>
                                ),
                                label: 'Phone',
                                value: '+92 300 000 0000',
                                sub: 'Mon–Sat, 9am–6pm PKT'
                            },
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                ),
                                label: 'Email',
                                value: 'Use the contact form →',
                                sub: 'We reply within 24 hours'
                            },
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                ),
                                label: 'Location',
                                value: 'Karachi, Pakistan',
                                sub: 'By appointment only'
                            }
                        ].map(({ icon, label, value, sub }) => (
                            <div key={label} style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    flexShrink: 0,
                                    width: '48px', height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--clr-accent)',
                                    color: 'var(--clr-primary-dark)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {icon}
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-text-muted)', marginBottom: '0.25rem' }}>{label}</p>
                                    <p style={{ fontWeight: 500, color: 'var(--clr-text-main)', marginBottom: '0.15rem' }}>{value}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>{sub}</p>
                                </div>
                            </div>
                        ))}

                        {/* Divider */}
                        <div style={{ height: '1px', backgroundColor: 'var(--clr-border)' }} />

                        {/* Social */}
                        <div>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-text-muted)', marginBottom: '1rem' }}>Follow Aura</p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {['Instagram', 'TikTok', 'Pinterest'].map(platform => (
                                    <a key={platform} href="#" style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '0.6rem 1.1rem',
                                        borderRadius: '30px',
                                        border: '1px solid var(--clr-border)',
                                        fontSize: '0.8rem', fontWeight: 500,
                                        color: 'var(--clr-text-main)',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                        fontFamily: 'var(--font-sans)'
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.backgroundColor = 'var(--clr-text-main)';
                                            e.currentTarget.style.color = '#fff';
                                            e.currentTarget.style.borderColor = 'var(--clr-text-main)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--clr-text-main)';
                                            e.currentTarget.style.borderColor = 'var(--clr-border)';
                                        }}>
                                        {platform}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="reveal-right" style={{
                        backgroundColor: 'var(--clr-surface)',
                        borderRadius: '20px',
                        padding: '3rem',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
                        border: '1px solid var(--clr-border)'
                    }}>
                        {isSuccess ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                <div style={{
                                    width: '72px', height: '72px', borderRadius: '50%',
                                    backgroundColor: 'var(--clr-accent)',
                                    color: 'var(--clr-primary-dark)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.5rem'
                                }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '0.75rem' }}>Message Sent!</h2>
                                <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                                    Thank you for reaching out. Our team will get back to you within 24 hours.
                                </p>
                                <button
                                    onClick={() => { setIsSuccess(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                                    className="outline-btn"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Send a Message</h2>
                                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                    Fill in the form and we&rsquo;ll get back to you shortly.
                                </p>

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input
                                            style={inputStyle}
                                            type="text" name="name" value={formData.name}
                                            onChange={handleChange} required placeholder="Full Name"
                                            onFocus={e => e.target.style.borderColor = 'var(--clr-primary)'}
                                            onBlur={e => e.target.style.borderColor = 'var(--clr-border)'}
                                        />
                                        <input
                                            style={inputStyle}
                                            type="email" name="email" value={formData.email}
                                            onChange={handleChange} required placeholder="Email Address"
                                            onFocus={e => e.target.style.borderColor = 'var(--clr-primary)'}
                                            onBlur={e => e.target.style.borderColor = 'var(--clr-border)'}
                                        />
                                    </div>
                                    <input
                                        style={inputStyle}
                                        type="text" name="subject" value={formData.subject}
                                        onChange={handleChange} required placeholder="Subject"
                                        onFocus={e => e.target.style.borderColor = 'var(--clr-primary)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--clr-border)'}
                                    />
                                    <textarea
                                        style={{ ...inputStyle, resize: 'vertical', minHeight: '160px', lineHeight: 1.6 }}
                                        name="message" value={formData.message}
                                        onChange={handleChange} required placeholder="Tell us how we can help you..."
                                        onFocus={e => e.target.style.borderColor = 'var(--clr-primary)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--clr-border)'}
                                    />
                                    <button
                                        type="submit"
                                        className="primary-btn"
                                        disabled={isSubmitting}
                                        style={{ padding: '1.1rem', fontSize: '1rem', width: '100%', marginTop: '0.5rem' }}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message →'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom back link */}
                <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <Link href="/" className="link-btn" style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </InteractiveClientWrapper>
    );
}
