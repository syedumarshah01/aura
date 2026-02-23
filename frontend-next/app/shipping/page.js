'use client';

import InteractiveClientWrapper from '../../components/InteractiveClientWrapper';
import Link from 'next/link';

const sections = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
        ),
        title: 'Standard Shipping',
        content: [
            { label: 'Delivery Time', value: '3–5 business days' },
            { label: 'Coverage', value: 'All cities across Pakistan' },
            { label: 'Cost', value: 'Complimentary on all orders' },
            { label: 'Cut-off', value: 'Orders placed before 2pm are dispatched same day' },
        ]
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
        title: 'Express Shipping',
        content: [
            { label: 'Delivery Time', value: '1–2 business days (Karachi only)' },
            { label: 'Cost', value: 'PKR 150 flat fee' },
            { label: 'Available', value: 'Mon–Sat' },
            { label: 'Cut-off', value: 'Orders before 12pm for same-day dispatch' },
        ]
    },
];

function InfoCard({ icon, title, content }) {
    return (
        <div style={{
            backgroundColor: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: '16px',
            padding: '2rem',
        }}>
            <div style={{
                width: '52px', height: '52px', borderRadius: '12px',
                backgroundColor: 'var(--clr-accent)',
                color: 'var(--clr-primary-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem'
            }}>{icon}</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--clr-text-main)' }}>{title}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                {content.map(({ label, value }) => (
                    <tr key={label} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                        <td style={{ padding: '0.75rem 0', fontSize: '0.85rem', color: 'var(--clr-text-muted)', width: '40%' }}>{label}</td>
                        <td style={{ padding: '0.75rem 0', fontSize: '0.9rem', fontWeight: 500, color: 'var(--clr-text-main)' }}>{value}</td>
                    </tr>
                ))}
            </table>
        </div>
    );
}

export default function ShippingPage() {
    return (
        <InteractiveClientWrapper>
            <main style={{ paddingTop: '6rem', paddingBottom: '6rem', backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', padding: '0 2rem', marginBottom: '5rem' }}>
                    <span className="eyebrow">Policies</span>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.15 }}>
                        Shipping <em>&amp;</em> Returns
                    </h1>
                    <p style={{ color: 'var(--clr-text-muted)', marginTop: '1rem', maxWidth: '480px', margin: '1rem auto 0' }}>
                        Complimentary delivery across Pakistan. Hassle-free returns within 30 days.
                    </p>
                </div>

                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>

                    {/* Shipping Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '5rem' }}>
                        {sections.map(s => <InfoCard key={s.title} {...s} />)}
                    </div>

                    {/* Returns Section */}
                    <div style={{ backgroundColor: 'var(--clr-surface)', borderRadius: '20px', padding: '3rem', border: '1px solid var(--clr-border)', marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: 'var(--clr-accent)', color: 'var(--clr-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                                </svg>
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Return Policy</h2>
                                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>30-day hassle-free returns on all eligible items.</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            {[
                                { step: '01', title: 'Submit a Request', desc: 'Visit our dedicated Returns page and fill in the form with your order number, item details, and reason for return.' },
                                { step: '02', title: 'Drop Off', desc: 'We\'ll follow up within 2 business days with a return label. Drop the sealed, unopened item at any TCS or Leopards location.' },
                                { step: '03', title: 'Refund', desc: 'Once we receive and inspect the item, your refund is processed within 5–7 business days.' },
                            ].map(({ step, title, desc }) => (
                                <div key={step}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--clr-primary-dark)', fontFamily: 'var(--font-sans)' }}>{step}</span>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--clr-text-main)' }}>{title}</h4>
                                    <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Non-returnable note */}
                    <div style={{ backgroundColor: 'var(--clr-accent)', borderRadius: '12px', padding: '1.5rem 2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--clr-primary-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p style={{ color: 'var(--clr-primary-dark)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                            <strong>Non-returnable items:</strong> Opened cosmetics, fragrances, nail polish, and any personalised products cannot be returned for hygiene reasons.
                        </p>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <Link href="/" className="link-btn">← Back to Home</Link>
                </div>
            </main>
        </InteractiveClientWrapper>
    );
}
