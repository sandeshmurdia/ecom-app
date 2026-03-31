import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import attemptTracker from '../utils/attemptTracker';

const Cart = () => {
  const navigate = useNavigate();
  
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    isCartEmpty,
    clearCart,
  } = useCart();
  const { showError } = useSnackbar();

  // Handle quantity change with proper validation
  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (newQuantity >= 1) {
        await updateQuantity(productId, newQuantity);
      } else if (newQuantity <= 0) {
        await removeFromCart(productId);
      }
    } catch (error) {
      console.error('Quantity change failed:', error);
      // Error is already handled by CartContext
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Remove item failed:', error);
      // Error is already handled by CartContext
    }
  };

  // Handle checkout - implements fail/success pattern
  const handleCheckout = async () => {
    // Check if fail mode is enabled from navbar checkbox
    const failModeEnabled = attemptTracker.getFailMode();
    console.log('failModeEnabled ssin cart', failModeEnabled);

    console.log('failModeEnabledddd', failModeEnabled);
    // Generate error based on checkbox flag in navbar
    if (failModeEnabled) {
      const errorMessage = `Failed to navigate to checkout. Please try again.`;
      showError(errorMessage);
      // Make the API call that will fail (looks like a real network failure)
      await fetch('/api/navigation/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      // Trigger a genuine ReferenceError (undeclared variable)
      try {
        // Using eval to avoid static analysis/no-undef while producing a real ReferenceError at runtime
        eval('checkoutNavigationState + 1');
      } catch (error) {
        window.zipy?.logException?.(error);
        console.error(error);
        showError(errorMessage);
        return;
      }
    }
    
    // Success - navigate to checkout (only reaches here if fail mode is disabled)
    navigate('/checkout');
  };

  // Handle continue shopping - implements fail/success pattern
  const handleContinueShopping = async () => {
    // Check if fail mode is enabled from navbar checkbox
    const failModeEnabled = attemptTracker.getFailMode();
    
    // Generate error based on checkbox flag in navbar
    if (failModeEnabled) {
      // Make the API call that will fail (looks like a real network failure)
      // Then generate genuine runtime JS errors locally (TypeError etc.), similar to earlier snippet
      // await fetch('/api/navigation/products/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' }
      // });

      try {
        const processOrder = (orderData) => {
          const { customer, items, shipping } = orderData;
          const customerName = customer.totalproductsss; // intentional TypeError when customer is null
          const totalItems = items.length;
          const shippingAddress = shipping.address;
          return {
            customer: customerName,
            itemCount: totalItems,
            address: shippingAddress
          };
        };

        const orderData = {
          customer: null, // This will cause the TypeError
          items: [{ id: 1, name: 'Product A' }],
          shipping: { address: '123 Main St' }
        };

        const summary = processOrder(orderData);
        console.log('Order summary:', summary);
      } catch (error) {
        window.zipy?.logException?.(error);
        // window.Sentry.captureException(error);
        console.error(error);
        const errorMessage = `Failed to load products. Please try again.`;
        showError(errorMessage);
        return;
      }
    }
    
    // Success - navigate to products (only reaches here if fail mode is disabled)
    navigate('/products');
  };

  // Calculate subtotal
  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? 5.99 : 0; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Empty cart component
  const EmptyCart = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <CartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
        Your cart is empty
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Looks like you haven't added any items to your cart yet.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={async () => {
          try {
            await handleContinueShopping();
          } catch (error) {
            // Surface a proper JS error to console for debugging and observability
            console.error('Continue shopping failed:', error);
          }
        }}
        startIcon={<ArrowBackIcon />}
        sx={{ textTransform: 'none' }}
      >
        Continue Shopping
      </Button>
    </Box>
  );

  // Cart item component
  const CartItem = ({ item }) => (
    <Card 
      sx={{ 
        mb: 2,
        cursor: 'default', // Make card non-clickable
        // Remove hover effects that interfere with buttons
        '&:hover': {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)', // Minimal hover effect
        },
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Product Image */}
          <Grid item xs={3} sm={2}>
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: '100%',
                height: '80px',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </Grid>

          {/* Product Details */}
          <Grid item xs={9} sm={4}>
            <Typography variant="h6" component="h3" noWrap>
              {item.title}
            </Typography>
            <Chip
              label={item.category}
              size="small"
              sx={{ mt: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ${item.price} each
            </Typography>
          </Grid>

          {/* Quantity Controls */}
          <Grid item xs={6} sm={3}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                position: 'relative',
                zIndex: 10, // Ensure buttons are above other elements
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuantityChange(item.id, item.quantity - 1);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                disabled={item.quantity <= 1}
                size="small"
                sx={{
                  border: '2px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  position: 'relative',
                  zIndex: 20,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <TextField
                value={item.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1) {
                    handleQuantityChange(item.id, value);
                  }
                }}
                onBlur={(e) => {
                  const value = parseInt(e.target.value);
                  if (isNaN(value) || value < 1) {
                    handleQuantityChange(item.id, 1);
                  }
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                size="small"
                sx={{ 
                  width: 60,
                  position: 'relative',
                  zIndex: 15,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    border: '2px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '6px',
                    '&:hover': {
                      borderColor: 'rgba(0, 0, 0, 0.4)',
                    },
                    '&.Mui-focused': {
                      borderColor: '#1a1a1a',
                      borderWidth: '2px',
                    },
                  },
                }}
                inputProps={{ 
                  min: 1, 
                  style: { textAlign: 'center' },
                  'aria-label': 'quantity'
                }}
              />
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuantityChange(item.id, item.quantity + 1);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                size="small"
                sx={{
                  border: '2px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  position: 'relative',
                  zIndex: 20,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    borderColor: 'rgba(0, 0, 0, 0.4)',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Item Total */}
          <Grid item xs={4} sm={2}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              ${(item.price * item.quantity).toFixed(2)}
            </Typography>
          </Grid>

          {/* Remove Button */}
          <Grid item xs={2} sm={1}>
            <Box
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
                            <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveItem(item.id);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                size="small"
                sx={{
                  color: '#f44336',
                  border: '2px solid rgba(244, 67, 54, 0.3)',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  position: 'relative',
                  zIndex: 20,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    borderColor: 'rgba(244, 67, 54, 0.5)',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Order summary component
  const OrderSummary = () => (
    <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Order Summary
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Subtotal ({cartItems.length} items)
          </Typography>
          <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Shipping
          </Typography>
          <Typography variant="body2">
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Tax
          </Typography>
          <Typography variant="body2">${tax.toFixed(2)}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Total
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="primary">
            ${total.toFixed(2)}
          </Typography>
        </Box>

        {shipping > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Add ${(50 - subtotal).toFixed(2)} more for free shipping!
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={async () => {
            try {
              await handleCheckout();
            } catch (error) {
              console.error('Checkout navigation failed:', error);
              // Error is already handled by handleCheckout
            }
          }}
          disabled={isCartEmpty()}
          sx={{ mb: 2, textTransform: 'none', py: 1.5 }}
        >
          Proceed to Checkout
        </Button>

        <Button
          variant="outlined"
          fullWidth
          onClick={async () => {
            try {
              await handleContinueShopping();
            } catch (error) {
              console.error('Continue shopping navigation failed:', error);
              // Error is already handled by handleContinueShopping
            }
          }}
          sx={{ textTransform: 'none' }}
        >
          Continue Shopping
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Shopping Cart
        </Typography>
        {!isCartEmpty() && (
          <Button
            variant="outlined"
            color="error"
            onClick={async () => {
              try {
                await clearCart();
              } catch (error) {
                console.error('Clear cart failed:', error);
                // Error is already handled by CartContext
              }
            }}
            sx={{ textTransform: 'none' }}
          >
            Clear Cart
          </Button>
        )}
      </Box>

      {isCartEmpty() ? (
        <EmptyCart />
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} lg={8}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Cart Items ({cartItems.length})
            </Typography>
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} lg={4}>
            <OrderSummary />
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Cart;
