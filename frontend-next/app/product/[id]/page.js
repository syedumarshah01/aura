'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import InteractiveClientWrapper from '../../../components/InteractiveClientWrapper';
import RelatedProducts from '../../../components/RelatedProducts';
import { notFound } from 'next/navigation';

export default function ProductPage({ params }) {
    const { id } = params;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [openAccordion, setOpenAccordion] = useState(null);
    const { addToCart } = useCart();

    const toggleAccordion = (section) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/api/products/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        return notFound();
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProduct(data);

                // Main image fallback handling
                const fallbackImg = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                setMainImage(data.images?.[0] || fallbackImg);
            } catch (err) {
                console.error("Could not fetch product:", err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const formatPrice = (priceStr) => priceStr || 'Price TBA';
    const cleanTitle = (title) => title ? title.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '').trim() : '';

    if (loading) {
        return (
            <InteractiveClientWrapper>
                <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner"></div>
                </div>
            </InteractiveClientWrapper>
        );
    }

    if (error || !product) {
        return (
            <InteractiveClientWrapper>
                <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <h2>Product Not Found</h2>
                    <p style={{ color: 'var(--clr-text-muted)' }}>{error || "This item may have been removed."}</p>
                </div>
            </InteractiveClientWrapper>
        );
    }

    const isSoldOut = !product.in_stock;

    return (
        <InteractiveClientWrapper>
            <main style={{ paddingTop: '6rem', backgroundColor: 'var(--clr-bg)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', padding: '4rem 1rem' }}>

                    {/* Left side: Image Gallery */}
                    <div className="product-gallery fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="main-image-container" style={{ backgroundColor: 'var(--clr-surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'relative' }}>
                            {isSoldOut && (
                                <span className="tag sold-out" style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>Sold Out</span>
                            )}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={mainImage}
                                alt={product.title}
                                style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '500px', borderRadius: '8px' }}
                            />
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="thumbnail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                {product.images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: 'var(--clr-surface)',
                                            borderRadius: '8px',
                                            padding: '0.5rem',
                                            border: mainImage === img ? '2px solid var(--clr-primary)' : '2px solid transparent',
                                            transition: 'var(--transition-fast)'
                                        }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '80px', objectFit: 'contain' }} />
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
                            <span style={{ color: 'var(--clr-text-main)' }}> {cleanTitle(product.title).split(' - ')[0]}</span>
                        </div>

                        <div>
                            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3vw, 2.5rem)', lineHeight: 1.2, color: 'var(--clr-text-main)' }}>
                                {cleanTitle(product.title)}
                            </h1>
                            <div style={{ color: 'var(--clr-text-muted)', lineHeight: 1.6, marginTop: '1rem', marginBottom: '1.5rem', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                                {product.description || "The quintessential addition to your daily routine. Crafted with excellence to deliver unparalleled results."}
                            </div>
                            <p style={{ fontSize: '1.5rem', color: 'var(--clr-primary-dark)', marginTop: '0.5rem', fontWeight: 500 }}>
                                {formatPrice(product.price)}
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

                        {/* Accordion or Extra Details */}
                        <div className="extra-details" style={{ marginTop: '2rem', borderTop: '1px solid var(--clr-border)' }}>
                            {/* Product Information Accordion */}
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

                            {/* Shipping & Returns Accordion */}
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
                </div>

                {/* Related Products Section */}
                <div style={{ backgroundColor: 'var(--clr-surface)', padding: '4rem 0' }}>
                    <RelatedProducts currentProductId={product._id} />
                </div>
            </main>
        </InteractiveClientWrapper>
    );
}
