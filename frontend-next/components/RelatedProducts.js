'use client';

import { useState, useEffect } from 'react';

export default function RelatedProducts({ currentProductId }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredProduct, setHoveredProduct] = useState(null);

    useEffect(() => {
        async function fetchRelated() {
            setLoading(true);
            try {
                // Fetch a generic page to simulate "related" or "you may also like"
                const pageNum = Math.floor(Math.random() * 5) + 1; // Random page simulating related
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?page=${pageNum}&limit=4`);
                if (response.ok) {
                    const data = await response.json();
                    // Filter out the current product just in case
                    const filtered = data.products.filter(p => String(p._id) !== String(currentProductId)).slice(0, 4);
                    setProducts(filtered);
                }
            } catch (err) {
                console.error("Could not fetch related products:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchRelated();
    }, [currentProductId]);

    if (loading || products.length === 0) return null;

    const formatPrice = (priceStr) => priceStr || 'TBA';

    return (
        <section className="container" style={{ paddingTop: '2rem' }}>
            <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '3rem' }}>
                You May Also <em>Like</em>
            </h2>

            <div className="product-grid loaded" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {products.map((product, index) => {
                    const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                    const hoverImage = product.images?.[1] || mainImage;
                    const isSoldOut = !product.in_stock;

                    const cleanTitle = (title) => title ? title.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '').trim() : '';

                    return (
                        <a
                            href={`/product/${product._id}`}
                            key={product._id}
                            className="product-card"
                            style={{ textDecoration: 'none', color: 'inherit', animationDelay: `${index * 0.1}s` }}
                            onMouseEnter={() => setHoveredProduct(product._id)}
                            onMouseLeave={() => setHoveredProduct(null)}
                        >
                            <div className="product-img-wrapper" style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--clr-surface)' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={hoveredProduct === product._id ? hoverImage : mainImage}
                                    alt={cleanTitle(product.title)}
                                    loading="lazy"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                                />
                                <button className="add-to-cart" disabled={isSoldOut} onClick={(e) => e.preventDefault()}>
                                    {isSoldOut ? 'Notify Me' : 'View Product'}
                                </button>
                            </div>
                            <div className="product-info">
                                <h3 className="product-title" title={cleanTitle(product.title)} style={{ fontSize: '0.9rem' }}>
                                    {cleanTitle(product.title).split(' - ')[0] || cleanTitle(product.title)}
                                </h3>
                                <div className="product-price">{formatPrice(product.price)}</div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </section>
    );
}
