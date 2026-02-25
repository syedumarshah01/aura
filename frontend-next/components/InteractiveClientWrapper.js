'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function InteractiveClientWrapper({ children }) {
    const pathname = usePathname();

    useEffect(() => {
        // Intersection Observer for reveal animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Once visible, we can stop observing this element
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Select all elements with reveal classes
        const revealElements = document.querySelectorAll('.fade-in, .fade-in-up, .reveal-left, .reveal-right');
        revealElements.forEach((el) => observer.observe(el));

        // Navbar scroll effect
        const handleScroll = () => {
            const nav = document.querySelector('.navbar');
            if (nav) {
                if (window.scrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Initial check for scroll position
        handleScroll();

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [pathname]); // Re-run when pathname changes to observe elements on new page

    return <>{children}</>;
}
