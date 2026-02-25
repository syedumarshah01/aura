'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function LayoutShell({ children }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            {children}
            <footer>
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h2>Ophélie.</h2>
                        <p>Pure ingredients. Real results. <br />Your journey to luminous skin starts here.</p>
                    </div>
                    <div className="footer-links">
                        <h3>Shop</h3>
                        <a href="#">Skincare</a>
                        <a href="#">Makeup</a>
                        <a href="#">Body &amp; Bath</a>
                        <a href="#">Fragrance</a>
                    </div>
                    <div className="footer-links">
                        <h3>Support</h3>
                        <a href="/faq">FAQ</a>
                        <a href="/shipping">Shipping &amp; Returns</a>
                        <a href="/returns">Start a Return</a>
                        <a href="/track">Track Order</a>
                        <a href="/contact">Contact Us</a>
                    </div>
                    <div className="footer-links">
                        <h3>Connect</h3>
                        <a href="#">Instagram</a>
                        <a href="#">TikTok</a>
                        <a href="#">Facebook</a>
                        <a href="#">Pinterest</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Ophélie Cosmetics. All rights reserved.</p>
                    <div className="legal-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </>
    );
}
