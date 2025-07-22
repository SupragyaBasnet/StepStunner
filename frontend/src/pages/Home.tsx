import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Container, Grid, Typography, Paper, Chip, CircularProgress } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import heroImage from '../assets/hero1.jpg';
import { products } from '../data/products';

// Import images with fallbacks
import sneakersImg from '../assets/Nike_Panda_Dunks_Shoe.png';
// Fallback images for heels and flats if they don't exist
const heelsImg = 'https://via.placeholder.com/300x200?text=Heels';
const flatsImg = 'https://via.placeholder.com/300x200?text=Flats';

const categories = [
  {
    name: 'Sneakers',
    image: sneakersImg,
    link: '/products?category=sneakers',
    description: 'Trendy, comfy, and perfect for every day.'
  },
  {
    name: 'Heels',
    image: heelsImg,
    link: '/products?category=heels',
    description: 'Elevate your style with our chic heels.'
  },
  {
    name: 'Flats',
    image: flatsImg,
    link: '/products?category=flats',
    description: 'Effortless comfort for every occasion.'
  },
];

const testimonials = [
  {
    name: 'Aarushi K.',
    comment: 'Absolutely love my new sneakers! Super comfy and stylish.',
  },
  {
    name: 'Riya S.',
    comment: 'The heels I bought are perfect for parties. Great quality!',
  },
  {
    name: 'Megha T.',
    comment: 'Flats are so comfortable for work. Will buy again!',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const res = await fetch('/api/products/trending');
        if (!res.ok) throw new Error('Failed to fetch trending products');
        const data = await res.json();
        setTrending(data);
      } catch (error) {
        console.error('Error fetching trending products:', error);
        setTrending([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: { xs: 480, md: 600 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: `linear-gradient(rgba(248, 225, 231, 0.6), rgba(246, 246, 246, 0.7)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          textAlign: 'center',
          py: 5,
          position: 'relative',
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, color: '#d72660', fontSize: { xs: '2.2rem', md: '3.2rem' }, textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}>
          Step Into Style
        </Typography>
        <Typography variant="h5" sx={{ color: '#222', mb: 4, fontWeight: 500, textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
          Discover the best in women's sneakers, heels, and flats
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ borderRadius: 8, px: 5, py: 1.5, fontWeight: 700, fontSize: '1.1rem', background: '#d72660', '&:hover': { background: '#b71c4a' } }}
          component={RouterLink}
          to="/products"
        >
          Shop Now
        </Button>
      </Box>

      {/* Category Highlights */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4} justifyContent="center">
          {categories.map((cat) => (
            <Grid item xs={12} sm={4} key={cat.name}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 5,
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.04)', boxShadow: '0 8px 32px 0 rgba(215,38,96,0.10)' },
                  cursor: 'pointer',
                }}
                onClick={() => navigate(cat.link)}
              >
                <Box
                  component="img"
                  src={cat.image}
                  alt={cat.name}
                  sx={{ width: '100%', height: 180, objectFit: 'contain', borderRadius: 3, mb: 2, bgcolor: '#f8f8f8' }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#d72660', mb: 1 }}>{cat.name}</Typography>
                <Typography variant="body2" color="text.secondary">{cat.description}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Trending Products */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 3, color: '#222' }}>
          Trending Now
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {trending.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 2px 16px 0 rgba(215,38,96,0.09)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.03)', boxShadow: '0 6px 24px 0 rgba(215,38,96,0.18)' },
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onClick={() => {
                    console.log('Navigating to product:', product._id);
                    navigate(`/products/${product._id}`);
                  }}
                >
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.name}
                    sx={{ 
                      height: 200, 
                      objectFit: 'contain', 
                      bgcolor: 'white', 
                      borderRadius: 2,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(215, 38, 96, 0.1)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        borderRadius: 2,
                      },
                      '&:hover::after': {
                        opacity: 1,
                      }
                    }}
                  />
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{product.name}</Typography>
                    <Chip label={product.category} sx={{ mb: 1, bgcolor: '#f8e1e7', color: '#d72660', fontWeight: 700 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{product.description}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#d72660' }}>Rs. {product.price?.toLocaleString('en-IN')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Why Shop With Us */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 3, color: '#222' }}>
          Why Shop With StepStunner?
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 4 }}>
              <Typography variant="h3" sx={{ color: '#d72660', fontWeight: 900 }}>★</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Curated Styles</Typography>
              <Typography variant="body2">Handpicked shoes for every mood and moment.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 4 }}>
              <Typography variant="h3" sx={{ color: '#d72660', fontWeight: 900 }}>🚚</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Fast Delivery</Typography>
              <Typography variant="body2">Swift, reliable shipping across Nepal.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 4 }}>
              <Typography variant="h3" sx={{ color: '#d72660', fontWeight: 900 }}>💬</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Personalized Support</Typography>
              <Typography variant="body2">Friendly help whenever you need it.</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonials */}
      <Box sx={{ bgcolor: '#f8e1e7', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 3, color: '#d72660' }}>
            What Our Customers Say
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 6, color: '#666', fontSize: '1.1rem' }}>
            Real reviews from real customers who love our shoes
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {testimonials.map((t, idx) => (
              <Grid item xs={12} sm={4} key={idx}>
                <Paper 
                  sx={{ 
                    p: 4, 
                    borderRadius: 4, 
                    textAlign: 'center', 
                    height: 280,
                    background: 'white',
                    boxShadow: '0 4px 20px rgba(215,38,96,0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(215,38,96,0.2)',
                    },
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography 
                    sx={{ 
                      position: 'absolute',
                      top: 10,
                      left: 20,
                      fontSize: '4rem',
                      color: '#f8e1e7',
                      fontFamily: 'serif',
                      lineHeight: 1,
                    }}
                  >
                    "
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <Typography key={i} sx={{ color: '#ffd700', fontSize: '1.2rem' }}>★</Typography>
                    ))}
                  </Box>
                  <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', color: '#333', fontSize: '1rem', lineHeight: 1.6 }}>
                    "{t.comment}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: '#d72660',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem'
                      }}
                    >
                      {t.name.charAt(0)}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#d72660' }}>
                      {t.name}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: '#d72660' }}>
          Find Your Perfect Pair Today
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          StepStunner brings you the latest in women's footwear. Shop now and step up your style!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/products"
          sx={{ mt: 3, fontWeight: 700, borderRadius: 7, px: 3, py: 1.35, fontSize: '1rem', backgroundColor: '#d72660', '&:hover': { backgroundColor: '#b71c4a' } }}
        >
          Browse All Shoes
        </Button>
      </Container>
    </Box>
  );
};

export default Home; 