'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function CheckoutModal({ isOpen, onClose }) {
    const { cartTotal, clearCart } = useCart();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: 'Karachi'
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate network request for payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setStep(2); // Move to Success State
        clearCart();
    };

    return (
        <div className="modal-backdrop fade-in" onClick={handleBackdropClick} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(5, 5, 5, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="checkout-modal slide-up" style={{
                backgroundColor: 'var(--clr-surface)',
                width: '100%', maxWidth: '600px',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Header */}
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', color: 'var(--clr-text-main)', margin: 0 }}>
                        {step === 1 ? 'Secure Checkout' : 'Order Confirmed'}
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: 'var(--clr-text-muted)',
                        cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '2rem' }}>
                    {step === 1 ? (
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div className="form-group">
                                    <label htmlFor="firstName" className="checkout-label">First Name</label>
                                    <input required type="text" id="firstName" name="firstName" className="checkout-input" value={formData.firstName} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName" className="checkout-label">Last Name</label>
                                    <input required type="text" id="lastName" name="lastName" className="checkout-input" value={formData.lastName} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="email" className="checkout-label">Email Address</label>
                                <input required type="email" id="email" name="email" className="checkout-input" value={formData.email} onChange={handleChange} />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="phone" className="checkout-label">Phone Number</label>
                                <input required type="tel" id="phone" name="phone" className="checkout-input" value={formData.phone} onChange={handleChange} />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="address" className="checkout-label">Shipping Address</label>
                                <input required type="text" id="address" name="address" className="checkout-input" value={formData.address} onChange={handleChange} />
                            </div>

                            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                                <label htmlFor="city" className="checkout-label">City</label>
                                <select required id="city" name="city" className="checkout-input" value={formData.city} onChange={handleChange}>
                                    <option value="Karachi">Karachi</option>
                                    <option value="Lahore">Lahore</option>
                                    <option value="Islamabad">Islamabad</option>
                                    <option value="Rawalpindi">Rawalpindi</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--clr-border)', paddingTop: '2rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', display: 'block' }}>Total to pay</span>
                                    <strong style={{ fontSize: '1.5rem', color: 'var(--clr-text-main)' }}>PKR {cartTotal.toLocaleString()}</strong>
                                </div>
                                <button type="submit" className="primary-btn checkout-submit-btn" disabled={isSubmitting} style={{
                                    minWidth: '200px', display: 'flex', justifyContent: 'center', padding: '1.2rem',
                                    opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                }}>
                                    {isSubmitting ? <span className="loader"></span> : 'Place Order'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="success-state fade-in" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                            <div style={{
                                width: '80px', height: '80px', backgroundColor: 'var(--clr-primary)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 2rem', color: 'white'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <h3 style={{ fontSize: '1.8rem', color: 'var(--clr-text-main)', marginBottom: '1rem' }}>Thank you, {formData.firstName}!</h3>
                            <p style={{ color: 'var(--clr-text-muted)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                                Your luxury order has been successfully placed. We will send a confirmation email to <strong>{formData.email}</strong> shortly with your tracking details.
                            </p>
                            <button onClick={onClose} className="secondary-btn" style={{ width: '100%', maxWidth: '300px' }}>
                                Continue Shopping
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
