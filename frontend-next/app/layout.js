import './globals.css';
import { Outfit, Playfair_Display } from 'next/font/google';
import { CartProvider } from '../context/CartContext';
import Toast from '../components/Toast';
import LayoutShell from '../components/LayoutShell';

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
    title: 'Ophélie | Premium Beauty & Cosmetics',
    description: 'Discover premium beauty and skincare products tailored for your glow.',
    keywords: ['beauty', 'cosmetics', 'skincare', 'makeup', 'ethical', 'clean beauty'],
    openGraph: {
        title: 'Ophélie | Premium Beauty & Cosmetics',
        description: 'Elevate your daily ritual with our curated collection of clean, effective, and ethically sourced beauty essentials.',
        type: 'website',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
            <body>
                <CartProvider>
                    <LayoutShell>
                        {children}
                    </LayoutShell>
                    <Toast />
                </CartProvider>
            </body>
        </html>
    );
}

