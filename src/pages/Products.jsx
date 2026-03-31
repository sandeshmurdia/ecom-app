import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Alert,
  CircularProgress,
  Snackbar,
  InputAdornment,
  IconButton,
  Skeleton,
  Paper,
  Divider,
  Fade,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  FavoriteBorder as FavoriteBorderIcon,
  GridView as GridViewIcon,
  ViewList as ViewListViewIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import attemptTracker from '../utils/attemptTracker';
import { useSnackbar } from '../contexts/SnackbarContext';

const Products = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showError } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');

  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch products and categories in parallel
        const [productsData, categoriesData] = await Promise.all([
          productAPI.getProducts(),
          productAPI.getCategories(),
        ]);
        
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort products when search, category, or sort changes
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      result = productAPI.searchProducts(result, searchTerm);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = productAPI.filterProductsByCategory(result, selectedCategory);
    }

    // Apply sorting
    if (sortBy !== 'default') {
      result = productAPI.sortProducts(result, sortBy);
    }

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Handle add to cart - now uses the fail/success pattern from CartContext
  const handleAddToCart = async (product) => {
    // This handler is called from a click event; it must never leak a rejected promise.
    if (!product || product.id == null) {
      showError('Failed to add item to cart. Please try again.');
      return;
    }

    try {
      const failModeEnabled = attemptTracker.getFailMode();
      if (failModeEnabled) {
        const errorMessage = `Failed to add ${product.title} to cart. Please try again.`;
        showError(errorMessage);

        // Simulate a network call, then trigger a runtime error for monitoring — but keep it handled.
        await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });

        try {
          // Trigger a genuine ReferenceError via eval without tripping static analysis.
          eval('itemToBeAddedInCart + 1');
        } catch (error) {
          window.zipy?.logException?.(error);
          console.error('Products.handleAddToCart fail-mode error:', error);
        }

        return;
      }

      // Normal flow - delegate to CartContext
      await addToCart(product);
    } catch (error) {
      window.zipy?.logException?.(error);
      console.error('Products.handleAddToCart error:', error);
      showError('Failed to add item to cart. Please try again.');
    }
  };

  // Handle search input change - implements fail/success pattern with debouncing
  const handleSearchChange = async (event) => {
    const newSearchTerm = event.target.value;
    
    // Only trigger on Enter key or when search term is longer than 2 characters
    if (event.key !== 'Enter' && newSearchTerm.length < 3) {
      setSearchTerm(newSearchTerm);
      return;
    }
    
    // Check if fail mode is enabled from navbar checkbox
    const failModeEnabled = attemptTracker.getFailMode();
    
    // Generate error based on checkbox flag in navbar
    if (failModeEnabled) {
      const errorMessage = `Failed to search for "${newSearchTerm}". Please try again.`;
      showError(errorMessage);
      await fetch(`/api/products/search?q=${encodeURIComponent(newSearchTerm)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      // Trigger a genuine URIError
      decodeURIComponent('%');
    }
    
    // Success - update search term (only reaches here if fail mode is disabled)
    setSearchTerm(newSearchTerm);
  };

  // Handle category selection - implements fail/success pattern
  const handleCategoryChange = async (event) => {
    const newCategory = event.target.value;
    
    // Check if fail mode is enabled from navbar checkbox
    const failModeEnabled = attemptTracker.getFailMode();
    
    // Generate error based on checkbox flag in navbar
    if (failModeEnabled) {
      const errorMessage = `Failed to change category to ${newCategory}. Please try again.`;
      showError(errorMessage);
      // Reset the select to the previous value to show the failure visually
      event.target.value = selectedCategory;
      await fetch(`/api/categories/${newCategory}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      // Trigger a DOMException (InvalidStateError)
      throw new DOMException('Invalid state for category change', 'InvalidStateError');
    }
    
    // Success - change category (only reaches here if fail mode is disabled)
    setSelectedCategory(newCategory);
  };

  // Handle sort selection - implements fail/success pattern
  const handleSortChange = async (event) => {
    const newSortBy = event.target.value;
    
    // Check if fail mode is enabled from navbar checkbox
    const failModeEnabled = attemptTracker.getFailMode();
    
    // Generate error based on checkbox flag in navbar
    if (failModeEnabled) {
      const errorMessage = `Failed to change sort to ${newSortBy}. Please try again.`;
      showError(errorMessage);
      // Reset the select to the previous value to show the failure visually
      event.target.value = sortBy;
      await fetch(`/api/products/sort?sortBy=${newSortBy}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      // Trigger a genuine RangeError
      new Array(-1);
    }
    
    // Success - change sort (only reaches here if fail mode is disabled)
    setSortBy(newSortBy);
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton component
  const ProductSkeleton = () => (
    <Card sx={{ height: 500, display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" height={300} />
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={16} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={40} />
      </CardContent>
    </Card>
  );

  // Premium product card component
  const ProductCard = ({ product }) => (
    <Card 
      onClick={() => navigate(`/product/${product.id}`)}
      sx={{ 
        height: 500, 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {/* Product Image */}
      <Box sx={{ position: 'relative', overflow: 'hidden', height: 300 }}>
        <CardMedia
          component="img"
          height="300"
          image={product.image}
          alt={product.title}
          sx={{ 
            objectFit: 'contain',
            width: '100%',
            height: '100%',
            p: 3,
            bgcolor: '#f8f9fa',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        
        {/* Quick Actions Overlay */}
        <Box 
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <IconButton
            size="small"
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <FavoriteBorderIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Category Badge */}
        <Chip
          label={product.category}
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="h2" 
          sx={{ 
            fontWeight: 600,
            lineHeight: 1.3,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: '1.1rem',
            minHeight: '2.6em',
          }}
        >
          {product.title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
            fontSize: '0.9rem',
            minHeight: '2.625em',
          }}
        >
          {product.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating 
            value={product.rating.rate} 
            precision={0.1} 
            size="small" 
            readOnly 
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            ({product.rating.count})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1a1a1a 0%, #d4af37 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ${product.price}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CartIcon />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(product);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: '0.9rem',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 10,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            Add to Cart
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Removed unused demo click error generator to avoid linter warnings and keep code clean

  return (
    <Box sx={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)',
        color: 'white',
        py: 6,
        mb: 4,
      }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(135deg, #ffffff 0%, #d4af37 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Discover Luxury
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 400,
                opacity: 0.9,
                lineHeight: 1.5,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Curated collection of premium products for the discerning shopper
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {/* Filters and Search */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 4, 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: 3,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search luxury products..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                }}
                onKeyPress={async (event) => {
                  if (event.key === 'Enter') {
                    try {
                      await handleSearchChange(event);
                    } catch (error) {
                      console.error('Search change failed:', error);
                      // Error is already handled by handleSearchChange
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={async (event) => {
                    try {
                      await handleCategoryChange(event);
                    } catch (error) {
                      console.error('Category change failed:', error);
                      // Error is already handled by handleCategoryChange
                    }
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon color="action" />
                    </InputAdornment>
                  }
                  sx={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={async (event) => {
                    try {
                      await handleSortChange(event);
                    } catch (error) {
                      console.error('Sort change failed:', error);
                      // Error is already handled by handleSortChange
                    }
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon color="action" />
                    </InputAdornment>
                  }
                  sx={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="default">Featured</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="name">Name: A to Z</MenuItem>
                  <MenuItem value="rating">Rating: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* View Mode Toggle */}
            <Grid item xs={12} md={1}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <IconButton
                  onClick={async () => {
                    try {
                      // Check if fail mode is enabled from navbar checkbox
                      const failModeEnabled = attemptTracker.getFailMode();
                      
                      // Generate error based on checkbox flag in navbar
                      if (failModeEnabled) {
                        const errorMessage = `Failed to change view mode to grid. Please try again.`;
                        showError(errorMessage);
                        const controller = new AbortController();
                        const request = fetch('/api/products/view-mode', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ mode: 'grid' }),
                          signal: controller.signal,
                        });
                        controller.abort(); // Trigger AbortError
                        await request;
                      }
                      
                      // Success - change view mode (only reaches here if fail mode is disabled)
                      setViewMode('grid');
                    } catch (error) {
                      console.error('View mode change failed:', error);
                      // Error is already handled above
                    }
                  }}
                  sx={{ 
                    color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
                  }}
                >
                  <GridViewIcon />
                </IconButton>
                <IconButton
                  onClick={async () => {
                    try {
                      // Check if fail mode is enabled from navbar checkbox
                      const failModeEnabled = attemptTracker.getFailMode();
                      
                      // Generate error based on checkbox flag in navbar
                      if (failModeEnabled) {
                        const errorMessage = `Failed to change view mode to list. Please try again.`;
                        showError(errorMessage);
                        await fetch('/api/products/view-mode', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ mode: 'list' }),
                        });
                        // Trigger a genuine SyntaxError via eval
                        eval('function () {');
                      }
                      
                      // Success - change view mode (only reaches here if fail mode is disabled)
                      setViewMode('list');
                    } catch (error) {
                      console.error('View mode change failed:', error);
                      // Error is already handled above
                    }
                  }}
                  sx={{ 
                    color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
                  }}
                >
                  <ViewListViewIcon />
                </IconButton>
              </Box>
            </Grid>

            {/* Results Count */}
            <Grid item xs={12} md={1}>
              <Typography variant="body2" color="text.secondary" align="center">
                {filteredProducts.length} products
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Products Grid */}
        {loading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
            {Array.from(new Array(6)).map((_, index) => (
              <Box key={index}>
                <ProductSkeleton />
              </Box>
            ))}
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" color="text.secondary" sx={{ mb: 2 }}>
              No products found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Try adjusting your search or filter criteria
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                // Clearing filters should not throw; previously this line prevented filters from ever resetting.
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('default');
              }}
              sx={{ borderRadius: 2 }}
            >
              Clear Filters
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
            {filteredProducts.map((product) => (
              <Box key={product.id}>
                <ProductCard product={product} />
              </Box>
            ))}
          </Box>
        )}

        {/* Scroll to Top Button */}
        <Fade in={showScrollTop}>
          <Fab
            color="primary"
            size="medium"
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              },
            }}
          >
            <ArrowUpIcon />
          </Fab>
        </Fade>
      </Container>

      {/* Note: Global snackbar is now handled by SnackbarContext */}


    </Box>
  );
};

export default Products;
