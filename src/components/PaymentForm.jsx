import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CreditCard as CardIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const PaymentForm = ({ 
  paymentData, 
  onPaymentChange, 
  errors = {}, 
  isComplete = false,
  // `showValidation` is accepted for parity with Checkout but not used yet in this component.
  isProcessing = false 
}) => {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [showHelp, setShowHelp] = useState({});
  // `_showValidation` is intentionally unused for now: callers may pass it to align API with other forms,
  // and we keep it reserved to gate field-level error UI in the future without a breaking prop change.

  // Enhanced change handler with formatting
  const handleFieldChange = useCallback((field) => (event) => {
    let value = event.target.value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) return; // Max 16 digits + 3 spaces
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (value.length > 5) return;
    }
    
    // Format CVV
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
    }
    
    onPaymentChange(field, value);
  }, [onPaymentChange]);

  // Toggle help text visibility
  const toggleHelp = useCallback((field) => {
    setShowHelp(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // Get card type based on number
  const getCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'Discover';
    return 'Card';
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 4, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.95) 100%)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: isComplete ? 
            'linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)' : 
            'linear-gradient(90deg, #d4af37 0%, #e6c866 100%)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: isComplete ? 
            'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)' : 
            'linear-gradient(135deg, #d4af37 0%, #e6c866 100%)',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        }}>
          <PaymentIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
            Payment Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isComplete ? 'Payment details completed' : 'Secure payment processing'}
          </Typography>
        </Box>
        {isComplete && (
          <Chip 
            icon={<CheckIcon />} 
            label="Complete" 
            color="success" 
            sx={{ ml: 'auto' }}
          />
        )}
      </Box>

      {/* Error Alert */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          Please correct the following errors to continue
        </Alert>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            Processing payment securely...
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Card Information Section */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
            Card Information
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            id="cardNumber"
            label="Card Number"
            name="cardNumber"
            type={showCardNumber ? "text" : "password"}
            autoComplete="cc-number"
            value={paymentData.cardNumber || ''}
            onChange={handleFieldChange('cardNumber')}
            error={!!errors.cardNumber}
            helperText={errors.cardNumber}
            placeholder="1234 5678 9012 3456"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CardIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {paymentData.cardNumber ? getCardType(paymentData.cardNumber) : ''}
                    </Typography>
                    <Tooltip title={showCardNumber ? "Hide card number" : "Show card number"}>
                      <IconButton
                        onClick={() => setShowCardNumber(!showCardNumber)}
                        edge="end"
                        size="small"
                      >
                        {showCardNumber ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0px 0px 0px 2px rgba(26, 26, 26, 0.1)',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            id="cardHolder"
            label="Cardholder Name"
            name="cardHolder"
            type="text"
            autoComplete="cc-name"
            value={paymentData.cardHolder || ''}
            onChange={handleFieldChange('cardHolder')}
            error={!!errors.cardHolder}
            helperText={errors.cardHolder}
            placeholder="JOHN DOE"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Enter the name as it appears on your card">
                    <IconButton 
                      size="small" 
                      onClick={() => toggleHelp('cardHolder')}
                      sx={{ color: 'text.secondary' }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0px 0px 0px 2px rgba(26, 26, 26, 0.1)',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            id="expiryDate"
            label="Expiry Date"
            name="expiryDate"
            type="text"
            autoComplete="cc-exp"
            value={paymentData.expiryDate || ''}
            onChange={handleFieldChange('expiryDate')}
            error={!!errors.expiryDate}
            helperText={errors.expiryDate}
            placeholder="MM/YY"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0px 0px 0px 2px rgba(26, 26, 26, 0.1)',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            id="cvv"
            label="CVV"
            name="cvv"
            type={showCvv ? "text" : "password"}
            autoComplete="cc-csc"
            value={paymentData.cvv || ''}
            onChange={handleFieldChange('cvv')}
            error={!!errors.cvv}
            helperText={errors.cvv}
            placeholder="123"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SecurityIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={showCvv ? "Hide CVV" : "Show CVV"}>
                    <IconButton
                      onClick={() => setShowCvv(!showCvv)}
                      edge="end"
                      size="small"
                    >
                      {showCvv ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0px 0px 0px 2px rgba(26, 26, 26, 0.1)',
                },
              },
            }}
          />
        </Grid>

        {/* Billing Address Section */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
            Billing Address
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="billing-address-label">Billing Address</InputLabel>
            <Select
              labelId="billing-address-label"
              id="billingAddress"
              name="billingAddress"
              value={paymentData.billingAddress || 'same'}
              onChange={handleFieldChange('billingAddress')}
              label="Billing Address"
              sx={{
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0px 0px 0px 2px rgba(26, 26, 26, 0.1)',
                },
              }}
            >
              <MenuItem value="same">Same as shipping address</MenuItem>
              <MenuItem value="different">Use different billing address</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Security Notice */}
      <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="body2">
            Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
          </Typography>
        </Box>
      </Alert>

      {/* Help Text */}
      {showHelp.cardHolder && (
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="body2">
            Please enter the name exactly as it appears on your credit or debit card.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default PaymentForm;
