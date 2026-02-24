'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import Image from 'next/image';

export default function InfiniteProductsGrid({ category = '' }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const { addToCart } = useCart();

    const observer = useRef();
    const limit = 12;

    const fetchProducts = useCallback(async (pageNum, cat) => {
        try {
            setLoading(true);
            const catParam = cat ? `&subcategory=${encodeURIComponent(cat)}` : '';
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?page=${pageNum}&limit=${limit}${catParam}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            setProducts(prev => {
                if (pageNum === 1) return data.products;
                const existingIds = new Set(prev.map(p => p._id));
                const newProducts = data.products.filter(p => !existingIds.has(p._id));
                return [...prev, ...newProducts];
            });

            if (data.page >= data.pages) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (err) {
            console.error("Could not fetch products:", err);
            setError("Failed to load products from database.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Reset and refetch whenever category changes
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        fetchProducts(1, category);
    }, [category, fetchProducts]);

    const lastProductElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchProducts(nextPage, category);
                    return nextPage;
                });
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchProducts, category]);

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
                <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--clr-text-muted)' }}>No products found in this category.</p>
                </div>
            )}

            <div className="product-grid loaded">
                {products.map((product, index) => {
                    const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                    const hoverImage = product.images?.[1] || mainImage;
                    const isSoldOut = !product.in_stock;

                    const cleanTitle = (title) => title ? title.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '').trim() : '';

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
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <Image
                                        src={hoveredProduct === product._id ? (product.images?.[1] || product.images?.[0]) : (product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop')}
                                        alt={cleanTitle(product.title)}
                                        fill
                                        style={{ objectFit: 'contain', transition: 'opacity 0.4s ease-in-out' }}
                                        sizes="(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                        onLoad={(e) => e.target.style.opacity = 1}
                                    />
                                </div>
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
                    You&apos;ve seen all the products.
                </p>
            )}
        </section>
    );
}
