'use client';

import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import InteractiveClientWrapper from '../../components/InteractiveClientWrapper';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderNumber, setOrderNumber] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderError, setOrderError] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        phone: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setOrderError(null);

        // Simulate a 2-second payment network pipeline
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
                    phone: formData.phone
                },
                orderItems: cartItems.map((item) => ({
                    product: item._id,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.images?.[0] || ''
                })),
                totalAmount: cartTotal
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Order creation failed.');
            }

            setOrderNumber(data.orderNumber);
            clearCart();
            setIsSuccess(true);
        } catch (err) {
            console.error('Order error:', err);
            setOrderError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (priceStr) => priceStr || 'TBA';
    const cleanTitle = (title) => title ? title.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '').trim() : '';

    if (isSuccess) {
        return (
            <InteractiveClientWrapper>
                <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--clr-bg)' }}>
                    <div className="fade-in-up" style={{ textAlign: 'center', backgroundColor: 'var(--clr-surface)', padding: '4rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', maxWidth: '600px', width: '90%' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e6f4ea', color: '#137333', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--clr-text-main)' }}>Order Confirmed</h1>
                        {orderNumber && (
                            <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-text-muted)', marginBottom: '0.75rem' }}>
                                Order <strong style={{ color: 'var(--clr-primary-dark)' }}>#{orderNumber}</strong>
                            </p>
                        )}
                        <p style={{ color: 'var(--clr-text-muted)', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                            Thank you for elevating your routine with Aura. Your order is being beautifully packaged and will ship shortly.
                        </p>
                        <Link href="/collections" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            Continue Shopping
                        </Link>
                    </div>
                </main>
            </InteractiveClientWrapper>
        );
    }

    // Safety fallback for empty carts accessing /checkout
    if (cartItems.length === 0 && !isSuccess && !isSubmitting) {
        return (
            <InteractiveClientWrapper>
                <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--clr-bg)' }}>
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--clr-text-main)' }}>Your bag is currently empty.</h2>
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
            <main style={{ paddingTop: '7rem', paddingBottom: '6rem', backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }}>

                    {/* Left Column: Form & Details */}
                    <div className="checkout-form-container fade-in-up" style={{ paddingRight: '2rem' }}>
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--clr-text-main)', marginBottom: '2.5rem' }}>Secure Checkout</h1>

                        <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Contact Section */}
                            <section>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--clr-text-main)' }}>Contact Information</h2>
                                <div className="input-group">
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Email Address" style={{ width: '100%', padding: '1rem', border: '1px solid var(--clr-border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--clr-surface)', transition: 'border-color 0.3s ease' }} />
                                </div>
                            </section>

                            {/* Shipping Section */}
                            <section>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--clr-text-main)', marginTop: '1rem' }}>Shipping Address</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="First Name" style={{ width: '100%', padding: '1rem', border: '1px solid var(--clr-border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--clr-surface)' }} />
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Last Name" style={{ width: '100%', padding: '1rem', border: '1px solid var(--clr-border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--clr-surface)' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} required placeholder="Address & Suite" style={{ width: '100%', padding: '1rem', border: '1px solid var(--clr-border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--clr-surface)' }} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} required placeholder="City" style={{ width: '100%', padding: '1rem', border: '1px solid var(--clr-border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--clr-surface)' }} />
                                        <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required placeholder="Postal Code" style={{ width: '100%', padding: '1rem', border: '1px solid var(--clr-border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--clr-surface)' }} />
                                    </div>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Phone Number" style={{ width: '100%', padding: '1rem', border: '1px solid var(--clr-border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--clr-surface)' }} />
                                </div>
                            </section>

                            {orderError && (
                                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.9rem', marginTop: '-1rem' }}>
                                    ⚠️ {orderError}
                                </div>
                            )}

                            <button type="submit" className="primary-btn" disabled={isSubmitting} style={{ marginTop: '2rem', padding: '1.2rem', fontSize: '1.1rem', width: '100%', position: 'relative' }}>
                                {isSubmitting ? 'Processing Securely...' : 'Pay Now'}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="checkout-summary reveal-right" style={{ backgroundColor: 'var(--clr-surface)', padding: '2.5rem', borderRadius: '16px', position: 'sticky', top: '100px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <h2 style={{ fontSize: '1.3rem', borderBottom: '1px solid var(--clr-border)', paddingBottom: '1rem', marginBottom: '2rem', color: 'var(--clr-text-main)' }}>In Your Bag</h2>

                        <div className="checkout-items-scroll" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {cartItems.map((item) => {
                                const fallbackImg = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                                const imgUrl = item.images?.[0] || fallbackImg;
                                const title = cleanTitle(item.title).split(' - ')[0] || cleanTitle(item.title);

                                return (
                                    <div key={item._id} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ position: 'relative', width: '64px', height: '64px', backgroundColor: 'var(--clr-bg)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
                                            <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: 'var(--clr-text-main)', color: '#fff', fontSize: '0.7rem', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', zIndex: 10 }}>{item.quantity}</span>
                                            <Image src={imgUrl} alt={title} fill style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} sizes="64px" />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--clr-text-main)' }}>{title}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>Aura Select</span>
                                        </div>
                                        <div style={{ fontWeight: 500, color: 'var(--clr-text-main)' }}>
                                            {formatPrice(item.price)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--clr-text-muted)', fontSize: '0.95rem' }}>
                                <span>Subtotal</span>
                                <span>PKR {cartTotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--clr-text-muted)', fontSize: '0.95rem' }}>
                                <span>Shipping</span>
                                <span>Complimentary</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--clr-border)', paddingTop: '1.5rem', fontSize: '1.3rem', fontWeight: 600, color: 'var(--clr-text-main)' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--clr-primary-dark)' }}>PKR {cartTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </InteractiveClientWrapper>
    );
}
