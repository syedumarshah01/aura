'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

const cleanTitle = (title) =>
    title
        ? title
            .replace(/^(?:Buy|Purchase|Order)\s+/i, '')
            .replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '')
            .trim()
        : '';

export default function RelatedProducts({ currentProductId, subcategory }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        async function fetchRelated() {
            setLoading(true);
            try {
                // Try fetching by same subcategory first
                const catParam = subcategory
                    ? `&subcategory=${encodeURIComponent(subcategory)}`
                    : '';
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?limit=8${catParam}`
                );
                if (response.ok) {
                    const data = await response.json();
                    const filtered = data.products
                        .filter(p => String(p._id) !== String(currentProductId))
                        .slice(0, 6);
                    setProducts(filtered);
                }
            } catch (err) {
                console.error('Could not fetch related products:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchRelated();
    }, [currentProductId, subcategory]);

    if (loading) {
        return (
            <section style={{ padding: '4rem 5%' }}>
                <div style={{ display: 'flex', gap: '1.5rem', overflow: 'hidden' }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} style={{
                            flexShrink: 0,
                            width: '240px',
                            height: '340px',
                            borderRadius: '12px',
                            background: 'var(--clr-border)',
                            animation: 'pulse 1.5s ease-in-out infinite',
                            opacity: 1 - i * 0.15,
                        }} />
                    ))}
                </div>
                <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section style={{ padding: '4rem 5% 5rem' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
            }}>
                <div>
                    <p style={{
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        color: 'var(--clr-text-muted)',
                        marginBottom: '0.4rem',
                    }}>
                        {subcategory || 'Similar Items'}
                    </p>
                    <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                        lineHeight: 1.1,
                        margin: 0,
                    }}>
                        You May Also <em>Like</em>
                    </h2>
                </div>
                <a
                    href={subcategory ? `/collections?cat=${encodeURIComponent(subcategory)}` : '/collections'}
                    style={{
                        fontSize: '0.82rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--clr-text-muted)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--clr-border)',
                        paddingBottom: '2px',
                        transition: 'color 0.2s ease, border-color 0.2s ease',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--clr-text-main)';
                        e.currentTarget.style.borderColor = 'var(--clr-text-main)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--clr-text-muted)';
                        e.currentTarget.style.borderColor = 'var(--clr-border)';
                    }}
                >
                    View All →
                </a>
            </div>

            {/* Horizontal scroll track */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.5rem',
            }}>
                {products.map((product, index) => {
                    const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                    const hoverImage = product.images?.[1] || mainImage;
                    const isSoldOut = !product.in_stock;
                    const title = cleanTitle(product.title);
                    const isHovered = hoveredProduct === product._id;

                    return (
                        <a
                            key={product._id}
                            href={`/product/${product._id}`}
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                display: 'block',
                                transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                                transform: isHovered ? 'translateY(-4px)' : 'none',
                                animationDelay: `${index * 0.06}s`,
                            }}
                            onMouseEnter={() => setHoveredProduct(product._id)}
                            onMouseLeave={() => setHoveredProduct(null)}
                        >
                            {/* Image box */}
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '1 / 1',
                                backgroundColor: 'var(--clr-bg)',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                marginBottom: '0.9rem',
                            }}>
                                <Image
                                    src={isHovered ? hoverImage : mainImage}
                                    alt={title}
                                    fill
                                    style={{
                                        objectFit: 'contain',
                                        mixBlendMode: 'multiply',
                                        padding: '8px',
                                        transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                    sizes="(max-width: 640px) 50vw, 25vw"
                                />

                                {/* Overlay CTA */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    padding: '0.75rem',
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'opacity 0.25s ease',
                                }}>
                                    <button
                                        style={{
                                            width: '100%',
                                            padding: '0.65rem',
                                            background: 'rgba(255,255,255,0.92)',
                                            backdropFilter: 'blur(6px)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.78rem',
                                            fontFamily: 'var(--font-sans)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            fontWeight: 600,
                                            cursor: isSoldOut ? 'default' : 'pointer',
                                            color: 'var(--clr-text-main)',
                                        }}
                                        disabled={isSoldOut}
                                        onClick={e => {
                                            e.preventDefault();
                                            if (!isSoldOut) addToCart(product);
                                        }}
                                    >
                                        {isSoldOut ? 'Sold Out' : 'Add to Bag'}
                                    </button>
                                </div>

                                {/* Tags */}
                                {isSoldOut && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.6rem',
                                        left: '0.6rem',
                                        background: '#eee',
                                        color: '#999',
                                        fontSize: '0.65rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                    }}>
                                        Sold Out
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div>
                                <p style={{
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: 'var(--clr-text-muted)',
                                    marginBottom: '0.3rem',
                                }}>
                                    {product.subcategory || 'Aura Select'}
                                </p>
                                <h3 style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '0.95rem',
                                    fontWeight: 400,
                                    lineHeight: 1.35,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    marginBottom: '0.4rem',
                                    color: 'var(--clr-text-main)',
                                }}>
                                    {title.split(' - ')[0] || title}
                                </h3>
                                <p style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    color: 'var(--clr-primary-dark)',
                                }}>
                                    {product.price || 'TBA'}
                                </p>
                            </div>
                        </a>
                    );
                })}
            </div>
        </section>
    );
}
