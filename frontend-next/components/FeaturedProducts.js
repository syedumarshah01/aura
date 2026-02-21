'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 8;
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:5000/api/products?page=${page}&limit=${limit}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProducts(data.products);
                setPage(data.page);
                setTotalPages(data.pages);
            } catch (err) {
                console.error("Could not fetch products:", err);
                setError("Failed to load products from database.");
            } finally {
                setTimeout(() => setLoading(false), 300); // Small delay to allow CSS transitions
            }
        }

        fetchProducts();
    }, [page]);

    const handlePrev = () => {
        if (page > 1) {
            setPage(page - 1);
            document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleNext = () => {
        if (page < totalPages) {
            setPage(page + 1);
            document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const formatPrice = (priceStr) => {
        return priceStr || 'TBA';
    };

    return (
        <section id="featured" className="featured-products">
            <div className="section-header">
                <h2>Trending <em>Selections</em></h2>
                <p>Discover what our community is loving right now.</p>
            </div>

            {loading && (
                <div className="loading-state active">
                    <div className="spinner"></div>
                    <p>Curating products...</p>
                </div>
            )}

            {error && !loading && (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '1rem', color: '#cc0000' }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>{error}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginTop: '0.5rem' }}>Is the backend running on http://localhost:5000?</p>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>No products found.</p>
            )}

            <div className={`product-grid ${!loading ? 'loaded' : ''}`}>
                {!loading && !error && products.map((product, index) => {
                    const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                    const hoverImage = product.images?.[1] || mainImage;
                    const isSoldOut = !product.in_stock;

                    const cleanTitle = (title) => title ? title.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '').trim() : '';

                    return (
                        <a
                            href={`/product/${product._id}`}
                            key={product._id}
                            className="product-card"
                            style={{ animationDelay: `${index * 0.1}s`, textDecoration: 'none', color: 'inherit' }}
                            onMouseEnter={() => setHoveredProduct(product._id)}
                            onMouseLeave={() => setHoveredProduct(null)}
                        >
                            <div className="product-img-wrapper">
                                <div className="product-tags">
                                    {isSoldOut ? (
                                        <span className="tag sold-out">Sold Out</span>
                                    ) : (
                                        <span className="tag">Bestseller</span>
                                    )}
                                </div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={hoveredProduct === product._id ? hoverImage : mainImage}
                                    alt={cleanTitle(product.title)}
                                    loading="lazy"
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

            {!loading && !error && totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex' }}>
                    <button
                        onClick={handlePrev}
                        className="outline-btn"
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        onClick={handleNext}
                        className="outline-btn"
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </section>
    );
}
