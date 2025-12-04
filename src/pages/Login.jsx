import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
  Zoom,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');


  // Handle form input changes - removed intentional error throwing
  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('');
    }
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Clear previous errors
    setSubmitError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Attempt login
      await login(formData.email, formData.password);
      window.zipy.identify(formData.email);
      // Navigate to products page on successful login
      navigate('/products');
    } catch (error) {
      setSubmitError(error.message || 'Login failed. Please try again.');
      // Don't navigate - stay on login page when login fails
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 4,
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          {/* Left Side - Hero Section */}
          <Grid item xs={12} lg={6}>
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
              <Box sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 800,
                    mb: 3,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #d4af37 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 400,
                    color: 'text.secondary',
                    mb: 4,
                    lineHeight: 1.5,
                    maxWidth: 500,
                  }}
                >
                  Sign in to your LUXE account and continue your journey through our curated collection of premium products.
                </Typography>
                
                {/* Features */}
                <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #d4af37 0%, #e6c866 100%)',
                      mr: 2,
                    }} />
                    <Typography variant="body1" color="text.secondary">
                      Exclusive member benefits and early access
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #d4af37 0%, #e6c866 100%)',
                      mr: 2,
                    }} />
                    <Typography variant="body1" color="text.secondary">
                      Personalized recommendations
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #d4af37 0%, #e6c866 100%)',
                      mr: 2,
                    }} />
                    <Typography variant="body1" color="text.secondary">
                      Secure and seamless shopping experience
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Zoom>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} lg={6}>
            <Fade in={true} style={{ transitionDelay: '400ms' }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 5 },
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: 4,
                  maxWidth: 500,
                  mx: 'auto',
                }}
              >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      mb: 1,
                      color: 'text.primary',
                    }}
                  >
                    Sign In
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Access your LUXE account
                  </Typography>
                </Box>

                {/* Error Alert */}
                {submitError && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {submitError}
                  </Alert>
                )}

                {/* Login Form */}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  {/* Email Field */}
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                      },
                    }}
                  />

                  {/* Password Field */}
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                      },
                    }}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 4, 
                      mb: 3, 
                      py: 1.5, 
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                      },
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  {/* Divider */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Divider sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                      or continue with
                    </Typography>
                    <Divider sx={{ flexGrow: 1 }} />
                  </Box>

                  {/* Social Login Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<GoogleIcon />}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        py: 1.5,
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                          borderColor: 'text.primary',
                          background: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      Google
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FacebookIcon />}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        py: 1.5,
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                          borderColor: 'text.primary',
                          background: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      Facebook
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AppleIcon />}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        py: 1.5,
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                          borderColor: 'text.primary',
                          background: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      Apple
                    </Button>
                  </Box>

                  {/* Sign Up Link */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Link
                        component={RouterLink}
                        to="/signup"
                        variant="body2"
                        sx={{ 
                          textDecoration: 'none', 
                          fontWeight: 600,
                          color: 'primary.main',
                          '&:hover': {
                            color: 'primary.dark',
                          },
                        }}
                      >
                        Create account
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>


    </Box>
  );
};

export default Login;
