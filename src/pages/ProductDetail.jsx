import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Rating,
  Chip,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
  Fade,
  Slide,
  Breadcrumbs,
  Link,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as CartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  ZoomIn as ZoomInIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { productAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import attemptTracker from '../utils/attemptTracker';

// Generate sample reviews for demonstration
const generateReviews = (totalReviews) => {
  const names = [
    'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Thompson', 
    'Lisa Wang', 'James Wilson', 'Maria Garcia', 'Robert Brown',
    'Jennifer Davis', 'Christopher Lee', 'Amanda Taylor', 'Daniel Martinez'
  ];
  
  const comments = [
    'Excellent product! Exceeded my expectations. The quality is outstanding and delivery was fast.',
    'Great value for money. I\'ve been using this for a month now and it works perfectly.',
    'Amazing quality and beautiful design. Highly recommend to anyone looking for this type of product.',
    'Good product overall. Minor issues but nothing that affects the main functionality.',
    'Outstanding customer service and the product arrived in perfect condition. Very satisfied!',
    'Love this product! It\'s exactly what I was looking for. Will definitely buy again.',
    'Good quality but took longer to arrive than expected. Product itself is great though.',
    'Perfect! Exactly as described. Fast shipping and great packaging. Highly recommend.',
    'Very happy with this purchase. The product is well-made and looks great.',
    'Excellent quality and fast delivery. The product exceeded my expectations.',
    'Good product with minor cosmetic issues. Overall satisfied with the purchase.',
    'Amazing product! Great quality and excellent customer service. Will buy again.'
  ];

  const reviewCount = Math.min(6, Math.max(2, Math.floor(totalReviews / 3)));
  
  return Array.from({ length: reviewCount }, (_, index) => ({
    name: names[index % names.length],
    rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
    comment: comments[index % comments.length],
    date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    verified: Math.random() > 0.3 // 70% verified purchases
  }));
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated: _IS_AUTHENTICATED } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageZoom, setImageZoom] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product details on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        
        const productData = await productAPI.getProduct(id);
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Handle quantity changes
  const handleQuantityChange = async (newQuantity) => {
    const failModeEnabled = attemptTracker.getFailMode();
    if (failModeEnabled) {
      // Simulate a real network call, then surface a genuine JS runtime error
      try {
        await fetch(`/api/cart/update/${safeProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQuantity }),
        });
        // Trigger a TypeError that looks like a genuine runtime issue
        const bogus = null;
        // eslint-disable-next-line no-unused-vars
        const value = bogus.missingProperty;
      } catch (error) {
        window.zipy?.logException?.(error);
        console.error(error);
        showError('Failed to update quantity. Please try again.');
        return;
      }
    }
    if (newQuantity >= 1 && newQuantity <= safeProduct.stock) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!safeProduct) return;

    try {
      setAddingToCart(true);
      
      // Check if fail mode is enabled
      const failModeEnabled = attemptTracker.getFailMode();
      
      if (failModeEnabled) {
        // Simulate a real network call, then surface a genuine JS runtime error
        try {
          await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: safeProduct.id, quantity }),
          });
          // Intentional runtime TypeError to look like a genuine failure
          const bogus = undefined;
          // eslint-disable-next-line no-unused-vars
          const value = bogus.value;
        } catch (error) {
          window.zipy?.logException?.(error);
          console.error(error);
          showError(`Failed to add ${safeProduct.title} to cart. Please try again.`);
          return;
        } finally {
          setAddingToCart(false);
        }
        return;
      }
      
      // Add to cart successfully.
      // CartContext owns cart state updates; we suppress its default toast here to avoid double-toasting
      // because this page has a quantity-aware success message.
      // Await to ensure errors are caught here and never surface as an unhandled promise rejection.
      const didAdd = await addToCart(
        {
          id: safeProduct.id,
          title: safeProduct.title,
          price: safeProduct.price,
          image: safeProduct.image,
        },
        quantity,
        { showToast: false }
      );

      // Keep the existing user feedback behavior, but avoid double-toasting if CartContext already handled it.
      if (didAdd) {
        showSuccess(`${safeProduct.title} added to cart (${quantity} ${quantity === 1 ? 'item' : 'items'})`);
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    if (!safeProduct) return;
    
    try {
      // Add to cart first
      // Await to ensure the cart update completes (and to keep errors in this try/catch).
      // Suppress default toast because this flow is immediately followed by navigation.
      await addToCart(
        {
          id: safeProduct.id,
          title: safeProduct.title,
          price: safeProduct.price,
          image: safeProduct.image,
        },
        quantity,
        { showToast: false }
      );
      // Navigate to checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Error with buy now:', error);
      showError('Failed to proceed to checkout. Please try again.');
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle share
  const _handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Product link copied to clipboard!');
    }
  };

  // Generate additional product images for demo
  const getProductImages = (product) => {
    if (!product || !product.image) {
      // Fallback images if no product or image
      return [
        'https://via.placeholder.com/400x400?text=No+Image',
        'https://via.placeholder.com/400x400?text=Image+2',
        'https://via.placeholder.com/400x400?text=Image+3',
        'https://via.placeholder.com/400x400?text=Image+4',
      ];
    }
    
    const baseImage = product.image;
    // Generate additional images with fallbacks
    const additionalImages = [
      baseImage,
      baseImage.includes('fakestoreapi.com') 
        ? baseImage.replace('https://fakestoreapi.com/img/', 'https://picsum.photos/400/400?random=')
        : `https://picsum.photos/400/400?random=${product.id || 1}`,
      baseImage.includes('fakestoreapi.com') 
        ? baseImage.replace('https://fakestoreapi.com/img/', 'https://picsum.photos/400/400?random=')
        : `https://picsum.photos/400/400?random=${(product.id || 1) + 1}`,
      baseImage.includes('fakestoreapi.com') 
        ? baseImage.replace('https://fakestoreapi.com/img/', 'https://picsum.photos/400/400?random=')
        : `https://picsum.photos/400/400?random=${(product.id || 1) + 2}`,
    ];
    
    return additionalImages;
  };

  // Get current cart quantity for this product
  const getCartQuantity = () => {
    const cartItem = cartItems.find(item => item.id === product?.id);
    return cartItem ? cartItem.quantity : 0;
  };

  // Ensure product has all required properties with fallbacks
  const getSafeProduct = (product) => {
    if (!product) {
      return {
        id: 'unknown',
        title: 'Product Not Found',
        price: 0,
        description: 'No description available',
        category: 'uncategorized',
        image: 'https://via.placeholder.com/400x400?text=No+Image',
        rating: { rate: 0, count: 0 },
        stock: 0
      };
    }

    return {
      id: product.id || 'unknown',
      title: product.title || 'Untitled Product',
      price: product.price || 0,
      description: product.description || 'No description available for this product.',
      category: product.category || 'uncategorized',
      image: product.image || 'https://via.placeholder.com/400x400?text=No+Image',
      rating: {
        rate: product.rating?.rate || 0,
        count: product.rating?.count || 0
      },
      stock: product.stock || 0
    };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleBack} startIcon={<ArrowBackIcon />}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Product not found
        </Alert>
        <Button variant="contained" onClick={handleBack} startIcon={<ArrowBackIcon />}>
          Go Back
        </Button>
      </Container>
    );
  }

  const safeProduct = getSafeProduct(product);
  const productImages = getProductImages(safeProduct);
  const cartQuantity = getCartQuantity();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: '#fafafa'
    }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2, fontSize: '0.875rem' }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': { 
                textDecoration: 'underline',
                color: 'secondary.main'
              }
            }}
          >
            <HomeIcon fontSize="small" />
            Home
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/products')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': { 
                textDecoration: 'underline',
                color: 'secondary.main'
              }
            }}
          >
            <StoreIcon fontSize="small" />
            Products
          </Link>
          <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.875rem' }}>
            {safeProduct.title}
          </Typography>
        </Breadcrumbs>

        {/* Main Product Layout - Side by Side */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4, 
          mb: 4,
          alignItems: 'flex-start'
        }}>
          {/* Product Images - Left side */}
          <Box sx={{ 
            flex: { xs: '1', md: '1' },
            minWidth: { xs: '100%', md: '50%' }
          }}>
            <Box sx={{ 
              bgcolor: 'white',
              borderRadius: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              width: '100%'
            }}>
              {/* Main Product Image */}
              <Box sx={{ 
                position: 'relative',
                width: '100%',
                height: { xs: '300px', md: '400px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fafafa',
                p: 2,
                overflow: 'hidden'
              }}>
                <CardMedia
                  component="img"
                  image={productImages[selectedImage]}
                  alt={safeProduct.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
                  }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                  onClick={() => setImageZoom(!imageZoom)}
                />
                
                {/* Zoom Icon */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': {
                      bgcolor: '#f0f0f0',
                    },
                    width: 40,
                    height: 40
                  }}
                  onClick={() => setImageZoom(!imageZoom)}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Thumbnail Images */}
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                gap: 1, 
                overflowX: 'auto',
                borderTop: '1px solid #e0e0e0'
              }}>
                {productImages.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      minWidth: 60,
                      width: 60,
                      height: 60,
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedImage === index ? 2 : 1,
                      borderColor: selectedImage === index ? '#007185' : '#e0e0e0',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                      '&:hover': {
                        borderColor: '#007185',
                      },
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <CardMedia
                      component="img"
                      image={image}
                      alt={`${safeProduct.title} ${index + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                      }}
                      sx={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Product Details - Right side */}
          <Box sx={{ 
            flex: { xs: '1', md: '1' },
            minWidth: { xs: '100%', md: '50%' },
            pl: { md: 2 }
          }}>
              {/* Product Title */}
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: 'text.primary',
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  lineHeight: 1.3
                }}
              >
                {safeProduct.title}
              </Typography>

              {/* Rating and Reviews */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <Rating
                    value={safeProduct.rating.rate}
                    precision={0.1}
                    size="small"
                    readOnly
                    sx={{ 
                      mr: 1,
                      '& .MuiRating-iconFilled': {
                        color: 'secondary.main'
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'primary.main', fontSize: '0.875rem' }}>
                    {safeProduct.rating.rate}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'primary.main', fontSize: '0.875rem', mr: 2 }}>
                  ({safeProduct.rating.count})
                </Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', fontSize: '0.875rem' }}>
                  {safeProduct.rating.count > 0 ? 'See all reviews' : 'No reviews yet'}
                </Typography>
              </Box>

              {/* Price */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h3" 
                  component="div" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    fontSize: { xs: '1.75rem', md: '2rem' },
                    lineHeight: 1.2
                  }}
                >
                  ${safeProduct.price.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  Price includes all applicable taxes
                </Typography>
              </Box>

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.primary',
                    fontSize: '1rem',
                    lineHeight: 1.5,
                    mb: 1,
                    fontWeight: 600
                  }}
                >
                  About this item
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    lineHeight: 1.4
                  }}
                >
                  {safeProduct.description}
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'grey.300' }} />

              {/* Quantity Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  Quantity:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    overflow: 'hidden',
                    bgcolor: 'background.paper'
                  }}>
                    <IconButton
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      sx={{
                        bgcolor: 'grey.100',
                        color: 'text.primary',
                        borderRadius: 0,
                        width: 32,
                        height: 32,
                        '&:hover': {
                          bgcolor: 'grey.200',
                        },
                        '&:disabled': {
                          bgcolor: 'grey.100',
                          color: 'text.disabled'
                        }
                      }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Box sx={{ 
                      minWidth: 50, 
                      textAlign: 'center', 
                      py: 1,
                      px: 2,
                      borderLeft: '1px solid',
                      borderRight: '1px solid',
                      borderColor: 'grey.300',
                      bgcolor: 'background.paper'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 400 }}>
                        {quantity}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= safeProduct.stock}
                      sx={{
                        bgcolor: 'grey.100',
                        color: 'text.primary',
                        borderRadius: 0,
                        width: 32,
                        height: 32,
                        '&:hover': {
                          bgcolor: 'grey.200',
                        },
                        '&:disabled': {
                          bgcolor: 'grey.100',
                          color: 'text.disabled'
                        }
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    ({safeProduct.stock} available)
                  </Typography>
                </Box>
              </Box>

              {/* Cart Status */}
              {cartQuantity > 0 && (
                <Box sx={{ 
                  mb: 3,
                  p: 2,
                  bgcolor: 'transparent',
                  border: '1px solid',
                  borderColor: 'success.main',
                  borderRadius: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'success.dark', fontSize: '0.875rem', fontWeight: 500 }}>
                      {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'} already in cart
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={addingToCart ? <CircularProgress size={20} /> : <CartIcon />}
                  onClick={handleAddToCart}
                  disabled={addingToCart || safeProduct.stock === 0}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                    },
                    '&:disabled': {
                      bgcolor: 'grey.300',
                      color: 'text.disabled'
                    }
                  }}
                >
                  {addingToCart ? 'Adding...' : safeProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleBuyNow}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderColor: 'grey.300',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'grey.50'
                    }
                  }}
                >
                  Buy Now
                </Button>
              </Box>

              {/* Features */}
              <Box sx={{ 
                mb: 4,
                p: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1
              }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Product Features
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShippingIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                      Free shipping on orders over $50
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                      Secure payment with SSL encryption
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SupportIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                      24/7 customer support available
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Product Details */}
              <Box sx={{ 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid',
                  borderColor: 'grey.300',
                  bgcolor: 'grey.50'
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Product Details
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.875rem' }}>
                        Category
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                        {safeProduct.category}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.875rem' }}>
                        Product ID
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                        {safeProduct.id}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.875rem' }}>
                        Stock Available
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                        {safeProduct.stock} units
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.875rem' }}>
                        Customer Rating
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating 
                          value={safeProduct.rating.rate} 
                          precision={0.1} 
                          size="small" 
                          readOnly 
                          sx={{ 
                            '& .MuiRating-iconFilled': {
                              color: 'secondary.main'
                            }
                          }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                          {safeProduct.rating.rate} out of 5 ({safeProduct.rating.count} reviews)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
          </Box>
        </Box>

        {/* Product Reviews Section */}
        <Box sx={{ mt: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 600, 
              mb: 3,
              color: 'text.primary',
              fontSize: '1.5rem'
            }}
          >
            Customer Reviews
          </Typography>

          {/* Reviews Summary */}
          <Box sx={{ 
            mb: 4,
            p: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 1
          }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  {safeProduct.rating.rate}
                </Typography>
                <Rating
                  value={safeProduct.rating.rate}
                  precision={0.1}
                  size="large"
                  readOnly
                  sx={{ 
                    mb: 2,
                    '& .MuiRating-iconFilled': {
                      color: 'secondary.main'
                    }
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  Based on {safeProduct.rating.count} reviews
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = Math.floor(Math.random() * (safeProduct.rating.count / 5));
                    const percentage = (safeProduct.rating.count > 0) ? (count / safeProduct.rating.count) * 100 : 0;
                    return (
                      <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ minWidth: 20, fontSize: '0.875rem' }}>
                          {star}
                        </Typography>
                        <Box sx={{ flex: 1, height: 6, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                          <Box 
                            sx={{ 
                              height: '100%', 
                              bgcolor: 'secondary.main', 
                              width: `${percentage}%`,
                              transition: 'width 0.3s ease'
                            }} 
                          />
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 30, fontSize: '0.875rem', color: 'text.secondary' }}>
                          {count}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Individual Reviews */}
          <Grid container spacing={2}>
            {generateReviews(safeProduct.rating.count).map((review, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box sx={{ 
                  p: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        mr: 2,
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {review.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>
                        {review.name}
                      </Typography>
                      <Rating
                        value={review.rating}
                        size="small"
                        readOnly
                        sx={{ 
                          '& .MuiRating-iconFilled': {
                            color: 'secondary.main'
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      {review.date}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.5, color: 'text.primary', fontSize: '0.875rem' }}>
                    {review.comment}
                  </Typography>
                  {review.verified && (
                    <Chip
                      label="Verified Purchase"
                      size="small"
                      sx={{ 
                        fontSize: '0.75rem',
                        height: 20,
                        bgcolor: 'transparent',
                        color: 'success.dark',
                        border: '1px solid',
                        borderColor: 'success.main',
                        fontWeight: 500
                      }}
                    />
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Write Review Button */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderColor: 'grey.300',
                color: 'text.primary',
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'grey.50'
                }
              }}
            >
              Write a Review
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetail;
