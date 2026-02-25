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
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ophelie.com'),
    title: 'Ophélie | Premium Beauty & Cosmetics',
    description: 'Discover premium beauty and skincare products tailored for your glow. Ethical, clean, and meticulously curated.',
    keywords: ['beauty', 'cosmetics', 'skincare', 'makeup', 'ethical', 'clean beauty', 'Ophélie'],
    alternates: {
        canonical: '/',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'Ophélie | Premium Beauty & Cosmetics',
        description: 'Elevate your daily ritual with our curated collection of clean, effective, and ethically sourced beauty essentials.',
        url: '/',
        siteName: 'Ophélie',
        locale: 'en_US',
        type: 'website',
    },
};

// Organization JSON-LD Schema
export default function RootLayout({ children }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BeautySalon', // or HealthAndBeautyBusiness / Organization
        name: 'Ophélie',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ophelie.com',
        logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ophelie.com'}/logo.png`,
        description: 'Discover premium beauty and skincare products tailored for your glow.',
        sameAs: [
            'https://instagram.com/ophelie',
            'https://facebook.com/ophelie'
        ]
    };

    return (
        <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
            <body>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
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

