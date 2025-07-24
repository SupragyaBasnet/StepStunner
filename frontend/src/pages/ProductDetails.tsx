import FavoriteIcon from "@mui/icons-material/Favorite";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { keyframes } from "@mui/system";
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Product } from "../data/products";
import { getImagePath, getFallbackImage } from "../utils/imageUtils";

function getProductStory(product: Product) {
  const uniqueDescriptions: Record<number, string> = {
    1: "This classic custom t-shirt is a wearable memory—perfect for birthdays, reunions, or just because. Every design tells a story only you can create.",
    13: "Premium cotton, premium memories. This t-shirt is for those who want comfort and style, wrapped in a personal touch.",
    14: "Vintage style meets modern sentiment. Gift a t-shirt that brings nostalgia and new memories together in one unique piece.",
    37: "Oversized for comfort, customized for personality. This t-shirt is a cozy canvas for your creativity.",
    38: "Athletic and personal—this t-shirt is for the go-getter who loves a custom touch on their activewear.",
    2: "Every sip from this classic mug is a reminder of your thoughtfulness. Perfect for coffee lovers and tea enthusiasts alike.",
    15: "A premium ceramic mug for premium moments. Make every coffee break special with a design that's uniquely theirs.",
    16: "Travel in style and sentiment. This mug keeps drinks warm and memories close, wherever they go.",
    3: "A phone case that's as unique as they are. Protect their phone and showcase your creativity every day.",
    17: "Premium protection, premium personalization. This phone case is a daily reminder of your special bond.",
    18: "Minimalist design, maximum meaning. Gift a phone case that's both stylish and sentimental.",
    46: "Signature style, signature memories. This case is for those who want their phone to stand out and feel personal.",
    47: "A water bottle that keeps them hydrated and connected to you. Perfect for busy days and thoughtful moments.",
    19: "Double-walled and double the love. This bottle is a practical gift with a personal twist.",
    20: "Sports-style and full of spirit. This bottle is for the active soul who loves a custom touch.",
    88: "Space-saving, heart-filling. This bottle is a unique way to show you care, every single day.",
    89: "A gift set mug for those who love a coordinated touch. Every piece is a reminder of your thoughtful gesture.",
    48: "Hand-painted and heartfelt. This artistic mug is a one-of-a-kind gift for a one-of-a-kind person.",
    5: "A classic cap for classic memories. Personalize it for a gift they'll wear with pride.",
    21: "Premium embroidery, premium memories. This cap is a stylish way to show you care.",
    22: "Sports cap for sporty spirits. Add a custom design for a gift that's both fun and functional.",
    49: "Snapback style, snapback memories. This cap is a trendy way to keep your bond close.",
    6: "A premium notebook for premium thoughts. Personalize it for a gift that inspires creativity.",
    23: "High-quality paper, high-quality memories. This notebook is perfect for dreamers and planners alike.",
    24: "A couple's notebook for shared dreams and stories. Personalize it for a truly unique gift.",
    52: "Leather cover, lasting memories. This notebook is a luxurious way to keep your thoughts safe.",
    53: "Compact and custom. This notebook is perfect for notes on the go, with a personal touch.",
    7: "A basic pen with a not-so-basic meaning. Personalize it for a daily reminder of your support.",
    25: "Premium pen for premium words. Engrave it with a name or message for a truly special gift.",
    26: "A gift pen set for those who love to write. Every word becomes more meaningful with a personal touch.",
    27: "A premium keychain for premium memories. Personalize it for a gift they'll carry everywhere.",
    28: "A photo keychain to keep your favorite moments close. Every glance is a reminder of your bond.",
    58: "A company logo keychain for professional pride. Personalize it for a thoughtful business gift.",
    59: "A star metal keychain for the star in your life. Custom artwork makes it truly unique.",
    60: "A rectangle metal keychain for classic style and custom engraving. A small gift with big meaning.",
    9: "A classic photo frame for classic memories. Personalize it to showcase your favorite moments.",
    29: "Premium wood, premium memories. This frame is a beautiful way to display your love.",
    30: "A digital photo frame for ever-changing memories. Load it with photos for a gift that keeps on giving.",
    61: "A collage frame for a collage of memories. Personalize it for a truly unique display.",
    64: "A silk pillowcase for sweet dreams and custom comfort. Personalize it for a gift that's both practical and heartfelt.",
    65: "A pink silk pillowcase for a touch of luxury and love. Perfect for special occasions.",
    66: "A couple pictured pillowcase for shared dreams. Personalize it for a gift that celebrates togetherness.",
    67: "A heart-shaped pillowcase for heartfelt comfort. Every night is a reminder of your care.",
    68: "An emoji pillowcase for fun and comfort. Personalize it for a gift that brings smiles.",
    69: "A star-shaped emoji pillowcase for playful dreams. Custom design makes it extra special.",
    70: "A silk pillowcase for luxurious comfort and sweet memories. Personalize it for a truly thoughtful gift.",
  };
  if (uniqueDescriptions[product.id]) {
    return uniqueDescriptions[product.id];
  }
  switch (product.category) {
    case "tshirts":
      return "A custom t-shirt is more than just clothing—it's a canvas for memories, inside jokes, and love. Every time they wear it, they'll feel your thoughtfulness close to their heart.";
    case "mugs":
      return "A personalized mug turns every morning into a moment of connection. With every sip, your loved one will remember the warmth of your gesture.";
    case "phonecases":
      return "A custom phone case is a daily companion, a reminder of your bond and creativity. It protects their phone and carries your message everywhere they go.";
    case "waterbottles":
      return "A personalized water bottle is a gift of care—keeping them refreshed and reminding them of you with every sip, wherever life takes them.";
    case "caps":
      return "A custom cap is a stylish way to say you care. Every time they step out, they'll carry a piece of your affection and personality.";
    case "notebooks":
      return "A custom notebook is a place for dreams, plans, and memories. Every page turned is a new chapter in your shared story.";
    case "pens":
      return "A personalized pen is more than a writing tool—it's a way to inspire, encourage, and remind them of your support with every word they write.";
    case "keychains":
      return "A custom keychain is a small treasure that keeps you close, no matter where they go. It's a daily reminder of your special connection.";
    case "frames":
      return "A custom photo frame turns moments into memories. It's a window to the happiest times, beautifully displayed for all to see.";
    case "pillowcases":
      return "A personalized pillowcase brings comfort and warmth, wrapping your loved one in sweet dreams and the memory of your care.";
    default:
      return "A personalized gift is a story waiting to be told—a memory in the making, a gesture that lasts a lifetime.";
  }
}

// Define keyframes for floating/popping animation
const floatPop = keyframes`
  0% { transform: scale(0.8) translateY(0); opacity: 0.7; }
  30% { transform: scale(1.1) translateY(-10px); opacity: 1; }
  60% { transform: scale(1) translateY(-20px); opacity: 0.85; }
  100% { transform: scale(0.8) translateY(0); opacity: 0.7; }
`;

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [mainIdx, setMainIdx] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const { addToCart } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Available shoe sizes
  const availableSizes = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const backendProduct = await res.json();
        setProduct(backendProduct);
      } catch (e) {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Listen for review-triggered refresh
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
              if (e.key === 'stepstunnerProductsRefresh' && e.newValue === 'true') {
        // Refetch product data
        setLoading(true);
        fetch(`/api/products/${id}`)
          .then(res => res.json())
          .then(backendProduct => setProduct(backendProduct))
          .catch(() => setError("Product not found"))
          .finally(() => setLoading(false));
                  localStorage.setItem('stepstunnerProductsRefresh', 'false');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [id]);

  useEffect(() => {
    if (product && product.category && product._id) {
      const fetchRelated = async () => {
        try {
          const res = await fetch("/api/products");
          if (!res.ok) return;
          const all = await res.json();
          const related = all
            .filter(
              (p: any) =>
                p.category &&
                product.category &&
                p.category.toLowerCase().replace(/s$/, "") ===
                  product.category.toLowerCase().replace(/s$/, "") &&
                p._id !== product._id
            )
            .slice(0, 4);
          setRelatedProducts(related);
        } catch {}
      };
      fetchRelated();
    }
  }, [product]);

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => {
      const newVal = Math.max(1, Math.min(10, prev + amount));
      console.log("Quantity changed (button):", newVal);
      return newVal;
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      const isLoggedIn = localStorage.getItem("stepstunnerUser");
      if (!isLoggedIn) {
        setSnackbar({
          open: true,
          message: "Please log in to add to cart.",
          severity: "error",
        });
        navigate("/login");
        return;
      }
      // Always use MongoDB _id
      const productId = product._id;
      await addToCart(
        {
          id: productId,
          cartItemId: `${productId}-${Date.now()}`,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          description: product.description,
        },
        quantity
      );
      setSnackbar({
        open: true,
        message: "Added to cart!",
        severity: "success",
      });
      navigate("/cart");
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to add to cart.",
        severity: "error",
      });
    }
  };

  const handleProceedToCheckout = async () => {
    if (!product) return;
    try {
      const isLoggedIn = localStorage.getItem("stepstunnerUser");
      if (!isLoggedIn) {
        setSnackbar({
          open: true,
          message: "Please log in to proceed to checkout.",
          severity: "error",
        });
        navigate("/login");
        return;
      }
      const productId = product._id;
      await addToCart(
        {
          id: productId,
          cartItemId: `${productId}-checkout-${Date.now()}`,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          description: product.description,
        },
        quantity
      );
      setSnackbar({
        open: true,
        message: "Proceeding to checkout...",
        severity: "success",
      });
      setTimeout(() => {
        navigate(`/checkout?singleItemId=${productId}`);
      }, 800);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to proceed to checkout.",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Loading...
        </Typography>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Error: {error || "Product not found"}
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained">
          Back to Products
        </Button>
      </Container>
    );
  }

  const images =
    product && product.images && product.images.length > 0
      ? product.images
      : [product?.image || ""];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "sticky",
              top: 20,
            }}
          >
            <Box
              component="img"
              src={getImagePath(product.image)}
              alt={product.name || ""}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getFallbackImage();
              }}
              sx={{
                width: "100%",
                maxWidth: 450,
                height: 450,
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                objectFit: "contain",
                bgcolor: "white",
                p: 2,
                border: "1px solid #f0f0f0",
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ pl: { md: 2 } }}>
            <Typography 
              variant="h3" 
              fontWeight={800} 
              gutterBottom
              sx={{ 
                color: '#333',
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                lineHeight: 1.2,
                mb: 2
              }}
            >
              {product.name || "Product Name"}
            </Typography>
            
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <Rating
                value={product.rating || 0}
                precision={0.5}
                readOnly
                size="large"
                sx={{ color: '#ffd700' }}
              />
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                ({product.reviews || 0} reviews)
              </Typography>
            </Stack>
            
            <Typography
              variant="h4"
              sx={{ 
                mb: 3,
                color: "#d72660",
                fontWeight: 800,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Rs. {product.price ? product.price.toLocaleString("en-IN") : "N/A"}
            </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              color: '#666',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              fontWeight: 400
            }}
          >
            {product.description || "No description available."}
          </Typography>
          <Typography variant="subtitle2" color="success.main" sx={{ mb: 3, fontWeight: 600 }}>
            ✓ In Stock
          </Typography>
          
          {/* Size Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
              Select Size
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableSizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setSelectedSize(size)}
                  sx={{
                    minWidth: 50,
                    height: 40,
                    borderRadius: 2,
                    borderColor: selectedSize === size ? '#d72660' : '#ddd',
                    backgroundColor: selectedSize === size ? '#d72660' : 'transparent',
                    color: selectedSize === size ? 'white' : '#333',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#d72660',
                      backgroundColor: selectedSize === size ? '#b71c4a' : 'rgba(215, 38, 96, 0.1)',
                    },
                  }}
                >
                  {size}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Quantity Selector */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mr: 2, fontWeight: 600, color: '#333' }}>
              Quantity:
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              sx={{ 
                minWidth: 40, 
                height: 40,
                borderRadius: 2,
                borderColor: '#d72660',
                color: '#d72660',
                '&:hover': {
                  borderColor: '#b71c4a',
                  backgroundColor: 'rgba(215, 38, 96, 0.1)',
                },
                '&:disabled': {
                  borderColor: '#ccc',
                  color: '#ccc',
                }
              }}
            >
              -
            </Button>
            <Typography
              sx={{
                fontWeight: 600,
                margin: "0 16px",
                fontSize: "1.1rem",
                color: "#333",
                minWidth: 30,
                textAlign: 'center'
              }}
            >
              {quantity}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 10}
              sx={{ 
                minWidth: 40, 
                height: 40,
                borderRadius: 2,
                borderColor: '#d72660',
                color: '#d72660',
                '&:hover': {
                  borderColor: '#b71c4a',
                  backgroundColor: 'rgba(215, 38, 96, 0.1)',
                },
                '&:disabled': {
                  borderColor: '#ccc',
                  color: '#ccc',
                }
              }}
            >
              +
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleAddToCart}
              disabled={!selectedSize}
              sx={{
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                flex: 1,
                borderColor: "#d72660",
                color: "#d72660",
                fontSize: '1rem',
                height: 50,
                "&:hover": {
                  borderColor: "#b71c4a",
                  backgroundColor: "rgba(215, 38, 96, 0.1)",
                },
                "&:disabled": {
                  borderColor: "#ccc",
                  color: "#ccc",
                  cursor: "not-allowed",
                },
              }}
            >
              {!selectedSize ? "Select Size First" : "ADD TO CART"}
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                if (!selectedSize) {
                  setSnackbar({
                    open: true,
                    message: "Please select a size first.",
                    severity: "error",
                  });
                  return;
                }
                if (!product._id) {
                  setSnackbar({
                    open: true,
                    message: "This product cannot be ordered. Please contact support.",
                    severity: "error",
                  });
                  return;
                }
                navigate(`/checkout?singleItemId=${product._id}`, {
                  state: {
                    items: [
                      {
                        ...product,
                        _id: product._id,
                        quantity,
                        size: selectedSize,
                        price: product.price,
                        total: product.price * quantity,
                      },
                    ],
                  },
                });
              }}
              sx={{
                fontWeight: 700,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                flex: 1,
                backgroundColor: "#d72660",
                fontSize: '1rem',
                height: 50,
                "&:hover": { 
                  backgroundColor: "#b71c4a",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(215, 38, 96, 0.3)",
                },
                transition: "all 0.2s ease",
              }}
            >
              BUY NOW
            </Button>
          </Box>
          </Box>
        </Grid>
      </Grid>
      {/* Related Products */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Related Products
        </Typography>
        <Grid container spacing={3}>
          {relatedProducts.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary">
                No related products found.
              </Typography>
            </Grid>
          ) : (
            relatedProducts.map((rel) => (
              <Grid item xs={12} sm={6} md={3} key={rel._id}>
                <Paper
                  component={RouterLink}
                  to={`/products/${rel._id}`}
                  sx={{
                    p: 2,
                    textDecoration: "none",
                    borderRadius: 3,
                    boxShadow: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px) scale(1.03)",
                      boxShadow: 4,
                    },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    minWidth: 180,
                    maxWidth: 220,
                    minHeight: 220,
                    maxHeight: 260,
                    mx: "auto",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={getImagePath(rel.image)}
                    alt={rel.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getFallbackImage();
                    }}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: "contain",
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: "white",
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    align="center"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                    }}
                  >
                    {rel.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      textAlign: "center",
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rel.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary"
                    align="center"
                  >
                    Rs. {rel.price?.toLocaleString("en-IN") ?? "N/A"}
                  </Typography>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetails;

if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `;
  document.head.appendChild(style);
}
