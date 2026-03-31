import React, { createContext, useContext, useState, useEffect } from 'react';
import attemptTracker from '../utils/attemptTracker';
import { useSnackbar } from './SnackbarContext';

// Create cart context for managing shopping cart state
const CartContext = createContext();

// Custom hook to use cart context
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, _SET_LOADING] = useState(false); // setter intentionally unused
  const { showSuccess, showError } = useSnackbar();

  // Load cart from localStorage on app initialization
  useEffect(() => {
    const savedCart = localStorage.getItem('ecommerce_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing saved cart data:', error);
        localStorage.removeItem('ecommerce_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ecommerce_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const isValidProductForCart = (product) => {
    // Reason: runtime errors from missing product properties should not bubble as unhandled promise
    // rejections from UI event handlers. We validate early and fail gracefully with user feedback.
    return Boolean(product && (product.id ?? product.id === 0) && product.title && product.price !== undefined);
  };

  // Add item to cart with quantity management - implements fail/success pattern
  const addToCart = async (product, quantity = 1) => {
    if (!isValidProductForCart(product)) {
      showError('Unable to add item to cart. Please refresh and try again.');
      console.warn('[CartContext] addToCart called with invalid product', { product });
      return false;
    }

    const normalizedQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 1;
    if (normalizedQuantity <= 0) {
      showError('Quantity must be at least 1.');
      console.warn('[CartContext] addToCart called with invalid quantity', { quantity, productId: product.id });
      return false;
    }

    // Check if fail mode is enabled from navbar checkbox
    const failModeEnabled = attemptTracker.getFailMode();
    
    // Generate error based on checkbox flag in navbar
    if (failModeEnabled) {
      const errorMessage = `Failed to add ${product.title} to cart. Please try again.`;
      showError(errorMessage);
      try {
        await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity: normalizedQuantity }),
        });
        // Intentional runtime error for test mode, but DO NOT allow it to escape and become an
        // unhandled promise rejection (seen in production from UI callers not awaiting addToCart).
        eval('requestedAdditionalItem + 1');
      } catch (error) {
        window.zipy?.logException?.(error);
        console.error('[CartContext] addToCart fail-mode error (suppressed):', error);
      }
      return false;
    }
    
    // Success - add item to cart (only reaches here if fail mode is disabled)
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + normalizedQuantity }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...product, quantity: normalizedQuantity }];
      }
    });
    
    // Show success message only if we reach here (fail mode is disabled)
    showSuccess(`${product.title} added to cart successfully!`);
    return true; // Indicate success
  };

  // Remove item from cart completely - implements fail/success pattern
  const removeFromCart = async (productId) => {
    // Check if fail mode is enabled from navbar checkbox
    const failModeEnabled = attemptTracker.getFailMode();
    
    // Generate error based on checkbox flag in navbar
    if (failModeEnabled) {
      const errorMessage = `Failed to remove item from cart. Please try again.`;
      showError(errorMessage);
      await fetch(`/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      // Trigger a genuine RangeError
      new Array(-1);
    }
    
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== productId);
      return newItems;
    });
    
    // Show success message only if we reach here (fail mode is disabled)
    showSuccess(`Item removed from cart successfully!`);
  };

  // Update item quantity - implements fail/success pattern
  const updateQuantity = async (productId, quantity) => {
    // Check if fail mode is enabled from navbar checkbox
    const failModeEnabled = attemptTracker.getFailMode();
    
    // Generate error based on checkbox flag in navbar
    if (failModeEnabled) {
      const errorMessage = `Failed to update quantity. Please try again.`;
      showError(errorMessage);
      await fetch(`/api/cart/update/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      // Trigger a genuine AbortError using DOMException
      throw new DOMException('The operation was aborted.', 'AbortError');
    }
    
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      return newItems;
    });
  };

  // Clear entire cart - implements fail/success pattern
  const clearCart = async () => {
    // Check if fail mode is enabled from navbar checkbox
    const failModeEnabled = attemptTracker.getFailMode();
    
    // Generate error based on checkbox flag in navbar
    if (failModeEnabled) {
      const errorMessage = `Failed to clear cart. Please try again.`;
      showError(errorMessage);
      await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      // Trigger a genuine SecurityError DOMException
      throw new DOMException('Cross-origin access violation', 'SecurityError');
    }
    
    // Success - clear cart (only reaches here if fail mode is disabled)
    setCartItems([]);
    
    // Show success message only if we reach here (fail mode is disabled)
    showSuccess(`Cart cleared successfully!`);
  };

  // Calculate cart totals
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Get total number of items in cart
  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Check if cart is empty
  const isCartEmpty = () => {
    return cartItems.length === 0;
  };

  // Get cart item by ID
  const getCartItem = (productId) => {
    return cartItems.find(item => item.id === productId);
  };

  // Context value object
  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isCartEmpty,
    getCartItem,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
