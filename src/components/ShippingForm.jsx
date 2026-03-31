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
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocationCity as CityIcon,
  Map as StateIcon,
  Code as CodeIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const ShippingForm = ({ 
  shippingData, 
  onShippingChange, 
  errors = {}, 
  isComplete = false,
  showValidation = false 
}) => {
  // `showValidation` is currently driven by the parent stepper UI. We keep it to preserve the
  // public component API, but this form relies on `errors` for inline feedback today.
  void showValidation;
  // `showValidation` is intentionally accepted for API compatibility with Checkout's stepper UI.
  // This component currently relies on `errors` to drive inline feedback.
  const [showHelp, setShowHelp] = useState({});

  // Enhanced change handler with validation feedback
  const handleFieldChange = useCallback((field) => (event) => {
    const value = event.target.value;
    onShippingChange(field, value);
  }, [onShippingChange]);

  // Toggle help text visibility
  const toggleHelp = useCallback((field) => {
    setShowHelp(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

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
          <LocationIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
            Shipping Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isComplete ? 'Shipping details completed' : 'Please provide your shipping details'}
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

      <Grid container spacing={3}>
        {/* Personal Information Section */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
            Personal Information
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            id="firstName"
            label="First Name"
            name="firstName"
            autoComplete="given-name"
            value={shippingData.firstName || ''}
            onChange={handleFieldChange('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName}
            placeholder="Enter your first name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Enter your legal first name">
                    <IconButton 
                      size="small" 
                      onClick={() => toggleHelp('firstName')}
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
            id="lastName"
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
            value={shippingData.lastName || ''}
            onChange={handleFieldChange('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName}
            placeholder="Enter your last name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
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
            id="email"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            value={shippingData.email || ''}
            onChange={handleFieldChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            placeholder="your.email@example.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
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
            id="phone"
            label="Phone Number"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={shippingData.phone || ''}
            onChange={handleFieldChange('phone')}
            error={!!errors.phone}
            helperText={errors.phone}
            placeholder="+1 (555) 123-4567"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
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

        {/* Address Information Section */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
            Address Information
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            id="address"
            label="Street Address"
            name="address"
            autoComplete="street-address"
            value={shippingData.address || ''}
            onChange={handleFieldChange('address')}
            error={!!errors.address}
            helperText={errors.address}
            placeholder="123 Main Street, Apt 4B"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HomeIcon color="action" />
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
            id="city"
            label="City"
            name="city"
            autoComplete="address-level2"
            value={shippingData.city || ''}
            onChange={handleFieldChange('city')}
            error={!!errors.city}
            helperText={errors.city}
            placeholder="Enter your city"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CityIcon color="action" />
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

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            required
            id="state"
            label="State"
            name="state"
            autoComplete="address-level1"
            value={shippingData.state || ''}
            onChange={handleFieldChange('state')}
            error={!!errors.state}
            helperText={errors.state}
            placeholder="CA"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <StateIcon color="action" />
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

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            required
            id="zipCode"
            label="ZIP Code"
            name="zipCode"
            autoComplete="postal-code"
            value={shippingData.zipCode || ''}
            onChange={handleFieldChange('zipCode')}
            error={!!errors.zipCode}
            helperText={errors.zipCode}
            placeholder="90210"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CodeIcon color="action" />
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
          <FormControl fullWidth>
            <InputLabel id="country-label">Country</InputLabel>
            <Select
              labelId="country-label"
              id="country"
              name="country"
              value={shippingData.country || 'US'}
              onChange={handleFieldChange('country')}
              label="Country"
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
              <MenuItem value="US">United States</MenuItem>
              <MenuItem value="CA">Canada</MenuItem>
              <MenuItem value="MX">Mexico</MenuItem>
              <MenuItem value="UK">United Kingdom</MenuItem>
              <MenuItem value="DE">Germany</MenuItem>
              <MenuItem value="FR">France</MenuItem>
              <MenuItem value="AU">Australia</MenuItem>
              <MenuItem value="JP">Japan</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Help Text */}
      {showHelp.firstName && (
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="body2">
            Please enter your legal first name as it appears on your government-issued ID.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default ShippingForm;
