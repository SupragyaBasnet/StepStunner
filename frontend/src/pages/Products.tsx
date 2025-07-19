import { ShoppingCart, Star, Visibility } from '@mui/icons-material';
import {
  Box, Button, Card, CardActions, CardContent,
  CardMedia, Container,
  Grid, Typography, Rating, Stack, Drawer, IconButton, InputBase, Slider, FormControl, InputLabel, Select, MenuItem, Checkbox, FormGroup, FormControlLabel
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useCart } from '../context/CartContext';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const allCategories = [
  { label: 'Sneakers', value: 'sneakers' },
  { label: 'Heels', value: 'heels' },
  { label: 'Flats', value: 'flats' },
];

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const brandParam = searchParams.get('brand');
  const navigate = useNavigate();

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryParam ? [categoryParam] : []);
  const [selectedBrand, setSelectedBrand] = useState<string>(brandParam || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Responsive
  const isMobile = window.innerWidth < 900;

  // Fetch products from backend (hooks must be inside component)
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refactored fetchProducts so it can be called from anywhere
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Listen for review-triggered refresh
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
              if (e.key === 'stepstunnerProductsRefresh' && e.newValue === 'true') {
        fetchProducts();
                  localStorage.setItem('stepstunnerProductsRefresh', 'false');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Update filters when URL parameters change
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]); // Show all categories if no category param
    }
    if (brandParam) {
      setSelectedBrand(brandParam);
    } else {
      setSelectedBrand(''); // Clear brand filter if no brand param
    }
  }, [categoryParam, brandParam]);

  const minProductPrice = products.length > 0 ? Math.min(...products.map(p => p.price)) : 0;
  const maxProductPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 0;

  useEffect(() => {
    if (products.length > 0) {
      setPriceRange([minProductPrice, maxProductPrice]);
    }
  }, [products, minProductPrice, maxProductPrice]);

  // Filtering logic
  let filteredProducts = products.filter(product => {
    const prodName = (product.name || '').toLowerCase();
    const prodCategory = (product.category || '').toLowerCase();
    const prodBrand = (product.brand || '').toLowerCase();
    const prodPrice = typeof product.price === 'number' ? product.price : 0;
    const prodRating = typeof product.rating === 'number' ? product.rating : 0;

    // Category filter: if no categories selected, show all; otherwise match selected categories
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.some(cat => cat.toLowerCase() === prodCategory.toLowerCase());
    
    // Brand filter: if no brand selected, show all; otherwise match selected brand
    const matchesBrand = !selectedBrand || 
      prodBrand.toLowerCase().includes(selectedBrand.toLowerCase().replace(/-/g, ' '));
    
    const matchesPrice = prodPrice >= priceRange[0] && prodPrice <= priceRange[1];
    const matchesRating = prodRating >= minRating;
    const matchesSearch = prodName.includes(search.toLowerCase());

    return matchesCategory && matchesBrand && matchesPrice && matchesRating && matchesSearch;
  });

  // Sorting logic
  if (sortBy === 'priceLowHigh') filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
  if (sortBy === 'priceHighLow') filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
  if (sortBy === 'ratingLowHigh') filteredProducts = filteredProducts.sort((a, b) => a.rating - b.rating);
  if (sortBy === 'ratingHighLow') filteredProducts = filteredProducts.sort((a, b) => b.rating - a.rating);

  // Sidebar content
  const sidebar = (
    <Box sx={{ width: 260, p: 2, position: { md: 'sticky' }, top: { md: 32 }, alignSelf: { md: 'flex-start' }, zIndex: 2 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>Filters</Typography>
      {/* Category Filter */}
      <Typography variant="subtitle2" fontWeight={600} mb={1}>Category</Typography>
      <FormGroup>
        {allCategories.map(cat => (
          <FormControlLabel
            key={cat.value}
            control={
              <Checkbox
                checked={selectedCategories.includes(cat.value)}
                onChange={e => {
                  if (e.target.checked) setSelectedCategories([...selectedCategories, cat.value]);
                  else setSelectedCategories(selectedCategories.filter(c => c !== cat.value));
                }}
              />
            }
            label={cat.label}
          />
        ))}
      </FormGroup>
      
      {/* Brand Filter */}
      {selectedBrand && (
        <>
          <Typography variant="subtitle2" fontWeight={600} mt={3} mb={1}>Brand</Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#d72660' }}>
              {selectedBrand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Typography>
            <Button
              size="small"
              onClick={() => setSelectedBrand('')}
              sx={{ mt: 1, color: '#666', textTransform: 'none' }}
            >
              Clear Brand Filter
            </Button>
          </Box>
        </>
      )}
      {/* Price Range Filter */}
      <Typography variant="subtitle2" fontWeight={600} mt={3} mb={1}>Price Range</Typography>
      <Slider
        value={priceRange}
        min={minProductPrice}
        max={maxProductPrice}
        onChange={(_, val) => setPriceRange(val as [number, number])}
        valueLabelDisplay="auto"
        sx={{ mb: 2 }}
      />
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="body2">Rs. {priceRange[0]}</Typography>
        <Typography variant="body2">Rs. {priceRange[1]}</Typography>
      </Box>
      {/* Rating Filter */}
      <Typography variant="subtitle2" fontWeight={600} mt={2} mb={1}>Minimum Rating</Typography>
      <Slider
        value={minRating}
        min={0}
        max={5}
        step={0.5}
        onChange={(_, val) => setMinRating(val as number)}
        valueLabelDisplay="auto"
        sx={{ mb: 2 }}
      />
    </Box>
  );

  const { addToCart } = useCart();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '', severity: 'success' });

  // Debug logging to diagnose why products are not visible
  console.log('Loaded products:', products);
  console.log('Current filters:', { selectedCategories, selectedBrand, priceRange, minRating, search });
  console.log('Filtered products:', filteredProducts);

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh'}}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Typography variant="h4" align="center" sx={{ mt: 8 }}>Loading products...</Typography>
        </Container>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh'}}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Typography variant="h4" align="center" color="error" sx={{ mt: 8 }}>{error}</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh'}}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h3" component="h1" align="center" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.2rem' }, color: '#111', mb: 0 }}>
          Browse Products
        </Typography>
        <div className="heading-dash" />
        <Grid container spacing={4}>
          {/* Sidebar (desktop) */}
          {!isMobile && (
            <Grid item md={3}>
              {sidebar}
            </Grid>
          )}
          {/* Main content */}
          <Grid item xs={12} md={9}>
            {/* Top bar: search and sort */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3, alignItems: { sm: 'center' }, justifyContent: 'center' }}>
              {isMobile && (
                <IconButton onClick={() => setSidebarOpen(true)} sx={{ mb: { xs: 1, sm: 0 } }}>
                  <MenuIcon />
                </IconButton>
              )}
              <InputBase
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ flex: 1, bgcolor: 'grey.100', borderRadius: 2, px: 2, py: 1, fontSize: '1rem', boxShadow: 1 }}
              />
              <FormControl sx={{ minWidth: 160, mx: 'auto' }}>
      
                <Select
                  value={sortBy}
                  displayEmpty
                  onChange={e => setSortBy(e.target.value)}
                  size="small"
                  sx={{
                    minWidth: 160,
                    height: 48,
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    fontSize: '1rem',
                    boxShadow: 1,
                    border: '1px solid #ccc',
                    '.MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pl: 2,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { textAlign: 'center' }
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: '#888' }}>Sort By</span>
                  </MenuItem>
                  <MenuItem value="priceLowHigh">Price: Low to High</MenuItem>
                  <MenuItem value="priceHighLow">Price: High to Low</MenuItem>
                  <MenuItem value="ratingLowHigh">Rating: Low to High</MenuItem>
                  <MenuItem value="ratingHighLow">Rating: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {/* Sidebar drawer (mobile) */}
            <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
              {sidebar}
            </Drawer>
            {/* Products grid */}
            <Grid container spacing={4}>
              {filteredProducts.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 6 }}>
                    No products found.
                  </Typography>
                </Grid>
              ) : (
                filteredProducts.map((product) => {
                  const mainIdx = 0;
                  return (
                    <Grid item key={product.id} xs={12} sm={6} md={4} lg={4}>
                      <Card
                        sx={{
                          width: 260,
                          height: 420,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'white',
                          borderRadius: 4,
                          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
                          p: { xs: 1, sm: 2 },
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 6px 24px 0 rgba(244,106,106,0.10)',
                          },
                          mx: 'auto',
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        <CardMedia
                          component="img"
                          image={product.image}
                          alt={product.name}
                          sx={{ width: 180, height: 180, objectFit: 'contain', mx: 'auto', bgcolor: 'white', borderRadius: 2, mt: 2, mb: 1 }}
                        />
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 0, width: '100%', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#111', fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" paragraph sx={{ mb: 0.5, color: '#111', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: 36 }}>
                            {product.description}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 0.5 }}>
                            <Rating value={product.rating} precision={0.5} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                              ({product.reviews})
                            </Typography>
                          </Stack>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111', mb: 0.5 }}>
                            Rs. {typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : 'N/A'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MuiAlert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Products; 