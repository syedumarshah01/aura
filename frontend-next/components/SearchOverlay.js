'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

const cleanTitle = (title) =>
    title
        ? title
            .replace(/^(?:Buy|Purchase|Order)\s+/i, '')
            .replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/gi, '')
            .trim()
        : '';

export default function SearchOverlay({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

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

    // Debounced search — waits 350ms after last keystroke
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
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?keyword=${encodeURIComponent(searchQuery)}&limit=6`
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

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchResults(val), 350);
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
                    backgroundColor: 'rgba(45, 40, 37, 0.55)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    zIndex: 200,
                    animation: 'fadeIn 0.2s ease',
                }}
            />

            {/* Panel */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 201,
                    backgroundColor: 'rgba(252, 250, 248, 0.97)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    padding: '2rem',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                    animation: 'slideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
            >
                {/* Search Input Row */}
                <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '2px solid var(--clr-text-main)', paddingBottom: '0.75rem' }}>
                        {/* Search icon */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--clr-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>

                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={handleChange}
                            placeholder="Search products..."
                            autoComplete="off"
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '1.4rem',
                                color: 'var(--clr-text-main)',
                                fontWeight: 400,
                            }}
                        />

                        {/* Loading spinner */}
                        {loading && (
                            <div style={{ width: '18px', height: '18px', border: '2px solid var(--clr-border)', borderTopColor: 'var(--clr-primary-dark)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                        )}

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            aria-label="Close search"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)', display: 'flex', padding: '0.25rem', transition: 'color 0.2s ease' }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Results */}
                    {hasSearched && !loading && (
                        <div style={{ marginTop: '1.5rem' }}>
                            {results.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--clr-text-muted)' }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }}>
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <p style={{ fontSize: '1rem' }}>No products found for <strong>&ldquo;{query}&rdquo;</strong></p>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.6 }}>Try a different keyword.</p>
                                </div>
                            ) : (
                                <>
                                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-text-muted)', marginBottom: '1rem' }}>
                                        {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                        {results.map((product) => {
                                            const img = product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop';
                                            const title = cleanTitle(product.title);
                                            return (
                                                <a
                                                    key={product._id}
                                                    href={`/product/${product._id}`}
                                                    onClick={handleResultClick}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        padding: '0.75rem',
                                                        borderRadius: '8px',
                                                        textDecoration: 'none',
                                                        color: 'inherit',
                                                        backgroundColor: 'var(--clr-bg)',
                                                        border: '1px solid var(--clr-border)',
                                                        transition: 'all 0.25s ease',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = 'var(--clr-primary)';
                                                        e.currentTarget.style.backgroundColor = 'var(--clr-surface)';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = 'var(--clr-border)';
                                                        e.currentTarget.style.backgroundColor = 'var(--clr-bg)';
                                                        e.currentTarget.style.transform = 'none';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0, backgroundColor: 'var(--clr-surface)', borderRadius: '6px', overflow: 'hidden' }}>
                                                        <Image src={img} alt={title} fill style={{ objectFit: 'contain', padding: '4px' }} sizes="52px" />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--clr-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {title.split(' - ')[0] || title}
                                                        </p>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--clr-primary-dark)', marginTop: '0.2rem', fontWeight: 500 }}>
                                                            {product.price || 'TBA'}
                                                        </p>
                                                        {!product.in_stock && (
                                                            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#999' }}>Out of stock</span>
                                                        )}
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Hint when nothing typed yet */}
                    {!hasSearched && !loading && (
                        <p style={{ marginTop: '1.5rem', color: 'var(--clr-text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                            Start typing to search across all products...
                        </p>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to   { transform: translateY(0);     opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
            `}</style>
        </>
    );
}
