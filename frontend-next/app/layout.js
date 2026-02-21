import './globals.css';
import { Outfit, Playfair_Display } from 'next/font/google';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

// Font configuration
const outfit = Outfit({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    variable: '--font-sans',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '600'],
    style: ['normal', 'italic'],
    variable: '--font-serif',
});

export const metadata = {
    title: 'Aura | Premium Beauty & Cosmetics',
    description: 'Discover premium beauty and skincare products tailored for your glow.',
    keywords: ['beauty', 'cosmetics', 'skincare', 'makeup', 'ethical', 'clean beauty'],
    openGraph: {
        title: 'Aura | Premium Beauty & Cosmetics',
        description: 'Elevate your daily ritual with our curated collection of clean, effective, and ethically sourced beauty essentials.',
        type: 'website',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
            <body>
                <CartProvider>
                    <Navbar />

                    {children}

                    <Toast />


                    <footer>
                        <div className="footer-grid">
                            <div className="footer-brand">
                                <h2>Aura.</h2>
                                <p>Pure ingredients. Real results. <br />Your journey to luminous skin starts here.</p>
                            </div>
                            <div className="footer-links">
                                <h3>Shop</h3>
                                <a href="#">Skincare</a>
                                <a href="#">Makeup</a>
                                <a href="#">Body & Bath</a>
                                <a href="#">Fragrance</a>
                            </div>
                            <div className="footer-links">
                                <h3>Support</h3>
                                <a href="#">FAQ</a>
                                <a href="#">Shipping & Returns</a>
                                <a href="#">Track Order</a>
                                <a href="#">Contact Us</a>
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
                            <p>&copy; 2026 Aura Cosmetics. All rights reserved.</p>
                            <div className="legal-links">
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Service</a>
                            </div>
                        </div>
                    </footer>
                </CartProvider>
            </body>
        </html>
    );
}
