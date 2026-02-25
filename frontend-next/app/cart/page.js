'use client';

import { useCart } from '../../context/CartContext';
import InteractiveClientWrapper from '../../components/InteractiveClientWrapper';
import Link from 'next/link';
import Image from 'next/image';

const cleanTitle = (title) =>
    title
        ? title
            .replace(/^(?:Buy|Purchase|Order)\s+/i, '')
            .replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '')
            .trim()
        : '';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
    const formatPrice = (p) => p || 'Price TBA';

    return (
        <InteractiveClientWrapper>
            <style>{`
                .cart-layout {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 340px;
                    gap: 2.5rem;
                    align-items: start;
                }
                .cart-item-row {
                    display: grid;
                    grid-template-columns: 110px 1fr auto;
                    gap: 1.25rem;
                    align-items: center;
                }
                @media (max-width: 900px) {
                    .cart-layout {
                        grid-template-columns: 1fr;
                    }
                    .cart-summary-sticky {
                        position: static !important;
                    }
                }
                @media (max-width: 540px) {
                    .cart-item-row {
                        grid-template-columns: 90px 1fr;
                        grid-template-rows: auto auto;
                    }
                    .cart-item-actions {
                        grid-column: 1 / -1;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        flex-direction: row-reverse;
                        padding-top: 0.5rem;
                        border-top: 1px solid var(--clr-border);
                    }
                }
            `}</style>

            <main style={{ paddingTop: '8rem', paddingBottom: '6rem', backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

                    <h1 className="fade-in-up" style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        color: 'var(--clr-text-main)',
                        marginBottom: '2.5rem',
                        textAlign: 'center',
                    }}>
                        Your <em>Shopping Bag</em>
                    </h1>

                    {cartItems.length === 0 ? (
                        <div className="fade-in" style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            backgroundColor: 'var(--clr-surface)',
                            borderRadius: '16px',
                            maxWidth: '520px',
                            margin: '0 auto',
                        }}>
                            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--clr-text-muted)" strokeWidth="1" style={{ marginBottom: '1.5rem' }}>
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--clr-text-main)' }}>
                                Your bag is empty
                            </h2>
                            <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                Discover our premium collections to find your perfect match.
                            </p>
                            <Link href="/collections" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="cart-layout">

                            {/* ── Line Items ──────────────────────────── */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {cartItems.map((item, index) => {
                                    const imgUrl = item.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                                    const title = cleanTitle(item.title).split(' - ')[0] || cleanTitle(item.title);

                                    return (
                                        <div
                                            key={item._id}
                                            className="cart-item-row fade-in-up"
                                            style={{
                                                padding: '1.25rem',
                                                backgroundColor: 'var(--clr-surface)',
                                                borderRadius: '12px',
                                                animationDelay: `${index * 0.08}s`,
                                            }}
                                        >
                                            {/* Image */}
                                            <Link href={`/product/${item._id}`}>
                                                <div style={{
                                                    width: '100%',
                                                    aspectRatio: '1/1',
                                                    backgroundColor: 'var(--clr-bg)',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                }}>
                                                    <Image
                                                        src={imgUrl}
                                                        alt={title}
                                                        fill
                                                        style={{ objectFit: 'contain', mixBlendMode: 'multiply' }}
                                                        sizes="110px"
                                                    />
                                                </div>
                                            </Link>

                                            {/* Info */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                    Ophélie Select
                                                </p>
                                                <Link href={`/product/${item._id}`} style={{ textDecoration: 'none', color: 'var(--clr-text-main)' }}>
                                                    <h3 style={{
                                                        fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                                                        fontWeight: 500,
                                                        lineHeight: 1.35,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}>
                                                        {title}
                                                    </h3>
                                                </Link>
                                                <p style={{ color: 'var(--clr-primary-dark)', fontWeight: 600, fontSize: '0.95rem' }}>
                                                    {formatPrice(item.price)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="cart-item-actions" style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                gap: '0.75rem',
                                                justifyContent: 'space-between',
                                                alignSelf: 'stretch',
                                            }}>
                                                <button
                                                    onClick={() => removeFromCart(item._id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--clr-text-muted)',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        textDecoration: 'underline',
                                                        padding: 0,
                                                    }}
                                                >
                                                    Remove
                                                </button>

                                                {/* Qty stepper */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    border: '1px solid var(--clr-border)',
                                                    borderRadius: '6px',
                                                    overflow: 'hidden',
                                                }}>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                        style={{ padding: '0.45rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-main)', fontSize: '1rem', lineHeight: 1 }}
                                                    >
                                                        −
                                                    </button>
                                                    <span style={{ padding: '0 0.5rem', minWidth: '28px', textAlign: 'center', fontSize: '0.9rem' }}>
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                        style={{ padding: '0.45rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-main)', fontSize: '1rem', lineHeight: 1 }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <Link href="/collections" style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontSize: '0.82rem',
                                    color: 'var(--clr-text-muted)',
                                    textDecoration: 'none',
                                    marginTop: '0.5rem',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}>
                                    ← Continue Shopping
                                </Link>
                            </div>

                            {/* ── Order Summary ───────────────────────── */}
                            <div className="cart-summary-sticky" style={{
                                backgroundColor: 'var(--clr-surface)',
                                padding: '1.75rem',
                                borderRadius: '16px',
                                position: 'sticky',
                                top: '100px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                            }}>
                                <h2 style={{
                                    fontSize: '1.15rem',
                                    fontWeight: 600,
                                    borderBottom: '1px solid var(--clr-border)',
                                    paddingBottom: '1rem',
                                    marginBottom: '1.25rem',
                                    color: 'var(--clr-text-main)',
                                    letterSpacing: '0.01em',
                                }}>
                                    Order Summary
                                </h2>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
                                    <span>Subtotal ({cartItems.reduce((a, i) => a + i.quantity, 0)} items)</span>
                                    <span>PKR {cartTotal.toLocaleString()}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
                                    <span>Shipping</span>
                                    <span style={{ color: '#2e7d32', fontWeight: 500 }}>Complimentary</span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    borderTop: '1px solid var(--clr-border)',
                                    paddingTop: '1.25rem',
                                    marginBottom: '1.5rem',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    color: 'var(--clr-text-main)',
                                }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--clr-primary-dark)' }}>PKR {cartTotal.toLocaleString()}</span>
                                </div>

                                <Link
                                    href="/checkout"
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        padding: '1rem',
                                        backgroundColor: 'var(--clr-text-main)',
                                        color: 'var(--clr-surface)',
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                        transition: 'opacity 0.2s ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    Proceed to Checkout
                                </Link>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.4rem',
                                    marginTop: '1.25rem',
                                    color: 'var(--clr-text-muted)',
                                    fontSize: '0.75rem',
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    Secure checkout
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </InteractiveClientWrapper>
    );
}
