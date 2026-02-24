'use client';

import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import InteractiveClientWrapper from '../../components/InteractiveClientWrapper';
import Image from 'next/image';
import Link from 'next/link';

const inputStyle = {
    width: '100%',
    padding: '0.9rem 1rem',
    border: '1px solid var(--clr-border)',
    borderRadius: '8px',
    fontSize: '0.95rem',
    backgroundColor: 'var(--clr-surface)',
    color: 'var(--clr-text-main)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
};

const cleanTitle = (title) =>
    title
        ? title
            .replace(/^(?:Buy|Purchase|Order)\s+/i, '')
            .replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '')
            .trim()
        : '';

export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderNumber, setOrderNumber] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [formData, setFormData] = useState({
        email: '', firstName: '', lastName: '',
        address: '', city: '', postalCode: '', phone: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setOrderError(null);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        try {
            const payload = {
                email: formData.email,
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    phone: formData.phone,
                },
                orderItems: cartItems.map((item) => ({
                    product: item._id,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.images?.[0] || '',
                })),
                totalAmount: cartTotal,
            };
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Order creation failed.');
            setOrderNumber(data.orderNumber);
            clearCart();
            setIsSuccess(true);
        } catch (err) {
            setOrderError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // — Success screen
    if (isSuccess) {
        return (
            <InteractiveClientWrapper>
                <style>{`
                    @keyframes scaleIn {
                        from { transform: scale(0.5); opacity: 0; }
                        to   { transform: scale(1);   opacity: 1; }
                    }
                    @keyframes drawCheck {
                        from { stroke-dashoffset: 60; }
                        to   { stroke-dashoffset: 0;  }
                    }
                    @keyframes ringPulse {
                        0%   { transform: scale(1);   opacity: 0.6; }
                        100% { transform: scale(1.45); opacity: 0; }
                    }
                    @keyframes slideUp {
                        from { transform: translateY(24px); opacity: 0; }
                        to   { transform: translateY(0);    opacity: 1; }
                    }
                    .success-card  { animation: slideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
                    .success-step  { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
                    .success-step:nth-child(1) { animation-delay: 0.55s; }
                    .success-step:nth-child(2) { animation-delay: 0.7s;  }
                    .success-step:nth-child(3) { animation-delay: 0.85s; }
                    .success-step:nth-child(4) { animation-delay: 1.0s;  }
                `}</style>

                <main style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--clr-bg)',
                    padding: '2rem',
                    paddingTop: '7rem',
                }}>
                    <div className="success-card" style={{
                        textAlign: 'center',
                        maxWidth: '520px',
                        width: '100%',
                    }}>
                        {/* ── Animated check circle ── */}
                        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 2rem', animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
                            {/* Pulse ring */}
                            <div style={{
                                position: 'absolute', inset: '-8px',
                                borderRadius: '50%',
                                border: '2px solid #c9a99d',
                                animation: 'ringPulse 1.4s ease-out 0.5s infinite',
                            }} />
                            {/* Circle bg */}
                            <div style={{
                                width: '100%', height: '100%',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #2d2825 0%, #5a4540 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 16px 40px rgba(45,40,37,0.28)',
                            }}>
                                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c9a99d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline
                                        points="20 6 9 17 4 12"
                                        style={{
                                            strokeDasharray: 60,
                                            strokeDashoffset: 0,
                                            animation: 'drawCheck 0.5s ease-out 0.55s both',
                                        }}
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* ── Heading ── */}
                        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--clr-text-muted)', marginBottom: '0.6rem' }}>
                            Order Confirmed
                        </p>
                        <h1 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            lineHeight: 1.1,
                            marginBottom: '1rem',
                            color: 'var(--clr-text-main)',
                        }}>
                            Thank you<em> for your order</em>
                        </h1>

                        {/* ── Order number pill ── */}
                        {orderNumber && (
                            <div style={{
                                display: 'inline-block',
                                padding: '0.55rem 1.4rem',
                                borderRadius: '999px',
                                border: '1.5px solid var(--clr-border)',
                                fontSize: '0.82rem',
                                letterSpacing: '0.08em',
                                color: 'var(--clr-text-muted)',
                                marginBottom: '1.5rem',
                            }}>
                                Order&nbsp;<strong style={{ color: 'var(--clr-primary-dark)' }}>#{orderNumber}</strong>
                            </div>
                        )}

                        <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '380px', margin: '0 auto 2.5rem' }}>
                            We've received your order and sent a confirmation to your email. Your items will be beautifully packaged and shipped shortly.
                        </p>

                        {/* ── Journey steps ── */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '0',
                            marginBottom: '2.5rem',
                            backgroundColor: 'var(--clr-surface)',
                            borderRadius: '14px',
                            padding: '1.5rem 1rem',
                            position: 'relative',
                        }}>
                            {/* Connector line */}
                            <div style={{
                                position: 'absolute',
                                top: 'calc(1.5rem + 16px)',
                                left: 'calc(12.5% + 16px)',
                                right: 'calc(12.5% + 16px)',
                                height: '2px',
                                background: 'linear-gradient(90deg, var(--clr-primary-dark) 25%, var(--clr-border) 25%)',
                            }} />

                            {[
                                { label: 'Confirmed', icon: '✓', active: true },
                                { label: 'Packed', icon: '◻', active: false },
                                { label: 'Shipped', icon: '◻', active: false },
                                { label: 'Delivered', icon: '◻', active: false },
                            ].map((step, i) => (
                                <div key={i} className="success-step" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        width: '32px', height: '32px',
                                        borderRadius: '50%',
                                        background: step.active ? 'var(--clr-primary-dark)' : 'var(--clr-surface)',
                                        border: `2px solid ${step.active ? 'var(--clr-primary-dark)' : 'var(--clr-border)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 0.6rem',
                                        fontSize: '0.75rem',
                                        color: step.active ? '#fff' : 'var(--clr-text-muted)',
                                        fontWeight: 700,
                                    }}>
                                        {step.active ? '✓' : ''}
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: step.active ? 'var(--clr-text-main)' : 'var(--clr-text-muted)', fontWeight: step.active ? 600 : 400 }}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* ── CTAs ── */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href={`/track?order=${orderNumber}`} style={{
                                display: 'inline-block',
                                padding: '0.9rem 2rem',
                                backgroundColor: 'var(--clr-text-main)',
                                color: 'var(--clr-surface)',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                            }}>
                                Track Order
                            </Link>
                            <Link href="/collections" style={{
                                display: 'inline-block',
                                padding: '0.9rem 2rem',
                                border: '1.5px solid var(--clr-border)',
                                color: 'var(--clr-text-muted)',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontWeight: 500,
                                fontSize: '0.88rem',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                            }}>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </main>
            </InteractiveClientWrapper>
        );
    }

    // — Empty cart guard
    if (cartItems.length === 0 && !isSubmitting) {
        return (
            <InteractiveClientWrapper>
                <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--clr-bg)', padding: '2rem' }}>
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--clr-text-main)' }}>Your bag is empty.</h2>
                        <Link href="/collections" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
                            Return to Collections
                        </Link>
                    </div>
                </main>
            </InteractiveClientWrapper>
        );
    }

    return (
        <InteractiveClientWrapper>
            <style>{`
                .checkout-layout {
                    display: grid;
                    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
                    gap: 3rem;
                    align-items: start;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }
                .checkout-summary-sticky {
                    position: sticky;
                    top: 100px;
                }
                .name-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .city-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
                .checkout-input { transition: border-color 0.2s ease; }
                .checkout-input:focus { border-color: var(--clr-primary-dark) !important; }

                @media (max-width: 860px) {
                    .checkout-layout {
                        grid-template-columns: 1fr;
                    }
                    /* Move summary above form on mobile */
                    .checkout-form-col { order: 2; }
                    .checkout-summary-col { order: 1; }
                    .checkout-summary-sticky { position: static; }
                }
                @media (max-width: 480px) {
                    .name-grid { grid-template-columns: 1fr; }
                    .city-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <main style={{ paddingTop: '7rem', paddingBottom: '6rem', backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>
                <div className="checkout-layout">

                    {/* ── Form ──────────────────────────────────── */}
                    <div className="checkout-form-col fade-in-up">
                        <h1 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                            color: 'var(--clr-text-main)',
                            marginBottom: '2rem',
                        }}>
                            Secure Checkout
                        </h1>

                        <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

                            {/* Contact */}
                            <section>
                                <h2 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--clr-text-muted)' }}>
                                    Contact Information
                                </h2>
                                <input
                                    className="checkout-input"
                                    type="email" name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Email Address"
                                    style={inputStyle}
                                />
                            </section>

                            {/* Shipping */}
                            <section>
                                <h2 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--clr-text-muted)' }}>
                                    Shipping Address
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                                    <div className="name-grid">
                                        <input className="checkout-input" type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="First Name" style={inputStyle} />
                                        <input className="checkout-input" type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Last Name" style={inputStyle} />
                                    </div>
                                    <input className="checkout-input" type="text" name="address" value={formData.address} onChange={handleInputChange} required placeholder="Address & Apartment" style={inputStyle} />
                                    <div className="city-grid">
                                        <input className="checkout-input" type="text" name="city" value={formData.city} onChange={handleInputChange} required placeholder="City" style={inputStyle} />
                                        <input className="checkout-input" type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required placeholder="Postal Code" style={inputStyle} />
                                    </div>
                                    <input className="checkout-input" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Phone Number" style={inputStyle} />
                                </div>
                            </section>

                            {orderError && (
                                <div style={{ padding: '0.9rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.88rem' }}>
                                    ⚠️ {orderError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={isSubmitting}
                                style={{ padding: '1.1rem', fontSize: '1rem', width: '100%', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                            >
                                {isSubmitting ? 'Processing…' : 'Place Order'}
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                Secure & encrypted checkout
                            </div>
                        </form>
                    </div>

                    {/* ── Order Summary ──────────────────────────── */}
                    <div className="checkout-summary-col">
                        <div className="checkout-summary-sticky" style={{
                            backgroundColor: 'var(--clr-surface)',
                            padding: '1.75rem',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                        }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--clr-border)', paddingBottom: '1rem', marginBottom: '1.25rem', color: 'var(--clr-text-muted)' }}>
                                In Your Bag
                            </h2>

                            <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.5rem', paddingRight: '4px' }}>
                                {cartItems.map((item) => {
                                    const imgUrl = item.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                                    const title = cleanTitle(item.title).split(' - ')[0] || cleanTitle(item.title);
                                    return (
                                        <div key={item._id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '0.9rem', alignItems: 'center' }}>
                                            <div style={{ position: 'relative', width: '60px', height: '60px', backgroundColor: 'var(--clr-bg)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)', flexShrink: 0 }}>
                                                <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: 'var(--clr-text-main)', color: '#fff', fontSize: '0.65rem', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', zIndex: 10 }}>
                                                    {item.quantity}
                                                </span>
                                                <Image src={imgUrl} alt={title} fill style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} sizes="60px" />
                                            </div>
                                            <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--clr-text-main)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {title}
                                            </span>
                                            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--clr-text-main)', whiteSpace: 'nowrap' }}>
                                                {item.price || 'TBA'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--clr-text-muted)', fontSize: '0.88rem' }}>
                                    <span>Subtotal</span>
                                    <span>PKR {cartTotal.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--clr-text-muted)', fontSize: '0.88rem' }}>
                                    <span>Shipping</span>
                                    <span style={{ color: '#2e7d32', fontWeight: 500 }}>Complimentary</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--clr-border)', paddingTop: '1rem', marginTop: '0.25rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--clr-text-main)' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--clr-primary-dark)' }}>PKR {cartTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </InteractiveClientWrapper>
    );
}
