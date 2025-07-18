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
  const [mainIdx, setMainIdx] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const { addToCart } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

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
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={product.image}
              alt={product.name || ""}
              sx={{
                width: 350,
                height: 350,
                borderRadius: 4,
                boxShadow: 3,
                mb: 2,
                objectFit: "contain",
                bgcolor: "white",
                p: 0,
                m: 0,
                display: "block",
              }}
            />
            {/* Thumbnails of related products removed for now (no products array) */}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" fontWeight={900} gutterBottom>
            {product.name || "Product Name"}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Rating
              value={product.rating}
              precision={0.5}
              readOnly
              size="medium"
            />
            <Typography variant="body2" color="text.secondary">
              ({product.reviews || 0})
            </Typography>
          </Stack>
          <Typography
            variant="h5"
            color="primary"
            fontWeight={700}
            sx={{ mb: 2 }}
          >
            Rs. {product.price ? product.price.toLocaleString("en-IN") : "N/A"}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {product.description || "No description available."}
          </Typography>
          <Typography variant="subtitle2" color="success.main" sx={{ mb: 2 }}>
            In Stock
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              sx={{ minWidth: 32, px: 0 }}
            >
              -
            </Button>
            <span
              style={{
                fontWeight: 500,
                margin: "0 16px",
                fontSize: "0.98rem",
                color: "#888",
              }}
            >
              Quantity: {quantity}
            </span>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 10}
              sx={{ minWidth: 32, px: 0 }}
            >
              +
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleAddToCart}
              sx={{
                mt: 1,
                fontWeight: 700,
                px: 3,
                py: 1.35,
                borderRadius: 7,
                width: 200,
                borderColor: "rgb(255,106,106)",
                color: "rgb(255,106,106)",
                "&:hover": {
                  borderColor: "rgb(255,100,100)",
                  backgroundColor: "rgba(220,80,80,0.20)",
                },
              }}
            >
              ADD TO CART
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                mt: 1,
                fontWeight: 700,
                borderRadius: 7,
                px: 3,
                py: 1.35,
                width: 200,
                backgroundColor: "rgb(255,106,106)",
                "&:hover": { backgroundColor: "rgb(220,80,80)" },
              }}
              size="small"
              onClick={() => {
                if (!product._id) {
                  setSnackbar({
                    open: true,
                    message:
                      "This product cannot be ordered. Please contact support.",
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
                        price: product.price,
                        total: product.price * quantity,
                      },
                    ],
                  },
                });
              }}
            >
              Buy Now
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Box
        sx={{
          position: "relative",
          bgcolor: "#FFF6F6",
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          my: 5,
          textAlign: "center",
          boxShadow: 2,
          maxWidth: 700,
          mx: "auto",
          overflow: "visible",
        }}
      >
        {/* Animated hearts left */}
        <FavoriteIcon
          sx={{
            position: "absolute",
            left: -32,
            top: 32,
            color: "#F46A6A",
            fontSize: 32,
            opacity: 0.7,
            animation: `${floatPop} 2.5s ease-in-out infinite`,
            animationDelay: "0s",
            display: { xs: "none", sm: "block" },
          }}
        />
        <FavoriteIcon
          sx={{
            position: "absolute",
            left: -24,
            bottom: 48,
            color: "#F46A6A",
            fontSize: 24,
            opacity: 0.6,
            animation: `${floatPop} 2.8s ease-in-out infinite`,
            animationDelay: "0.7s",
            display: { xs: "none", sm: "block" },
          }}
        />
        {/* Animated hearts right */}
        <FavoriteIcon
          sx={{
            position: "absolute",
            right: -32,
            top: 48,
            color: "#F46A6A",
            fontSize: 28,
            opacity: 0.7,
            animation: `${floatPop} 2.7s ease-in-out infinite`,
            animationDelay: "0.3s",
            display: { xs: "none", sm: "block" },
          }}
        />
        <FavoriteIcon
          sx={{
            position: "absolute",
            right: -24,
            bottom: 32,
            color: "#F46A6A",
            fontSize: 36,
            opacity: 0.6,
            animation: `${floatPop} 2.9s ease-in-out infinite`,
            animationDelay: "1.1s",
            display: { xs: "none", sm: "block" },
          }}
        />
        {/* Hearts row and heading as before */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          {[...Array(5)].map((_, i) => (
            <FavoriteIcon
              key={i}
              sx={{ color: "#F46A6A", mx: 0.5, fontSize: 28, opacity: 0.85 }}
            />
          ))}
        </Box>
        <Typography
          variant="h4"
          fontWeight={900}
          sx={{
            mb: 2,
            color: "#B22234",
            letterSpacing: "-1px",
            fontSize: { xs: "1.5rem", md: "2rem" },
          }}
        >
          Why This Gift is Special
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: "#B22234",
            fontWeight: 500,
            fontSize: { xs: "1.15rem", md: "1.35rem" },
            lineHeight: 1.7,
            maxWidth: 700,
            mx: "auto",
          }}
        >
          {getProductStory(product)}
        </Typography>
      </Box>
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
                    src={rel.image}
                    alt={rel.name}
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
