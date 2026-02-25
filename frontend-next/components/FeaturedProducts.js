'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const { addToCart } = useCart();

    const fetchTrending = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/trending?limit=8`
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error('Could not fetch trending products:', err);
            setError('Failed to load trending products.');
        } finally {
            setTimeout(() => setLoading(false), 300);
        }
    }, []);

    useEffect(() => { fetchTrending(); }, [fetchTrending]);

    const cleanTitle = (title) =>
        title
            ? title
                .replace(/^(?:Buy|Purchase|Order)\s+/i, '')
                .replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '')
                .trim()
            : '';

    const formatPrice = (p) => p || 'TBA';

    // Format subcategory for display: "foundation" → "Foundation"
    const fmtCat = (s) => s ? s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

    return (
        <section id="featured" className="featured-products">
            <div className="section-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2>Trending <em>Selections</em></h2>
                <p>One pick from every category — refreshed just for you.</p>

                {/* Refresh button */}
                {!loading && (
                    <button
                        onClick={fetchTrending}
                        className="outline-btn"
                        style={{ marginTop: '1.25rem', gap: '0.5rem', display: 'inline-flex', alignItems: 'center' }}
                        aria-label="Load a new set of trending picks"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                        </svg>
                        New Picks
                    </button>
                )}
            </div>

            {loading && (
                <div className="loading-state active">
                    <div className="spinner"></div>
                    <p>Curating products...</p>
                </div>
            )}

            {error && !loading && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#cc0000' }}>{error}</p>
                    <button className="outline-btn" onClick={fetchTrending} style={{ marginTop: '1rem' }}>Try Again</button>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <p style={{ textAlign: 'center' }}>No products found.</p>
            )}

            <div className={`product-grid ${!loading ? 'loaded' : ''}`}>
                {!loading && !error && products.map((product, index) => {
                    const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                    const hoverImage = product.images?.[1] || mainImage;
                    const isSoldOut = !product.in_stock;
                    const title = cleanTitle(product.title);
                    const catLabel = fmtCat(product.subcategory);

                    return (
                        <a
                            href={`/product/${product._id}`}
                            key={product._id}
                            className="product-card"
                            style={{ animationDelay: `${index * 0.07}s`, textDecoration: 'none', color: 'inherit' }}
                            onMouseEnter={() => setHoveredProduct(product._id)}
                            onMouseLeave={() => setHoveredProduct(null)}
                        >
                            <div className="product-img-wrapper">
                                <div className="product-tags">
                                    {isSoldOut ? (
                                        <span className="tag sold-out">Sold Out</span>
                                    ) : (
                                        <span className="tag">{catLabel || 'Trending'}</span>
                                    )}
                                </div>
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <Image
                                        src={hoveredProduct === product._id ? hoverImage : mainImage}
                                        alt={title}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        sizes="(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    />
                                </div>
                                <button
                                    className="add-to-cart"
                                    disabled={isSoldOut}
                                    onClick={(e) => { e.preventDefault(); addToCart(product); }}
                                >
                                    {isSoldOut ? 'Out of Stock' : 'Add to Bag'}
                                </button>
                            </div>
                            <div className="product-info">
                                <div className="product-brand">{catLabel || 'Ophélie Select'}</div>
                                <h3 className="product-title" title={title}>
                                    {title.split(' - ')[0] || title}
                                </h3>
                                <div className="product-price">{formatPrice(product.price)}</div>
                            </div>
                        </a>
                    );
                })}
            </div>

            {/* View all CTA */}
            {!loading && !error && products.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link href="/collections" className="cta-btn" style={{ textDecoration: 'none' }}>
                        Browse All Collections
                    </Link>
                </div>
            )}
        </section>
    );
}
