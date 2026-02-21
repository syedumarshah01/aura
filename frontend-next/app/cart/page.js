'use client';

import { useCart } from '../../context/CartContext';
import InteractiveClientWrapper from '../../components/InteractiveClientWrapper';
import Link from 'next/link';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

    const formatPrice = (priceStr) => priceStr || 'Price TBA';
    const cleanTitle = (title) => title ? title.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '').trim() : '';

    return (
        <InteractiveClientWrapper>
            <main style={{ paddingTop: '8rem', paddingBottom: '6rem', backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>
                <div className="container">
                    <h1 className="fade-in-up" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: 'var(--clr-text-main)', marginBottom: '3rem', textAlign: 'center' }}>
                        Your <em>Shopping Bag</em>
                    </h1>

                    {cartItems.length === 0 ? (
                        <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--clr-surface)', borderRadius: '12px', maxWidth: '600px', margin: '0 auto' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--clr-text-muted)" strokeWidth="1" style={{ marginBottom: '1.5rem' }}>
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--clr-text-main)' }}>Your bag is currently empty.</h2>
                            <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2rem' }}>Discover our premium collections to find your perfect match.</p>
                            <Link href="/collections" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '3rem', alignItems: 'start' }}>
                            {/* Line Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {cartItems.map((item, index) => {
                                    const fallbackImg = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                                    const imgUrl = item.images?.[0] || fallbackImg;
                                    const title = cleanTitle(item.title).split(' - ')[0] || cleanTitle(item.title);

                                    return (
                                        <div key={item._id} className="cart-item fade-in-up" style={{
                                            display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '1.5rem', alignItems: 'center',
                                            padding: '1.5rem', backgroundColor: 'var(--clr-surface)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                                            animationDelay: `${index * 0.1}s`
                                        }}>
                                            <Link href={`/product/${item._id}`}>
                                                <div style={{ width: '120px', height: '120px', backgroundColor: 'var(--clr-bg)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={imgUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                                </div>
                                            </Link>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'stretch', justifyContent: 'center' }}>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Aura Select</div>
                                                <Link href={`/product/${item._id}`} style={{ textDecoration: 'none', color: 'var(--clr-text-main)' }}>
                                                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{title}</h3>
                                                </Link>
                                                <div style={{ color: 'var(--clr-primary-dark)', fontWeight: 500 }}>{formatPrice(item.price)}</div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem', height: '100%', justifyContent: 'space-between' }}>
                                                <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', color: 'var(--clr-text-muted)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                                                    Remove
                                                </button>

                                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--clr-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-main)' }}>-</button>
                                                    <span style={{ padding: '0 0.5rem', width: '30px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-main)' }}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Order Summary */}
                            <div className="order-summary reveal-right" style={{
                                backgroundColor: 'var(--clr-surface)', padding: '2rem', borderRadius: '12px',
                                position: 'sticky', top: '100px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
                            }}>
                                <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--clr-border)', paddingBottom: '1rem', marginBottom: '1.5rem', color: 'var(--clr-text-main)' }}>Order Summary</h2>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--clr-text-muted)' }}>
                                    <span>Subtotal</span>
                                    <span>PKR {cartTotal.toLocaleString()}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--clr-text-muted)' }}>
                                    <span>Shipping</span>
                                    <span>Complimentary</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--clr-border)', paddingTop: '1.5rem', marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 600, color: 'var(--clr-text-main)' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--clr-primary-dark)' }}>PKR {cartTotal.toLocaleString()}</span>
                                </div>

                                <button className="primary-btn" style={{ width: '100%', padding: '1.2rem' }} onClick={() => alert('Checkout flow seamlessly initiated.')}>
                                    Proceed to Checkout
                                </button>

                                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginTop: '1.5rem' }}>
                                    Secure checkout with Aura Premium.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </InteractiveClientWrapper>
    );
}
