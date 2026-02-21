'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);

    // Load from local storage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem('aura_cart');
        if (storedCart) {
            try {
                setCartItems(JSON.parse(storedCart));
            } catch (e) {
                console.error("Could not parse cart from local storage.");
            }
        }
    }, []);

    // Save to local storage on cart change
    useEffect(() => {
        localStorage.setItem('aura_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item._id === product._id);
            if (existingItem) {
                return prev.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity }];
        });

        // Clean title for the toast message
        const cleanTitle = product.title ? product.title.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '').trim() : 'Item';
        const displayTitle = cleanTitle.split(' - ')[0] || cleanTitle;

        showToast(`Added ${displayTitle} to your bag.`);
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item._id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prev =>
            prev.map(item =>
                item._id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    const cartTotal = cartItems.reduce((total, item) => {
        // Safe price extraction handling 'Rs.', commas, etc.
        const cleanPrice = String(item.price).replace(/,/g, '');
        const match = cleanPrice.match(/\d+(\.\d+)?/);
        const priceNum = match ? parseFloat(match[0]) : 0;
        return total + (priceNum * item.quantity);
    }, 0);

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            cartCount,
            cartTotal,
            toastMessage
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
