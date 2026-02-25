'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

const cleanTitle = (title) =>
    title
        ? title
            .replace(/^(?:Buy|Purchase|Order)\s+/i, '')
            .replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk|Online at Special Price in Pakistan)\s*/gi, '')
            .trim()
        : '';

export default function SearchOverlay({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef(null);

    // Auto-focus the input when overlay opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults([]);
            setHasSearched(false);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // Debounced search logic
    const fetchResults = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }
        setLoading(true);
        setHasSearched(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?keyword=${encodeURIComponent(searchQuery)}&limit=8`
            );
            const data = await res.json();
            // Clean up image URLs
            const products = (data.products || []).map((p) => ({
                ...p,
                images: p.images?.map((img) => img.replace(/\/cache\/[a-zA-Z0-9]+\//, '/')) || [],
            }));
            setResults(products);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect for debouncing
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        const timer = setTimeout(() => {
            fetchResults(query);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [query, fetchResults]);

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
        inputRef.current?.focus();
    };

    const handleResultClick = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(25, 23, 21, 0.4)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 200,
                    animation: 'fadeIn 0.25s ease-out',
                }}
            />

            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 201,
                    backgroundColor: 'rgba(252, 251, 250, 0.98)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    padding: 'clamp(1.5rem, 5vw, 2.5rem) clamp(1rem, 4vw, 1.5rem)',
                    boxShadow: '0 10px 50px rgba(0,0,0,0.1)',
                    animation: 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
            >
                {/* Search Input Row */}
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--clr-border)', paddingBottom: '1rem' }}>
                        {/* Search icon */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--clr-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>

                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={handleChange}
                            placeholder="Type to search our collection..."
                            autoComplete="off"
                            style={{
                                flex: 1,
                                minWidth: 0,
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'clamp(1.1rem, 5vw, 1.5rem)',
                                color: 'var(--clr-text-main)',
                                fontWeight: 300,
                                letterSpacing: '-0.01em',
                                textOverflow: 'ellipsis',
                            }}
                        />

                        {/* Loading spinner */}
                        {loading && (
                            <div style={{ width: '20px', height: '20px', border: '2px solid rgba(0,0,0,0.05)', borderTopColor: 'var(--clr-primary-dark)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                        )}

                        {/* Clear button */}
                        {query && !loading && (
                            <button
                                onClick={handleClear}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)', display: 'flex', padding: '0.25rem', opacity: 0.5, transition: 'opacity 0.2s', flexShrink: 0 }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            aria-label="Close search"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)', display: 'flex', padding: '0.25rem', marginLeft: '0.5rem' }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Results */}
                    {hasSearched && !loading && (
                        <div style={{ marginTop: '2rem' }}>
                            {results.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--clr-text-muted)' }}>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 400, wordBreak: 'break-word', padding: '0 1rem' }}>No results found for &ldquo;{query}&rdquo;</p>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.6 }}>Try searching for another product or category.</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--clr-text-muted)', fontWeight: 600 }}>
                                            Results ({results.length})
                                        </p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', gap: '1.25rem' }}>
                                        {results.map((product) => {
                                            const img = product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                                            const title = cleanTitle(product.title);
                                            const brand = title.split(' ')[0];
                                            const displayTitle = title.split(' - ')[0] || title;

                                            return (
                                                <a
                                                    key={product._id}
                                                    href={`/product/${product._id}`}
                                                    onClick={handleResultClick}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1.25rem',
                                                        padding: '1rem',
                                                        borderRadius: '12px',
                                                        textDecoration: 'none',
                                                        color: 'inherit',
                                                        backgroundColor: '#fff',
                                                        border: '1px solid var(--clr-border)',
                                                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = 'var(--clr-primary-dark)';
                                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = 'var(--clr-border)';
                                                        e.currentTarget.style.transform = 'none';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0, backgroundColor: 'var(--clr-surface)', borderRadius: '8px', overflow: 'hidden' }}>
                                                        <Image src={img} alt={title} fill style={{ objectFit: 'contain', padding: '6px' }} sizes="70px" />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-text-muted)', marginBottom: '0.2rem' }}>
                                                            {product.subcategory || brand}
                                                        </p>
                                                        <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--clr-text-main)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {displayTitle}
                                                        </p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-main)', fontWeight: 600 }}>{product.price || 'TBA'}</span>
                                                            {!product.in_stock && (
                                                                <span style={{ fontSize: '0.6rem', padding: '2px 6px', backgroundColor: '#f0f0f0', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600, color: '#888' }}>Sold Out</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                    <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                                        <a href="/collections" onClick={onClose} style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', textDecoration: 'none', borderBottom: '1px solid currentColor', paddingBottom: '2px', transition: 'color 0.2s' }}>
                                            View all collections
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Hint when nothing typed yet */}
                    {!hasSearched && !loading && (
                        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--clr-text-muted)', fontSize: '1rem', fontWeight: 300 }}>
                                Search for products, brands or categories
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                                {['Skincare', 'Makeup', 'Serum', 'Moisturizer', 'Lux'].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            setQuery(tag);
                                            fetchResults(tag);
                                        }}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            border: '1px solid var(--clr-border)',
                                            background: 'none',
                                            fontSize: '0.8rem',
                                            color: 'var(--clr-text-main)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'var(--clr-primary-dark)';
                                            e.currentTarget.style.backgroundColor = 'var(--clr-surface)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'var(--clr-border)';
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes slideDown {
                    from { transform: translateY(-30px); opacity: 0; }
                    to   { transform: translateY(0);     opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}
