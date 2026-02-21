'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../context/CartContext';

export default function InfiniteProductsGrid() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const { addToCart } = useCart();

    const observer = useRef();
    const limit = 12; // Fetch 12 items at a time

    const fetchProducts = useCallback(async (pageNum) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/products?page=${pageNum}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            setProducts(prev => {
                // Avoid appending duplicates by checking IDs
                const existingIds = new Set(prev.map(p => p._id));
                const newProducts = data.products.filter(p => !existingIds.has(p._id));
                return [...prev, ...newProducts];
            });

            if (data.page >= data.pages) {
                setHasMore(false);
            }
        } catch (err) {
            console.error("Could not fetch products:", err);
            setError("Failed to load products from database.");
        } finally {
            setLoading(false);
        }
    }, [limit]);

    // Initial load
    useEffect(() => {
        fetchProducts(1);
    }, [fetchProducts]);

    // Intersection Observer attached to the last element sentinel
    const lastProductElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchProducts(nextPage);
                    return nextPage;
                });
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchProducts]);

    const formatPrice = (priceStr) => {
        return priceStr || 'TBA';
    };

    return (
        <section className="featured-products" style={{ padding: '2rem 5%' }}>

            {error && (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                    <p style={{ color: '#cc0000' }}>{error}</p>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>No products found in the collection.</p>
            )}

            <div className="product-grid loaded">
                {products.map((product, index) => {
                    const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                    const hoverImage = product.images?.[1] || mainImage;
                    const isSoldOut = !product.in_stock;

                    const cleanTitle = (title) => title ? title.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '').trim() : '';

                    // Attach the ref to the very last product card rendered
                    const isLastElement = products.length === index + 1;

                    return (
                        <a
                            href={`/product/${product._id}`}
                            ref={isLastElement ? lastProductElementRef : null}
                            key={product._id}
                            className="product-card"
                            style={{ animation: 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards', textDecoration: 'none', color: 'inherit' }}
                            onMouseEnter={() => setHoveredProduct(product._id)}
                            onMouseLeave={() => setHoveredProduct(null)}
                        >
                            <div className="product-img-wrapper">
                                <div className="product-tags">
                                    {isSoldOut ? (
                                        <span className="tag sold-out">Sold Out</span>
                                    ) : (
                                        <span className="tag">In Stock</span>
                                    )}
                                </div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={hoveredProduct === product._id ? hoverImage : mainImage}
                                    alt={cleanTitle(product.title)}
                                    loading="lazy"
                                    style={{ transition: 'opacity 0.4s ease-in-out' }}
                                    onLoad={(e) => e.target.style.opacity = 1}
                                />
                                <button
                                    className="add-to-cart"
                                    disabled={isSoldOut}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addToCart(product);
                                    }}
                                >
                                    {isSoldOut ? 'Notify Me' : 'Add to Bag'}
                                </button>
                            </div>
                            <div className="product-info">
                                <div className="product-brand">Aura Select</div>
                                <h3 className="product-title" title={cleanTitle(product.title)}>
                                    {cleanTitle(product.title).split(' - ')[0] || cleanTitle(product.title)}
                                </h3>
                                <div className="product-price">{formatPrice(product.price)}</div>
                            </div>
                        </a>
                    );
                })}
            </div>

            {loading && (
                <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
                    <div className="spinner"></div>
                </div>
            )}

            {!hasMore && products.length > 0 && (
                <p style={{ textAlign: 'center', margin: '4rem 0', color: 'var(--clr-text-muted)' }}>
                    You've seen all the products.
                </p>
            )}
        </section>
    );
}
