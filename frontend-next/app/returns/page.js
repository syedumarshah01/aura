'use client';

import { useState } from 'react';
import InteractiveClientWrapper from '../../components/InteractiveClientWrapper';
import Link from 'next/link';

const RESOLUTION_OPTIONS = ['Full Refund', 'Exchange for Same Item', 'Store Credit', 'Exchange for Different Item'];
const CONDITION_OPTIONS = ['Unopened / Sealed', 'Opened but Unused', 'Used — Defective / Damaged', 'Wrong Item Received'];
const REASON_OPTIONS = ['Changed my mind', 'Product arrived damaged', 'Wrong item received', 'Product not as described', 'Allergic reaction', 'Duplicate order', 'Other'];

export default function ReturnsPage() {
    const [formData, setFormData] = useState({
        orderNumber: '', email: '', firstName: '', lastName: '',
        phone: '', returnItems: '', reason: '', condition: '',
        preferredResolution: '', additionalNotes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [refNumber, setRefNumber] = useState('');
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/returns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Submission failed.');
            setRefNumber(data.refNumber || '');
            setIsSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.9rem 1.1rem',
        border: '1px solid var(--clr-border)', borderRadius: '8px',
        fontSize: '0.95rem', fontFamily: 'var(--font-sans)',
        backgroundColor: 'var(--clr-bg)', color: 'var(--clr-text-main)',
        outline: 'none', transition: 'border-color 0.25s ease',
        boxSizing: 'border-box'
    };
    const focusIn = e => { e.target.style.borderColor = 'var(--clr-primary)'; };
    const focusOut = e => { e.target.style.borderColor = 'var(--clr-border)'; };

    const labelStyle = {
        display: 'block', fontSize: '0.75rem',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'var(--clr-text-muted)', marginBottom: '0.4rem'
    };

    return (
        <InteractiveClientWrapper>
            <main style={{ paddingTop: '6rem', paddingBottom: '6rem', backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', padding: '0 2rem', marginBottom: '4rem' }}>
                    <span className="eyebrow">Hassle-Free</span>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.15 }}>
                        Return a <em>Purchase</em>
                    </h1>
                    <p style={{ color: 'var(--clr-text-muted)', fontSize: '1rem', maxWidth: '480px', margin: '1rem auto 0' }}>
                        We accept returns within <strong>30 days</strong> of delivery for unopened, unused items. Fill in the form and we&apos;ll get back to you within 2 business days.
                    </p>
                </div>

                <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
                    {isSuccess ? (
                        <div style={{
                            textAlign: 'center',
                            backgroundColor: 'var(--clr-surface)',
                            padding: '4rem 3rem',
                            borderRadius: '20px',
                            border: '1px solid var(--clr-border)',
                            animation: 'successFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
                        }}>
                            <style>{`
                                @keyframes successFadeUp {
                                    from { opacity: 0; transform: translateY(24px); }
                                    to   { opacity: 1; transform: none; }
                                }
                                @keyframes popIn {
                                    0%   { transform: scale(0.4); opacity: 0; }
                                    70%  { transform: scale(1.1); }
                                    100% { transform: scale(1); opacity: 1; }
                                }
                            `}</style>

                            {/* Animated check */}
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #2d2825 0%, #5a4540 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.75rem',
                                boxShadow: '0 12px 32px rgba(45,40,37,0.22)',
                                animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
                            }}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a99d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>

                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                                Request Submitted!
                            </h2>

                            <p style={{ color: 'var(--clr-text-muted)', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
                                We've received your return request for order{' '}
                                <strong style={{ color: 'var(--clr-primary-dark)' }}>{formData.orderNumber}</strong>.
                                A confirmation has been sent to your email.
                            </p>

                            {/* Ref number pill */}
                            {refNumber && (
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.6rem 1.6rem',
                                    borderRadius: '999px',
                                    border: '1.5px solid var(--clr-border)',
                                    marginBottom: '2rem',
                                }}>
                                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-text-muted)' }}>Reference&nbsp;</span>
                                    <strong style={{ color: 'var(--clr-primary-dark)', fontSize: '0.95rem' }}>{refNumber}</strong>
                                </div>
                            )}

                            <div style={{
                                backgroundColor: 'var(--clr-bg)',
                                borderRadius: '12px',
                                padding: '1rem 1.5rem',
                                maxWidth: '380px',
                                margin: '0 auto 2rem',
                                fontSize: '0.85rem',
                                color: 'var(--clr-text-muted)',
                                lineHeight: 1.6,
                            }}>
                                ⏱ Our team will review your request and respond within <strong style={{ color: 'var(--clr-text-main)' }}>2 business days</strong> with next steps and a return label.
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link href="/track" className="primary-btn" style={{ textDecoration: 'none' }}>Track My Order</Link>
                                <Link href="/collections" className="outline-btn" style={{ textDecoration: 'none' }}>Continue Shopping</Link>
                            </div>
                        </div>

                    ) : (
                        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--clr-surface)', borderRadius: '20px', padding: '3rem', border: '1px solid var(--clr-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* Section 1: Order Info */}
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--clr-border)' }}>Order Details</h2>
                                <div className="grid-2">
                                    <div>
                                        <label style={labelStyle}>Order Number <span style={{ color: 'var(--clr-primary-dark)' }}>*</span></label>
                                        <input style={inputStyle} type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange} required placeholder="AUR-XXXXXXXX" onFocus={focusIn} onBlur={focusOut} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Email used at checkout <span style={{ color: 'var(--clr-primary-dark)' }}>*</span></label>
                                        <input style={inputStyle} type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" onFocus={focusIn} onBlur={focusOut} />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Customer Info */}
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--clr-border)' }}>Your Information</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>First Name <span style={{ color: 'var(--clr-primary-dark)' }}>*</span></label>
                                        <input style={inputStyle} type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="First Name" onFocus={focusIn} onBlur={focusOut} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Last Name</label>
                                        <input style={inputStyle} type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" onFocus={focusIn} onBlur={focusOut} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone (optional — for faster resolution)</label>
                                    <input style={inputStyle} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+92 300 0000000" onFocus={focusIn} onBlur={focusOut} />
                                </div>
                            </div>

                            {/* Section 3: Return Details */}
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--clr-border)' }}>Return Details</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Items to Return <span style={{ color: 'var(--clr-primary-dark)' }}>*</span> <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(one item per line)</span></label>
                                        <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', lineHeight: 1.6 }} name="returnItems" value={formData.returnItems} onChange={handleChange} required placeholder={'e.g. Neutrogena Hydro Boost Gel\nMaybelline Fit Me Foundation 220'} onFocus={focusIn} onBlur={focusOut} />
                                    </div>

                                    <div className="grid-2">
                                        <div>
                                            <label style={labelStyle}>Item Condition <span style={{ color: 'var(--clr-primary-dark)' }}>*</span></label>
                                            <select style={{ ...inputStyle, cursor: 'pointer' }} name="condition" value={formData.condition} onChange={handleChange} required onFocus={focusIn} onBlur={focusOut}>
                                                <option value="">Select condition</option>
                                                {CONDITION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Preferred Resolution <span style={{ color: 'var(--clr-primary-dark)' }}>*</span></label>
                                            <select style={{ ...inputStyle, cursor: 'pointer' }} name="preferredResolution" value={formData.preferredResolution} onChange={handleChange} required onFocus={focusIn} onBlur={focusOut}>
                                                <option value="">Select resolution</option>
                                                {RESOLUTION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Reason for Return <span style={{ color: 'var(--clr-primary-dark)' }}>*</span></label>
                                        <select style={{ ...inputStyle, cursor: 'pointer', marginBottom: '0.75rem' }} name="reason" value={formData.reason} onChange={handleChange} required onFocus={focusIn} onBlur={focusOut}>
                                            <option value="">Select a reason</option>
                                            {REASON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Additional Notes</label>
                                        <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', lineHeight: 1.6 }} name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} placeholder="Any other details that would help us process your return faster..." onFocus={focusIn} onBlur={focusOut} />
                                    </div>
                                </div>
                            </div>

                            {/* Policy Notice */}
                            <div style={{ backgroundColor: 'var(--clr-accent)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--clr-primary-dark)', lineHeight: 1.6 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span>Returns are accepted within <strong>30 days</strong> of delivery for <strong>unopened, unused</strong> items in original packaging. Opened cosmetics and fragrances cannot be returned for hygiene reasons.</span>
                            </div>

                            {error && (
                                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.9rem' }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <button type="submit" className="primary-btn" disabled={isSubmitting} style={{ padding: '1.1rem', fontSize: '1rem', width: '100%' }}>
                                {isSubmitting ? 'Submitting Request...' : 'Submit Return Request →'}
                            </button>
                        </form>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <Link href="/shipping" className="link-btn">← Shipping &amp; Returns Policy</Link>
                </div>
            </main>
        </InteractiveClientWrapper>
    );
}
