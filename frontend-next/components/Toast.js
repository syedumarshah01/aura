'use client';

import { useCart } from '../context/CartContext';

export default function Toast() {
    const { toastMessage } = useCart();

    if (!toastMessage) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: 'var(--clr-text-main)',
            color: 'var(--clr-surface)',
            padding: '1rem 2rem',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem',
            fontWeight: 500
        }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--clr-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {toastMessage}

            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
