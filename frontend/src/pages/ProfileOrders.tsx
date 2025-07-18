import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
  Button,
  Rating,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }: any) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const statusColors: Record<string, string> = {
  Processing: "warning",
  Confirmed: "info",
  Delivered: "success",
  Cancelled: "error",
};

const ProfileOrders = () => {
  const { user } = useAuth() as any;
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewingOrder, setReviewingOrder] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const token = localStorage.getItem("stepstunnerToken");
        const res = await fetch("/api/products/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch order history");
        const orders = await res.json();
        setOrderHistory(orders);
      } catch (e) {
        console.error("Fetch orders error:", e);
        setOrderHistory([]);
      }
    };
    fetchOrderHistory();
  }, [user]);

  const handleExpandClick = (orderId: string) => {
    setExpanded(expanded === orderId ? null : orderId);
  };

  const handleLeaveReview = (orderId: string) => {
    const order = orderHistory.find(o => o._id === orderId);
    setReviewingOrder(orderId);
    setReviewRating(order?.rating || null);
    setReviewText(order?.review || "");
  };

  const handleSubmitReview = async (orderId: string) => {
    if (!reviewRating || !reviewText.trim()) return;
    
    setIsSubmitting(true);
    try {
              const token = localStorage.getItem("stepstunnerToken");
      const res = await fetch(`/api/products/orders/${orderId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ review: reviewText, rating: reviewRating }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }
      
      const updatedOrder = await res.json();
      
      // Update the order in the local state
      setOrderHistory(prev => prev.map(order => 
        order._id === orderId ? updatedOrder : order
      ));
      
      setSnackbar({
        open: true,
        message: 'Review submitted successfully!',
        severity: 'success'
      });
      // Trigger product refresh for product cards
              localStorage.setItem('stepstunnerProductsRefresh', 'true');
      // Reset review form
      setReviewingOrder(null);
      setReviewRating(null);
      setReviewText("");
      
    } catch (error: any) {
      console.error('Review submission error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit review. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Paper
    sx={{
      borderRadius: 5,
      p: 4,
      minWidth: 350,
      maxWidth: 520,
      minHeight: 560,
      maxHeight: 560, // Fix the height
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      mx: "auto",
      width: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ flexShrink: 0 }}>
        Order History
      </Typography>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pr: 1,
        }}
      >
        {orderHistory.length === 0 ? (
          <Typography variant="body1" align="center">
            No orders found.
          </Typography>
        ) : (
          orderHistory.map((order: any) => (
            <Card
              key={order._id}
              sx={{
                mb: 3,
                borderRadius: 5,
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ flex: 1 }}>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </Typography>
                  <Chip
                    label={order.status || "Confirmed"}
                    color={
                      (statusColors[order.status || "Confirmed"] as any) ||
                      "default"
                    }
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>Address:</b> {order.address}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>Payment:</b> {order.paymentMethod}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>Total:</b> Rs {order.total?.toFixed(2)}
                </Typography>
               {order.review && order.rating ? (
                 <Box sx={{ mt: 1, mb: 1 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                     <Rating value={order.rating} readOnly size="small" />
                     <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                       {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
                     </Typography>
                   </Box>
                   <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                     "{order.review}"
                   </Typography>
                   <Button
                     variant="outlined"
                     size="small"
                     sx={{
                       borderRadius: 3,
                       textTransform: 'none',
                       fontWeight: 600,
                       borderColor: 'rgb(255,106,106)',
                       color: 'rgb(255,106,106)',
                       '&:hover': { 
                         borderColor: 'rgb(235,86,86)',
                         backgroundColor: 'rgba(255,106,106,0.04)'
                       },
                     }}
                     onClick={() => handleLeaveReview(order._id)}
                   >
                     Edit Review
                   </Button>
                 </Box>
               ) : (
                 <Button
                   variant="contained"
                   startIcon={<span style={{ color: '#fff', fontSize: 18 }}>★</span>}
                   size="small"
                   sx={{
                     mt: 1, mb: 1,
                     background: 'rgb(255,106,106)',
                     borderRadius: 3,
                     textTransform: 'none',
                     fontWeight: 600,
                     '&:hover': { background: 'rgb(235,86,86)' },
                   }}
                   onClick={() => handleLeaveReview(order._id)}
                 >
                   Leave Review
                 </Button>
               )}
               {reviewingOrder === order._id && (
                 <Box
                   sx={{
                     mt: 2,
                     mb: 1,
                     p: 2,
                     borderRadius: 3,
                     background: '#fff6f6',
                     boxShadow: '0 2px 8px rgba(255,106,106,0.08)',
                     display: 'flex',
                     flexDirection: 'column',
                     gap: 1.5,
                   }}
                 >
                   <Typography fontWeight={600} sx={{ mb: 1 }}>
                     {reviewRating && reviewText ? 'Edit Review' : 'Leave a Review'}
                   </Typography>
                   <Rating
                     value={reviewRating}
                     onChange={(_, newValue) => setReviewRating(newValue)}
                     sx={{ mb: 1 }}
                   />
                   <TextField
                     multiline
                     minRows={2}
                     maxRows={4}
                     fullWidth
                     placeholder="Write your review..."
                     value={reviewText}
                     onChange={e => setReviewText(e.target.value)}
                     variant="outlined"
                     sx={{ background: '#fff', borderRadius: 2 }}
                   />
                   <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                     <Button
                       variant="contained"
                       size="small"
                       sx={{
                         background: 'rgb(255,106,106)',
                         borderRadius: 3,
                         textTransform: 'none',
                         fontWeight: 600,
                         '&:hover': { background: 'rgb(235,86,86)' },
                       }}
                       onClick={() => handleSubmitReview(order._id)}
                       disabled={!reviewRating || !reviewText.trim() || isSubmitting}
                     >
                       {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (reviewRating && reviewText ? 'Update Review' : 'Submit Review')}
                     </Button>
                     <Button
                       variant="outlined"
                       size="small"
                       sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                       onClick={() => setReviewingOrder(null)}
                     >
                       Cancel
                     </Button>
                   </Box>
                 </Box>
               )}
              </CardContent>
              <CardActions disableSpacing>
                <ExpandMore
                  expand={expanded === order._id}
                  onClick={() => handleExpandClick(order._id)}
                  aria-expanded={expanded === order._id}
                  aria-label="show more"
                >
                  <Tooltip
                    title={expanded === order._id ? "Hide Items" : "Show Items"}
                  >
                    <ExpandMoreIcon />
                  </Tooltip>
                </ExpandMore>
              </CardActions>
              <Collapse in={expanded === order._id} timeout="auto" unmountOnExit>
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Items
                  </Typography>
                  <List>
                    {order.items.map((item: any, idx: number) => (
                      <React.Fragment
                        key={item.customizationId || item.product || idx}
                      >
                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar
                              src={item.image}
                              variant="rounded"
                              sx={{ width: 56, height: 56, mr: 2 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <span style={{ fontWeight: 600 }}>
                                {item.name || "Product"}
                              </span>
                            }
                            secondary={
                              <>
                                <span>
                                  Qty: {item.quantity} &nbsp;|&nbsp; Rs{" "}
                                  {item.price?.toFixed(2)}
                                </span>
                                {item.customization && (
                                  <>
                                    <br />
                                    <span style={{ color: "#888" }}>
                                      Custom: {JSON.stringify(item.customization)}
                                    </span>
                                  </>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        {idx < order.items.length - 1 && (
                          <Divider component="li" />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Collapse>
            </Card>
          ))
        )}
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ProfileOrders;
