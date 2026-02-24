'use client';

import { useState, useEffect } from 'react';
import InfiniteProductsGrid from '../../components/InfiniteProductsGrid';
import InteractiveClientWrapper from '../../components/InteractiveClientWrapper';


export default function CollectionsPage() {
    const [activeCategory, setActiveCategory] = useState('');
    const [hoveredCat, setHoveredCat] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loadingCats, setLoadingCats] = useState(true);

    // Fetch real categories from the database
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/categories`
                );
                const data = await res.json();
                setCategories(data);
            } catch (e) {
                console.error('Failed to fetch categories:', e);
            } finally {
                setLoadingCats(false);
            }
        }
        fetchCategories();
    }, []);

    return (
        <InteractiveClientWrapper>
            <main style={{ backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>

                {/* ── Hero ──────────────────────────────────────── */}
                <section style={{ padding: '7rem 2rem 3rem', textAlign: 'center' }}>
                    <span className="fade-in" style={{
                        display: 'block',
                        marginBottom: '1rem',
                        color: 'var(--clr-primary-dark)',
                        letterSpacing: '3px',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                    }}>
                        The Full Catalog
                    </span>
                    <h1 className="fade-in-up" style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(2.8rem, 6vw, 5rem)',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em',
                        animationDelay: '0.1s',
                    }}>
                        Our <em>Collections</em>
                    </h1>
                    <p className="fade-in-up" style={{
                        animationDelay: '0.25s',
                        maxWidth: '520px',
                        margin: '1.5rem auto 0',
                        color: 'var(--clr-text-muted)',
                        fontSize: '1.05rem',
                        lineHeight: 1.7,
                    }}>
                        Discover every premium product meticulously curated for your daily ritual.
                    </p>
                </section>

                {/* ── Category Grid ─────────────────────────────── */}
                <section style={{ padding: '0 5% 4rem', maxWidth: '1280px', margin: '0 auto' }}>

                    {loadingCats ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0' }}>
                            <div className="spinner" />
                        </div>
                    ) : (
                        <>
                            {/* Horizontally scrollable pill strip */}
                            <div style={{ position: 'relative' }}>
                                {/* Fade-out hint on the right */}
                                <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '60px',
                                    background: 'linear-gradient(to right, transparent, var(--clr-bg))',
                                    pointerEvents: 'none',
                                    zIndex: 1,
                                }} />

                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    overflowX: 'auto',
                                    paddingBottom: '0.5rem',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch',
                                    paddingRight: '60px',
                                }}>
                                    {[{ id: '', label: 'All' }, ...categories.map(c => ({ id: c, label: c }))].map((cat) => {
                                        const isActive = activeCategory === cat.id;
                                        return (
                                            <button
                                                key={cat.id || '__all'}
                                                onClick={() => setActiveCategory(cat.id)}
                                                onMouseEnter={() => setHoveredCat(cat.id)}
                                                onMouseLeave={() => setHoveredCat(null)}
                                                style={{
                                                    flexShrink: 0,
                                                    padding: '0.55rem 1.3rem',
                                                    borderRadius: '999px',
                                                    border: isActive
                                                        ? '1.5px solid var(--clr-text-main)'
                                                        : '1.5px solid var(--clr-border)',
                                                    background: isActive
                                                        ? 'var(--clr-text-main)'
                                                        : 'transparent',
                                                    color: isActive
                                                        ? 'var(--clr-surface)'
                                                        : hoveredCat === cat.id
                                                            ? 'var(--clr-text-main)'
                                                            : 'var(--clr-text-muted)',
                                                    cursor: 'pointer',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '0.85rem',
                                                    fontWeight: isActive ? 600 : 400,
                                                    letterSpacing: '0.02em',
                                                    transition: 'all 0.2s ease',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{
                                marginTop: '1.5rem',
                                paddingBottom: '1.5rem',
                                borderBottom: '1px solid var(--clr-border)',
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '1rem',
                                flexWrap: 'wrap',
                            }}>
                                <h2 style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                                    fontStyle: 'italic',
                                    color: 'var(--clr-text-main)',
                                    margin: 0,
                                }}>
                                    {activeCategory || 'All Products'}
                                </h2>
                                <span style={{
                                    fontSize: '0.78rem',
                                    color: 'var(--clr-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                }}>
                                    {activeCategory ? `Browsing ${activeCategory}` : 'All categories'}
                                </span>
                            </div>
                        </>
                    )}
                </section>

                {/* ── Products Grid ─────────────────────────────── */}
                <div style={{ backgroundColor: 'var(--clr-surface)' }}>
                    <InfiniteProductsGrid category={activeCategory} />
                </div>

            </main>
        </InteractiveClientWrapper>
    );
}
