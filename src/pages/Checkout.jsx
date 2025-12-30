import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { paymentAPI } from '../services/api';
import ShippingForm from '../components/ShippingForm';
import PaymentForm from '../components/PaymentForm';
import attemptTracker from '../utils/attemptTracker';
import { useSnackbar } from '../contexts/SnackbarContext';

const steps = ['Shipping Information', 'Payment Details', 'Review & Confirm'];

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { showSuccess, showError } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingErrors, setShippingErrors] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  // Form data state
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  // Calculate totals
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Handle shipping form changes - updated for new component
  const handleShippingChange = useCallback((field, value) => {
    
    // Use functional update to ensure state consistency
    setShippingData(prev => {
      const newData = { ...prev, [field]: value };
      return newData;
    });
  }, []);

  // Handle payment form changes - updated for new component
  const handlePaymentChange = useCallback((field, value) => {
    
    setPaymentData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Validate shipping form - enhanced with detailed error tracking
  const validateShipping = () => {
    const errors = {};
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    
    for (const field of required) {
      if (!shippingData[field] || !shippingData[field].trim()) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        errors[field] = `Please fill in your ${fieldName}`;
      }
    }
    
    if (shippingData.email && !/\S+@\S+\.\S+/.test(shippingData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (shippingData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(shippingData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setShippingErrors(errors);
    setShowValidation(true);
    
    return Object.keys(errors).length === 0;
  };

  // Validate payment form - enhanced with detailed error tracking
  const validatePayment = () => {
    const errors = {};
    const required = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'];
    
    for (const field of required) {
      if (!paymentData[field] || !paymentData[field].trim()) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        errors[field] = `Please fill in your ${fieldName}`;
      }
    }
    
    if (paymentData.cardNumber && paymentData.cardNumber.replace(/\s/g, '').length < 13) {
      errors.cardNumber = 'Please enter a valid card number';
    }
    
    if (paymentData.cvv && paymentData.cvv.length < 3) {
      errors.cvv = 'Please enter a valid CVV';
    }
    
    if (paymentData.expiryDate && !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    
    setPaymentErrors(errors);
    setShowValidation(true);
    
    return Object.keys(errors).length === 0;
  };

  // Handle next step - simplified
  const handleNext = () => {
    setError('');
    
    if (activeStep === 0 && !validateShipping()) return;
    if (activeStep === 1 && !validatePayment()) return;
    
    if (activeStep === steps.length - 1) {
      handlePlaceOrder();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  // Handle back step - simplified
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  // Handle place order - updated to use navbar checkbox flag for error generation
  // This function now checks the "Test Mode" checkbox in the navbar to determine
  // whether to generate errors for testing purposes
  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if fail mode is enabled from navbar checkbox
      // This allows developers to toggle error generation for testing
      const failModeEnabled = attemptTracker.getFailMode();
      
      // Generate error based on checkbox flag in navbar
      // When "Test Mode" is checked, orders will always fail for testing purposes
      if (failModeEnabled) {
        const errorMessage = `Order placement failed. Please try again.`;
        showError(errorMessage);
        setError(errorMessage);
        // Call the original API (simulating real network failure)
        await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems,
            shipping: shippingData,
            payment: paymentData,
            totals: { subtotal, shipping, tax, total }
          })
        });
        // Trigger a genuine JSON Parse Error (SyntaxError)
        try {
          JSON.parse('{"invalidJson": }');
        } catch (e) {
          window.zipy?.logException?.(e);
          console.error(e);
          // Error already surfaced to user above
          return;
        }
      }
      
      // Process payment - only if fail mode is disabled
      // This ensures normal order flow when "Test Mode" is unchecked
      const paymentResult = await paymentAPI.processPayment({
        ...paymentData,
        amount: total,
      });
      
      // Clear cart and navigate to confirmation
      clearCart();
      
      // Show success message only if we reach here (no error was thrown)
      showSuccess(`Order placed successfully! Order ID: ${paymentResult.orderId}`);
      
      navigate('/order-confirmation', { 
        state: { 
          orderDetails: {
            ...paymentResult,
            items: cartItems,
            shipping: shippingData,
            totals: { subtotal, shipping, tax, total },
          }
        }
      });
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if shipping form is complete
  const isShippingComplete = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    return required.every(field => shippingData[field] && shippingData[field].trim()) && 
           Object.keys(shippingErrors).length === 0;
  };

  // Check if payment form is complete
  const isPaymentComplete = () => {
    const required = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'];
    return required.every(field => paymentData[field] && paymentData[field].trim()) && 
           Object.keys(paymentErrors).length === 0;
  };



  // Order summary component
  const OrderSummary = () => (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Order Summary
      </Typography>
      
      {cartItems.map((item) => (
        <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Qty: {item.quantity}
            </Typography>
          </Box>
          <Typography variant="body2">
            ${(item.price * item.quantity).toFixed(2)}
          </Typography>
        </Box>
      ))}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Subtotal
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
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="bold">
          Total
        </Typography>
        <Typography variant="h6" fontWeight="bold" color="primary">
          ${total.toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600 }}>
        Checkout
      </Typography>



      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>



      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {activeStep === 0 && (
            <ShippingForm 
              shippingData={shippingData}
              onShippingChange={handleShippingChange}
              errors={shippingErrors}
              isComplete={isShippingComplete()}
              showValidation={showValidation}
            />
          )}
          {activeStep === 1 && (
            <PaymentForm 
              paymentData={paymentData}
              onPaymentChange={handlePaymentChange}
              errors={paymentErrors}
              isComplete={isPaymentComplete()}
              showValidation={showValidation}
              isProcessing={loading}
            />
          )}
          {activeStep === 2 && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon color="primary" />
                Review Your Order
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                  Shipping Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shippingData.firstName} {shippingData.lastName}<br />
                  {shippingData.address}<br />
                  {shippingData.city}, {shippingData.state} {shippingData.zipCode}<br />
                  {shippingData.email} | {shippingData.phone}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                  Payment Method
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Card ending in {paymentData.cardNumber.slice(-4)}<br />
                  {paymentData.cardHolder}
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} lg={4}>
          <OrderSummary />
        </Grid>
      </Grid>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ textTransform: 'none' }}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={async () => {
            try {
              await handleNext();
            } catch (error) {
              console.error('Checkout action failed:', error);
              // Error is already handled by the respective functions
            }
          }}
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : activeStep === steps.length - 1 ? (
            'Place Order'
          ) : (
            'Next'
          )}
        </Button>
      </Box>


    </Container>
  );
};

export default Checkout;
