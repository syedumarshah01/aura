'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import InteractiveClientWrapper from '../../components/InteractiveClientWrapper';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';

const STATUS_STEPS = ['processing', 'shipped', 'delivered'];

function StatusTimeline({ currentStatus }) {
    const idx = STATUS_STEPS.indexOf(currentStatus);
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, margin: '2.5rem 0' }}>
            {STATUS_STEPS.map((step, i) => {
                const done = i <= idx;
                return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${done ? 'var(--clr-primary-dark)' : 'var(--clr-border)'}`,
                                backgroundColor: done ? 'var(--clr-primary-dark)' : 'var(--clr-surface)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.4s ease'
                            }}>
                                {done ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--clr-border)' }} />
                                )}
                            </div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: done ? 600 : 400, color: done ? 'var(--clr-primary-dark)' : 'var(--clr-text-muted)' }}>
                                {step}
                            </span>
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                            <div style={{ flex: 1, height: '2px', backgroundColor: i < idx ? 'var(--clr-primary-dark)' : 'var(--clr-border)', margin: '0 0.5rem', marginBottom: '1.4rem', transition: 'background-color 0.4s ease' }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function TrackOrderInner() {
    const searchParams = useSearchParams();
    const [orderNumber, setOrderNumber] = useState('');
    const [email, setEmail] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cleanTitle = (title) =>
        title ? title.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/gi, '').trim() : '';

    const fetchOrder = async (overrideNum) => {
        // Use override (from URL param) or read the current input value
        const query = (overrideNum || orderNumber).trim().toUpperCase();
        if (!query) {
            setError('Please enter an order number.');
            return;
        }
        setLoading(true);
        setError(null);
        setOrder(null);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const url = `${apiBase}/orders/track/${encodeURIComponent(query)}`;
            console.log('Fetching order from:', url); // Debugging
            const res = await fetch(url);
            const data = await res.json();
            console.log('API response:', data); // Debugging
            if (!res.ok) throw new Error(data.message || 'No order found with that number.');
            if (email && data.email && data.email.toLowerCase() !== email.toLowerCase()) {
                throw new Error('The email address does not match this order.');
            }
            setOrder(data);
        } catch (err) {
            console.error('Fetch order error:', err); // Debugging
            setError(err.message || 'Could not find your order. Please check the number and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill and auto-fetch if ?order= param is present
    useEffect(() => {
        const param = searchParams.get('order');
        if (param) {
            const upper = param.trim().toUpperCase();
            setOrderNumber(upper);
            fetchOrder(upper);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTrack = (e) => {
        e.preventDefault();
        fetchOrder(orderNumber); // pass current value explicitly to avoid stale closure
    };

    // Scroll result into view when order is fetched
    useEffect(() => {
        if (order) {
            setTimeout(() => {
                document.getElementById('order-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [order]);

    const inputStyle = {
        width: '100%', padding: '1rem 1.2rem',
        border: '1px solid var(--clr-border)', borderRadius: '8px',
        fontSize: '1rem', fontFamily: 'var(--font-sans)',
        backgroundColor: 'var(--clr-bg)', color: 'var(--clr-text-main)',
        outline: 'none', transition: 'border-color 0.3s ease',
    };

    return (
        <InteractiveClientWrapper>
            <main style={{ paddingTop: '6rem', paddingBottom: '6rem', backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', padding: '0 2rem', marginBottom: '4rem' }}>
                    <span className="eyebrow">Order Status</span>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.15 }}>
                        Track Your <em>Order</em>
                    </h1>
                    <p style={{ color: 'var(--clr-text-muted)', marginTop: '1rem', maxWidth: '440px', margin: '1rem auto 0' }}>
                        Enter your order number from your confirmation email to see the latest status.
                    </p>
                </div>

                {/* Search Form */}
                <div style={{ maxWidth: '520px', margin: '0 auto 3rem', padding: '0 2rem' }}>
                    <form onSubmit={handleTrack} style={{ backgroundColor: 'var(--clr-surface)', borderRadius: '20px', padding: '2.5rem', border: '1px solid var(--clr-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-text-muted)', marginBottom: '0.5rem' }}>
                                Order Number
                            </label>
                            <input
                                style={inputStyle}
                                type="text"
                                value={orderNumber}
                                onChange={e => setOrderNumber(e.target.value)}
                                placeholder="AUR-XXXXXXXX"
                                required
                                onFocus={e => e.target.style.borderColor = 'var(--clr-primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--clr-border)'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-text-muted)', marginBottom: '0.5rem' }}>
                                Email Address <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — for verification)</span>
                            </label>
                            <input
                                style={inputStyle}
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="hello@example.com"
                                onFocus={e => e.target.style.borderColor = 'var(--clr-primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--clr-border)'}
                            />
                        </div>

                        {error && (
                            <div style={{ padding: '0.9rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.9rem' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '1rem', width: '100%', marginTop: '0.25rem' }}>
                            {loading ? 'Searching...' : 'Track Order →'}
                        </button>
                    </form>
                </div>

                {/* Order Result */}
                {order && (
                    <div
                        id="order-result"
                        style={{
                            maxWidth: '680px', margin: '0 auto', padding: '0 2rem',
                            animation: 'fadeInUp 0.5s ease both',
                        }}
                    >
                        <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }`}</style>
                        <div style={{ backgroundColor: 'var(--clr-surface)', borderRadius: '20px', padding: '2.5rem', border: '1px solid var(--clr-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>

                            {/* Order Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-text-muted)', marginBottom: '0.25rem' }}>Order Number</p>
                                    <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--clr-primary-dark)' }}>#{order.orderNumber}</p>
                                </div>
                                <span style={{
                                    padding: '0.4rem 1rem', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 600,
                                    textTransform: 'capitalize', letterSpacing: '0.05em',
                                    backgroundColor: order.orderStatus === 'delivered' ? '#e6f4ea' : order.orderStatus === 'shipped' ? '#e8f0fe' : 'var(--clr-accent)',
                                    color: order.orderStatus === 'delivered' ? '#137333' : order.orderStatus === 'shipped' ? '#1a56ff' : 'var(--clr-primary-dark)'
                                }}>
                                    {order.orderStatus}
                                </span>
                            </div>

                            {/* Timeline */}
                            <StatusTimeline currentStatus={order.orderStatus} />

                            {/* Shipping Address */}
                            <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '1.5rem', marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-text-muted)', marginBottom: '0.5rem' }}>Shipping To</p>
                                    <p style={{ fontWeight: 500, color: 'var(--clr-text-main)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                                        {order.shippingAddress.address}<br />
                                        {order.shippingAddress.city} {order.shippingAddress.postalCode}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-text-muted)', marginBottom: '0.5rem' }}>Order Date</p>
                                    <p style={{ fontWeight: 500, color: 'var(--clr-text-main)', fontSize: '0.9rem' }}>
                                        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--clr-border)', paddingTop: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-text-muted)', marginBottom: '1rem' }}>Items in this order</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {order.orderItems.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {item.image && (
                                                <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)', backgroundColor: 'var(--clr-bg)', position: 'relative', flexShrink: 0 }}>
                                                    <Image src={item.image} alt={cleanTitle(item.title)} fill style={{ objectFit: 'contain', padding: '4px' }} sizes="48px" />
                                                </div>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--clr-text-main)' }}>{cleanTitle(item.title).split(' - ')[0] || cleanTitle(item.title)}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Qty: {item.quantity}</p>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--clr-text-main)' }}>{item.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--clr-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: 'var(--clr-text-main)' }}>Total</span>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--clr-primary-dark)' }}>PKR {order.totalAmount?.toLocaleString()}</span>
                            </div>
                        </div>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>
                            Questions about your order? <Link href="/contact" style={{ color: 'var(--clr-primary-dark)', textDecoration: 'none', fontWeight: 500 }}>Contact us</Link>
                        </p>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <Link href="/" className="link-btn">← Back to Home</Link>
                </div>
            </main>
        </InteractiveClientWrapper>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={null}>
            <TrackOrderInner />
        </Suspense>
    );
}
