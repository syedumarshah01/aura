'use client';

import { useState } from 'react';
import InteractiveClientWrapper from '../../components/InteractiveClientWrapper';
import Link from 'next/link';

const faqs = [
    {
        category: 'Orders',
        items: [
            { q: 'How do I place an order?', a: 'Simply browse our collections, add your favourite products to your bag, and proceed to checkout. You\'ll need to provide your shipping details and confirm your order — no account required.' },
            { q: 'Can I modify or cancel my order?', a: 'Orders can be cancelled within 1 hour of placement by contacting us via our Contact page. Once processing has begun, we\'re unable to make changes — but you\'re always welcome to return items.' },
            { q: 'How do I track my order?', a: 'Visit our Track Order page and enter your order number (e.g. AUR-XXXXXX). You will see real-time status updates for your shipment.' },
        ]
    },
    {
        category: 'Payments',
        items: [
            { q: 'What payment methods do you accept?', a: 'We currently accept Cash on Delivery (COD) across Pakistan. Online payment integration via JazzCash, Easypaisa, and card is coming soon.' },
            { q: 'Is my payment information secure?', a: 'Absolutely. All data transmissions are encrypted using TLS. We never store raw payment details on our servers.' },
            { q: 'Will I receive an invoice?', a: 'Yes — a digital receipt is automatically emailed to the address provided at checkout immediately after your order is confirmed.' },
        ]
    },
    {
        category: 'Shipping',
        items: [
            { q: 'How long does delivery take?', a: 'Standard delivery within Pakistan takes 3–5 business days. Karachi orders typically arrive within 2 business days.' },
            { q: 'Is shipping free?', a: 'Yes! We offer complimentary standard shipping on all orders across Pakistan — no minimum order required.' },
            { q: 'Do you ship internationally?', a: 'International shipping is coming soon. Join our newsletter to be the first to know when we expand beyond Pakistan.' },
        ]
    },
    {
        category: 'Products',
        items: [
            { q: 'Are your products cruelty-free?', a: 'Every product listed on Aura is never tested on animals. We are committed to cruelty-free, ethical beauty.' },
            { q: 'Are your products authentic?', a: 'Yes — we source all products directly from authorised distributors and brand partners, guaranteeing 100% authenticity.' },
            { q: 'What if I have sensitive skin?', a: 'We recommend checking the full ingredient list on each product page. If in doubt, contact us and our beauty advisors will help you find the perfect match.' },
        ]
    },
    {
        category: 'Returns',
        items: [
            { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery for unused, unopened products in original packaging. Visit our Returns page to submit a return request — no email required.' },
            { q: 'How long do refunds take?', a: 'Approved refunds are processed within 5–7 business days after we receive the returned item.' },
        ]
    }
];

function AccordionItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: '1px solid var(--clr-border)' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%', background: 'none', border: 'none',
                    padding: '1.4rem 0', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', textAlign: 'left', gap: '1rem',
                    fontFamily: 'var(--font-sans)', fontSize: '1rem',
                    fontWeight: 500, color: 'var(--clr-text-main)'
                }}
            >
                <span>{question}</span>
                <span style={{
                    flexShrink: 0, width: '24px', height: '24px',
                    borderRadius: '50%', border: '1px solid var(--clr-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', color: 'var(--clr-primary-dark)',
                    transition: 'transform 0.3s ease',
                    transform: open ? 'rotate(45deg)' : 'rotate(0)',
                }}>+</span>
            </button>
            <div style={{
                maxHeight: open ? '400px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.35s ease',
            }}>
                <p style={{ color: 'var(--clr-text-muted)', lineHeight: 1.8, paddingBottom: '1.4rem', fontSize: '0.95rem' }}>
                    {answer}
                </p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('Orders');

    return (
        <InteractiveClientWrapper>
            <main style={{ paddingTop: '6rem', paddingBottom: '6rem', backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', padding: '0 2rem', marginBottom: '4rem' }}>
                    <span className="eyebrow">Help Centre</span>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.15 }}>
                        Frequently Asked <em>Questions</em>
                    </h1>
                    <p style={{ color: 'var(--clr-text-muted)', marginTop: '1rem', maxWidth: '480px', margin: '1rem auto 0' }}>
                        Can&apos;t find an answer? <Link href="/contact" style={{ color: 'var(--clr-primary-dark)', textDecoration: 'none', fontWeight: 500 }}>Contact us directly</Link>
                    </p>
                </div>

                <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '4rem', alignItems: 'start' }}>

                    {/* Category Sidebar */}
                    <div style={{ position: 'sticky', top: '7rem' }}>
                        {faqs.map(({ category }) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                style={{
                                    display: 'block', width: '100%', textAlign: 'left',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    padding: '0.75rem 1rem', borderRadius: '8px',
                                    fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
                                    fontWeight: activeCategory === category ? 600 : 400,
                                    color: activeCategory === category ? 'var(--clr-primary-dark)' : 'var(--clr-text-muted)',
                                    backgroundColor: activeCategory === category ? 'var(--clr-accent)' : 'transparent',
                                    marginBottom: '0.25rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Questions */}
                    <div className="fade-in-up">
                        {faqs.filter(f => f.category === activeCategory).map(({ category, items }) => (
                            <div key={category}>
                                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1.5rem', color: 'var(--clr-text-main)' }}>
                                    {category}
                                </h2>
                                {items.map(({ q, a }) => (
                                    <AccordionItem key={q} question={q} answer={a} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <Link href="/" className="link-btn">← Back to Home</Link>
                </div>
            </main>
        </InteractiveClientWrapper>
    );
}
