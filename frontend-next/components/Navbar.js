'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SearchOverlay from './SearchOverlay';

export default function Navbar() {
    const { cartCount } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Prevent body scroll when mobile menu or search is open
    useEffect(() => {
        document.body.style.overflow = (menuOpen || isSearchOpen) ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen, isSearchOpen]);

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link href="/" className="logo" onClick={closeMenu}>Aura.</Link>

                {/* Desktop links */}
                <div className="nav-links">
                    <Link href="/">Home</Link>
                    <Link href="/collections">Collections</Link>
                    <Link href="/#about">Our Story</Link>
                    <Link href="/#featured">Featured</Link>
                </div>

                <div className="nav-icons">
                    <button
                        className="icon-btn"
                        aria-label="Search"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </button>

                    <Link href="/cart" className="icon-btn" aria-label="Cart" onClick={closeMenu} style={{ position: 'relative', display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute', top: '-6px', right: '-10px',
                                backgroundColor: 'var(--clr-primary-dark)', color: '#fff',
                                fontSize: '0.65rem', fontWeight: 'bold', borderRadius: '50%',
                                minWidth: '18px', height: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0 4px', fontFamily: 'var(--font-sans)'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Hamburger */}
                    <button
                        className={`hamburger${menuOpen ? ' open' : ''}`}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(o => !o)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* Mobile full-screen menu */}
            <div className={`mobile-menu${menuOpen ? ' active' : ''}`} aria-hidden={!menuOpen}>
                <Link href="/" onClick={closeMenu}>Home</Link>
                <Link href="/collections" onClick={closeMenu}>Collections</Link>
                <Link href="/#about" onClick={closeMenu}>Our Story</Link>
                <Link href="/#featured" onClick={closeMenu}>Featured</Link>
                <Link href="/track" onClick={closeMenu} style={{ fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '1rem' }}>Track Order</Link>
                <Link href="/returns" onClick={closeMenu} style={{ fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Returns</Link>
                <Link href="/contact" onClick={closeMenu} style={{ fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Contact</Link>
            </div>

            {/* Search Overlay */}
            <SearchOverlay
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </nav>
    );
}
