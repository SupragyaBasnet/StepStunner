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
    <Box sx={{ 
      width: 280, 
      p: 3, 
      position: { md: 'sticky' }, 
      top: { md: 32 }, 
      alignSelf: { md: 'flex-start' }, 
      zIndex: 2,
      bgcolor: 'white',
      borderRadius: 4,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <Typography 
        variant="h5" 
        fontWeight={800} 
        mb={3}
        sx={{
          color: '#1a1a1a',
          borderBottom: '2px solid #d72660',
          pb: 1,
          display: 'inline-block'
        }}
      >
        Filters
      </Typography>
      {/* Category Filter */}
      <Typography 
        variant="subtitle1" 
        fontWeight={700} 
        mb={2}
        sx={{ color: '#333', fontSize: '1.1rem' }}
      >
        Category
      </Typography>
      <FormGroup sx={{ mb: 3 }}>
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
                sx={{
                  color: '#d72660',
                  '&.Mui-checked': {
                    color: '#d72660',
                  },
                }}
              />
            }
            label={cat.label}
            sx={{
              '& .MuiFormControlLabel-label': {
                fontWeight: 600,
                fontSize: '1rem',
                color: '#333'
              }
            }}
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
      <Typography 
        variant="subtitle1" 
        fontWeight={700} 
        mb={2}
        sx={{ color: '#333', fontSize: '1.1rem' }}
      >
        Price Range
      </Typography>
      <Slider
        value={priceRange}
        min={minProductPrice}
        max={maxProductPrice}
        onChange={(_, val) => setPriceRange(val as [number, number])}
        valueLabelDisplay="auto"
        sx={{ 
          mb: 2,
          '& .MuiSlider-thumb': {
            backgroundColor: '#d72660',
            '&:hover': {
              boxShadow: '0 0 0 8px rgba(215, 38, 96, 0.2)',
            },
          },
          '& .MuiSlider-track': {
            backgroundColor: '#d72660',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#e0e0e0',
          },
        }}
      />
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#d72660' }}>
          Rs. {priceRange[0]?.toLocaleString('en-IN')}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#d72660' }}>
          Rs. {priceRange[1]?.toLocaleString('en-IN')}
        </Typography>
      </Box>
      
      {/* Rating Filter */}
      <Typography 
        variant="subtitle1" 
        fontWeight={700} 
        mb={2}
        sx={{ color: '#333', fontSize: '1.1rem' }}
      >
        Minimum Rating
      </Typography>
      <Slider
        value={minRating}
        min={0}
        max={5}
        step={0.5}
        onChange={(_, val) => setMinRating(val as number)}
        valueLabelDisplay="auto"
        sx={{ 
          mb: 2,
          '& .MuiSlider-thumb': {
            backgroundColor: '#d72660',
            '&:hover': {
              boxShadow: '0 0 0 8px rgba(215, 38, 96, 0.2)',
            },
          },
          '& .MuiSlider-track': {
            backgroundColor: '#d72660',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#e0e0e0',
          },
        }}
      />
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#d72660' }}>
          {minRating} ★ and above
        </Typography>
      </Box>
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
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              color: '#d72660',
              mb: 2
            }}
          >
            Loading Products...
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Please wait while we fetch the latest collection
          </Typography>
        </Container>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              color: '#d72660',
              mb: 2
            }}
          >
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              bgcolor: '#d72660',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              '&:hover': {
                bgcolor: '#b71c4a'
              }
            }}
          >
            Try Again
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      position: 'relative'
    }}>
      {/* Background decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(135deg, rgba(215, 38, 96, 0.05) 0%, rgba(215, 38, 96, 0.02) 100%)',
        zIndex: 0
      }} />
      
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 900, 
              fontSize: { xs: '2.5rem', md: '3.5rem' }, 
              color: '#1a1a1a',
              mb: 2,
              background: 'linear-gradient(135deg, #d72660 0%, #b71c4a 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Discover Your Style
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#666',
              fontWeight: 400,
              mb: 3,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Explore our curated collection of premium footwear
          </Typography>
          
          {/* Search and Sort Bar */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2, 
            mb: 4, 
            alignItems: 'center', 
            justifyContent: 'center',
            maxWidth: '800px',
            mx: 'auto'
          }}>
            {isMobile && (
              <IconButton 
                onClick={() => setSidebarOpen(true)} 
                sx={{ 
                  mb: { xs: 1, sm: 0 },
                  bgcolor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: '#f8f9fa' }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <InputBase
              placeholder="Search for your perfect pair..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ 
                flex: 1, 
                bgcolor: 'white', 
                borderRadius: 3, 
                px: 3, 
                py: 1.5, 
                fontSize: '1.1rem', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '2px solid transparent',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  borderColor: '#d72660',
                  boxShadow: '0 6px 20px rgba(215, 38, 96, 0.2)'
                }
              }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <Select
                value={sortBy}
                displayEmpty
                onChange={e => setSortBy(e.target.value)}
                size="medium"
                sx={{
                  minWidth: 180,
                  height: 50,
                  bgcolor: 'white',
                  borderRadius: 3,
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#d72660',
                    boxShadow: '0 6px 20px rgba(215, 38, 96, 0.15)'
                  },
                  '.MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pl: 3,
                    fontWeight: 500
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { 
                      textAlign: 'center',
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                    }
                  }
                }}
              >
                <MenuItem value="" disabled>
                  <span style={{ color: '#888', fontWeight: 600 }}>Sort By</span>
                </MenuItem>
                <MenuItem value="priceLowHigh">Price: Low to High</MenuItem>
                <MenuItem value="priceHighLow">Price: High to Low</MenuItem>
                <MenuItem value="ratingLowHigh">Rating: Low to High</MenuItem>
                <MenuItem value="ratingHighLow">Rating: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Grid container spacing={4}>
          {/* Sidebar (desktop) */}
          {!isMobile && (
            <Grid item md={3}>
              {sidebar}
            </Grid>
          )}
          {/* Main content */}
          <Grid item xs={12} md={9}>
            {/* Mobile menu button */}
            {isMobile && (
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
                <IconButton 
                  onClick={() => setSidebarOpen(true)} 
                  sx={{ 
                    bgcolor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#f8f9fa' }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}
            {/* Sidebar drawer (mobile) */}
            <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
              {sidebar}
            </Drawer>
            {/* Products grid */}
            <Grid container spacing={4}>
              {filteredProducts.length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    px: 2
                  }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#666',
                        mb: 2
                      }}
                    >
                      No products found
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#888',
                        mb: 3,
                        maxWidth: '400px',
                        mx: 'auto'
                      }}
                    >
                      Try adjusting your filters or search terms to find what you're looking for.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSearch('');
                        setSelectedCategories([]);
                        setSelectedBrand('');
                        setPriceRange([minProductPrice, maxProductPrice]);
                        setMinRating(0);
                        setSortBy('');
                      }}
                      sx={{
                        borderColor: '#d72660',
                        color: '#d72660',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        '&:hover': {
                          borderColor: '#b71c4a',
                          backgroundColor: 'rgba(215, 38, 96, 0.1)'
                        }
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </Box>
                </Grid>
              ) : (
                filteredProducts.map((product) => {
                  const mainIdx = 0;
                  return (
                    <Grid item key={product._id} xs={12} sm={6} md={4} lg={4}>
                      <Card
                        sx={{
                          height: 450,
                          display: 'flex',
                          flexDirection: 'column',
                          bgcolor: 'white',
                          borderRadius: 3,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          p: 0,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 40px rgba(215, 38, 96, 0.15)',
                          },
                          overflow: 'hidden',
                          cursor: 'pointer',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(135deg, #d72660 0%, #b71c4a 100%)',
                            zIndex: 1
                          }
                        }}
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        <Box sx={{ 
                          position: 'relative',
                          p: 2,
                          bgcolor: '#fafafa',
                          minHeight: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CardMedia
                            component="img"
                            image={product.image}
                            alt={product.name}
                            sx={{ 
                              width: '100%',
                              height: 180, 
                              objectFit: 'contain',
                              borderRadius: 2,
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                          {/* Rating badge */}
                          <Box sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 700 }}>★</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                              {product.rating || 0}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <CardContent sx={{ 
                          flexGrow: 1, 
                          textAlign: 'left', 
                          p: 3,
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between'
                        }}>
                          <Box>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 800, 
                                color: '#1a1a1a', 
                                fontSize: '1.1rem',
                                mb: 1,
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {product.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#666',
                                mb: 2,
                                display: '-webkit-box', 
                                WebkitLineClamp: 2, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                lineHeight: 1.4
                              }}
                            >
                              {product.description}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <Rating 
                                value={product.rating || 0} 
                                precision={0.5} 
                                readOnly 
                                size="small"
                                sx={{ color: '#ffd700' }}
                              />
                              <Typography variant="body2" sx={{ color: '#888', fontWeight: 500 }}>
                                ({product.reviews || 0})
                              </Typography>
                            </Stack>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                fontWeight: 800, 
                                color: '#d72660',
                                fontSize: '1.3rem'
                              }}
                            >
                              Rs. {typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : 'N/A'}
                            </Typography>
                          </Box>
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