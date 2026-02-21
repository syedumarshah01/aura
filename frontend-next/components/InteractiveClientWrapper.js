'use client';

import { useEffect, useState } from 'react';

export default function InteractiveClientWrapper({ children }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Navbar background
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            // Reveal elements
            const revealElements = document.querySelectorAll('.fade-in, .fade-in-up, .reveal-left, .reveal-right');
            revealElements.forEach(el => {
                const elementTop = el.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;

                if (elementTop < windowHeight * 0.85) {
                    el.classList.add('visible');
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Trigger once on load

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Apply scrolled class to navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (isScrolled) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }, [isScrolled]);

    // Newsletter Form Handler
    useEffect(() => {
        const form = document.getElementById('subscribe-form');
        if (form) {
            const handler = (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button');
                const originalText = btn.textContent;
                btn.textContent = 'Subscribed!';
                setTimeout(() => {
                    btn.textContent = originalText;
                    e.target.reset();
                }, 3000);
            };
            form.addEventListener('submit', handler);
            return () => form.removeEventListener('submit', handler);
        }
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .mobile-menu {
                    transform: ${isMenuOpen ? 'translateY(0)' : 'translateY(-100%)'};
                }
                .hamburger span:nth-child(1) {
                    transform: ${isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'};
                }
                .hamburger span:nth-child(2) {
                    opacity: ${isMenuOpen ? '0' : '1'};
                }
                .hamburger span:nth-child(3) {
                    transform: ${isMenuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none'};
                }
            ` }} />

            {/* This invisible overlay captures clicks intended for the hamburger from the server layout */}
            <div
                id="hamburger-click-capture"
                onClick={toggleMenu}
                style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', width: '30px', height: '30px', zIndex: 102, cursor: 'pointer', opacity: 0 }}
            />

            {/* Mobile Menu Content (matches HTML structure from Layout but dynamic) */}
            <div className="mobile-menu">
                <a href="/" onClick={toggleMenu}>Home</a>
                <a href="/collections" onClick={toggleMenu}>Collections</a>
                <a href="/#about" onClick={toggleMenu}>Our Story</a>
                <a href="/#featured" onClick={toggleMenu}>Featured</a>
            </div>

            {children}
        </>
    );
}
