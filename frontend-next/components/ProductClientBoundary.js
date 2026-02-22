'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Image from 'next/image';

export default function ProductClientBoundary({ product, cleanTitle, formattedPrice, isSoldOut }) {
    const fallbackImg = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
    const [mainImage, setMainImage] = useState(product.images?.[0] || fallbackImg);
    const [openAccordion, setOpenAccordion] = useState(null);
    const { addToCart } = useCart();

    const toggleAccordion = (section) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    return (
        <>
            {/* Left side: Image Gallery */}
            <div className="product-gallery fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="main-image-container" style={{ backgroundColor: 'var(--clr-surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'relative', height: '500px' }}>
                    {isSoldOut && (
                        <span className="tag sold-out" style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>Sold Out</span>
                    )}
                    <Image
                        src={mainImage}
                        alt={cleanTitle}
                        fill
                        style={{ objectFit: 'contain', padding: '2rem' }}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                </div>

                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                    <div className="thumbnail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        {product.images.slice(0, 4).map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => setMainImage(img)}
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor: 'var(--clr-surface)',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    border: mainImage === img ? '2px solid var(--clr-primary)' : '2px solid transparent',
                                    transition: 'var(--transition-fast)',
                                    position: 'relative',
                                    height: '80px'
                                }}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${idx}`}
                                    fill
                                    style={{ objectFit: 'contain', padding: '0.5rem' }}
                                    sizes="100px"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right side: Product Information */}
            <div className="product-details reveal-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'start' }}>
                <div className="breadcrumbs" style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</a> /
                    <a href="/collections" style={{ color: 'inherit', textDecoration: 'none' }}> Collections</a> /
                    <span style={{ color: 'var(--clr-text-main)' }}> {cleanTitle.split(' - ')[0]}</span>
                </div>

                <div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3vw, 2.5rem)', lineHeight: 1.2, color: 'var(--clr-text-main)' }}>
                        {cleanTitle}
                    </h1>
                    <div style={{ color: 'var(--clr-text-muted)', lineHeight: 1.6, marginTop: '1rem', marginBottom: '1.5rem', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                        {product.description || "The quintessential addition to your daily routine. Crafted with excellence to deliver unparalleled results."}
                    </div>
                    <p style={{ fontSize: '1.5rem', color: 'var(--clr-primary-dark)', marginTop: '0.5rem', fontWeight: 500 }}>
                        {formattedPrice}
                    </p>
                </div>

                <div className="divider" style={{ width: '100%', height: '1px', backgroundColor: 'var(--clr-border)', margin: '1rem 0' }}></div>

                <div className="actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button
                        className={`primary-btn ${isSoldOut ? 'disabled' : ''}`}
                        style={{ flex: 2, padding: '1rem', opacity: isSoldOut ? 0.6 : 1, cursor: isSoldOut ? 'not-allowed' : 'pointer' }}
                        disabled={isSoldOut}
                        onClick={() => addToCart(product)}
                    >
                        {isSoldOut ? 'Notify When Available' : 'Add to Bag'}
                    </button>
                </div>

                <div className="extra-details" style={{ marginTop: '2rem', borderTop: '1px solid var(--clr-border)' }}>
                    <div style={{ borderBottom: '1px solid var(--clr-border)' }}>
                        <div
                            onClick={() => toggleAccordion('info')}
                            style={{ padding: '1.5rem 0', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 500 }}
                        >
                            <span>Product Information</span>
                            <span style={{ transform: openAccordion === 'info' ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }}>+</span>
                        </div>
                        <div style={{
                            maxHeight: openAccordion === 'info' ? '800px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease-in-out',
                            color: 'var(--clr-text-muted)',
                            lineHeight: 1.6
                        }}>
                            <div style={{ paddingBottom: '1.5rem' }}>
                                {product.highlights && product.highlights.length > 0 ? (
                                    <ul style={{ listStylePosition: 'inside', color: 'var(--clr-text-muted)' }}>
                                        {product.highlights.map((highlight, idx) => (
                                            <li key={idx} style={{ marginBottom: '0.5rem' }}>{highlight}</li>
                                        ))}
                                    </ul>
                                ) : product.description ? (
                                    <ul style={{ listStylePosition: 'inside', color: 'var(--clr-text-muted)' }}>
                                        {product.description.split('. ').filter(s => s.length > 10).map((detail, idx) => (
                                            <li key={idx} style={{ marginBottom: '0.5rem' }}>{detail.replace(/\n/g, '').trim()}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    "Experience the pinnacle of quality with this meticulously curated selection. Designed to seamlessly integrate into your lifestyle, this item delivers exceptional performance and reliability."
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ borderBottom: '1px solid var(--clr-border)' }}>
                        <div
                            onClick={() => toggleAccordion('shipping')}
                            style={{ padding: '1.5rem 0', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 500 }}
                        >
                            <span>Shipping & Returns</span>
                            <span style={{ transform: openAccordion === 'shipping' ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }}>+</span>
                        </div>
                        <div style={{
                            maxHeight: openAccordion === 'shipping' ? '500px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease-in-out',
                            color: 'var(--clr-text-muted)',
                            lineHeight: 1.6
                        }}>
                            <div style={{ paddingBottom: '1.5rem' }}>
                                Enjoy complimentary standard shipping on all orders. If you are not entirely satisfied with your purchase, returns are accepted within 30 days of delivery.
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
