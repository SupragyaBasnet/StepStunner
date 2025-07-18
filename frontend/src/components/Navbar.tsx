import {
  AccountCircle,
  Home,
  InfoOutlined,
  Menu as MenuIcon,
  PersonAdd,
  ShoppingCart,
  Storefront,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  List as MuiList,
  ListItem as MuiListItem,
  Popover,
  Toolbar,
  Typography,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import nikeLogo from "../assets/Nike Panda Dunks Shoe .jpg";
import adidasLogo from "../assets/Pink adidas sambas.jpg";
import converseLogo from "../assets/Converse Chuck Taylor All Star Madison Mid Lilac .jpg";
import vansLogo from "../assets/Vans Caldrone Sneaker .jpg";
import jimmyChooLogo from "../assets/heels/Jimmy Choo us.jpg";
import steveMaddenLogo from "../assets/heels/Steve Madden Eryka Ankle Strap Sandal in Multi Leather at Nordstrom Rack.jpg";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [productsAnchorEl, setProductsAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const productsMenuOpen = Boolean(productsAnchorEl);
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
    handleClose();
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };
  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleProductsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProductsAnchorEl(event.currentTarget);
  };
  const handleProductsMenuClose = () => {
    setProductsAnchorEl(null);
  };

  // Drawer navigation items
  const drawerNav = (
    <Box
      sx={{ width: 260 }}
      role="presentation"
      onClick={() => setDrawerOpen(false)}
    >
      <MuiList>
        <MuiListItem button component={RouterLink} to="/">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </MuiListItem>
        <MuiListItem>
          <ListItemIcon>
            <Storefront />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </MuiListItem>
        {/* Products mega menu as vertical list */}
        <Box sx={{ pl: 4 }}>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=sneakers"
          >
            <ListItemText primary="Sneakers" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=heels"
          >
            <ListItemText primary="Heels" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=mugs"
          >
            <ListItemText primary="Mugs" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=tshirts"
          >
            <ListItemText primary="T-Shirts" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=phonecases"
          >
            <ListItemText primary="Phone Cases" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=frames"
          >
            <ListItemText primary="Photo Frames" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=pillowcases"
          >
            <ListItemText primary="Pillow Cases" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=waterbottles"
          >
            <ListItemText primary="Water Bottles" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=notebooks"
          >
            <ListItemText primary="Notebook" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=pens"
          >
            <ListItemText primary="Pen" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=bags"
          >
            <ListItemText primary="Bag" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=caps"
          >
            <ListItemText primary="Cap" />
          </MuiListItem>
          <MuiListItem
            button
            component={RouterLink}
            to="/products?category=calendars"
          >
            <ListItemText primary="Calendar" />
          </MuiListItem>
          <MuiListItem button component={RouterLink} to="/products">
            <ListItemText primary="All Products" />
          </MuiListItem>
        </Box>

        <MuiListItem button component={RouterLink} to="/about">
          <ListItemIcon>
            <InfoOutlined />
          </ListItemIcon>
          <ListItemText primary="About Us" />
        </MuiListItem>
        {user && (
          <MuiListItem button component={RouterLink} to="/cart">
            <ListItemIcon>
              <ShoppingCart />
            </ListItemIcon>
            <ListItemText primary="Cart" />
          </MuiListItem>
        )}
        {user ? (
          <MuiListItem button component={RouterLink} to="/profile">
            <ListItemIcon>
              <Avatar src={user?.profileImage || undefined}>
                {!user?.profileImage && user?.name?.charAt(0)}
              </Avatar>
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </MuiListItem>
        ) : (
          <>
            <MuiListItem button component={RouterLink} to="/login">
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </MuiListItem>
            <MuiListItem button component={RouterLink} to="/register">
              <ListItemIcon>
                <PersonAdd />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </MuiListItem>
          </>
        )}
      </MuiList>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      sx={{ bgcolor: "white", color: "black", boxShadow: 2 }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 0.5,
              width: 60,
              height: 60,
              borderRadius: "50%",
              // bgcolor: "#f8e1e7",
              // border: "2px solid #d72660",
            }}
          >
            <img
              src={logo}
              alt="StepStunner Logo"
              style={{ height: 50, width: 50, objectFit: "contain", borderRadius: "50%",border: "2px solid #d72660" }}
            />
          </Box>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: "none",
              color: "#d72660",
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: "1.35rem",
            }}
          >
            StepStunner
          </Typography>
        </Box>

        {isMobile ? (
          <Box
            sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}
          >
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              {drawerNav}
            </Drawer>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                flexGrow: 1,
                justifyContent: "center",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Button
                component={RouterLink}
                to="/"
                color="inherit"
                startIcon={<Home />}
                sx={{
                  borderBottom: isActive("/") ? "2px solid black" : "none",
                  borderRadius: 0,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/products"
                color="inherit"
                startIcon={<Storefront />}
                sx={{
                  borderBottom: isActive("/products")
                    ? "2px solid black"
                    : "none",
                  borderRadius: 0,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  },
                }}
                onMouseEnter={handleProductsMenuOpen}
                onClick={handleProductsMenuOpen}
                aria-owns={productsMenuOpen ? "products-mega-menu" : undefined}
                aria-haspopup="true"
              >
                Products
              </Button>
              <Button
                component={RouterLink}
                to="/about"
                color="inherit"
                startIcon={<InfoOutlined />}
                sx={{
                  borderBottom: isActive("/about") ? "2px solid black" : "none",
                  borderRadius: 0,
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.05)" },
                }}
              >
                About Us
              </Button>

              <Popover
                id="products-mega-menu"
                open={productsMenuOpen}
                anchorEl={productsAnchorEl}
                onClose={handleProductsMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                PaperProps={{
                  onMouseEnter: () => setProductsAnchorEl(productsAnchorEl),
                  onMouseLeave: handleProductsMenuClose,
                  sx: { minWidth: 350, p: 2, boxShadow: 4 },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    sx={{ color: '#d72660', mb: 2 }}
                  >
                    Footwear Categories
                  </Typography>
                  
                  {/* Sneakers Section */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#333' }}>
                      Sneakers
                    </Typography>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=sneakers&brand=nike';
                          }}
                        >
                          Nike
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=sneakers&brand=adidas';
                          }}
                        >
                          Adidas
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=sneakers&brand=converse';
                          }}
                        >
                          Converse
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=sneakers&brand=vans';
                          }}
                        >
                          Vans
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=sneakers&brand=calvin-klein';
                          }}
                        >
                          Calvin Klein
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=sneakers&brand=louis-vuitton';
                          }}
                        >
                          Louis Vuitton
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Heels Section */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#333' }}>
                      Heels
                    </Typography>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=heels&brand=jimmy-choo';
                          }}
                        >
                          Jimmy Choo
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=heels&brand=steve-madden';
                          }}
                        >
                          Steve Madden
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=heels&brand=sloyan';
                          }}
                        >
                          Sloyan
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=heels&brand=jypsey';
                          }}
                        >
                          JYPSEY
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Flats Section */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#333' }}>
                      Flats
                    </Typography>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=flats&brand=charles-keith';
                          }}
                        >
                          Charles & Keith
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=flats&brand=louis-vuitton';
                          }}
                        >
                          Louis Vuitton
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=flats&brand=odyssey';
                          }}
                        >
                          ODYSSEY
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            borderColor: '#d72660',
                            color: '#d72660',
                            '&:hover': { 
                              bgcolor: '#f8e1e7',
                              borderColor: '#b71c4a'
                            }
                          }}
                          onClick={() => {
                            handleProductsMenuClose();
                            window.location.href = '/products?category=flats&brand=babudog';
                          }}
                        >
                          BABUDOG
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <List dense disablePadding>
                    <ListItem
                      button
                      component={RouterLink}
                      to="/products?category=sneakers"
                      onClick={handleProductsMenuClose}
                      sx={{ 
                        borderRadius: 2, 
                        mb: 1,
                        '&:hover': { bgcolor: '#f8e1e7' }
                      }}
                    >
                      <ListItemText 
                        primary="All Sneakers" 
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontWeight: 600,
                            fontSize: '1rem'
                          } 
                        }}
                      />
                    </ListItem>
                    <ListItem
                      button
                      component={RouterLink}
                      to="/products?category=heels"
                      onClick={handleProductsMenuClose}
                      sx={{ 
                        borderRadius: 2, 
                        mb: 1,
                        '&:hover': { bgcolor: '#f8e1e7' }
                      }}
                    >
                      <ListItemText 
                        primary="All Heels" 
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontWeight: 600,
                            fontSize: '1rem'
                          } 
                        }}
                      />
                    </ListItem>
                    <ListItem
                      button
                      component={RouterLink}
                      to="/products?category=flats"
                      onClick={handleProductsMenuClose}
                      sx={{ 
                        borderRadius: 2, 
                        mb: 1,
                        '&:hover': { bgcolor: '#f8e1e7' }
                      }}
                    >
                      <ListItemText 
                        primary="All Flats" 
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontWeight: 600,
                            fontSize: '1rem'
                          } 
                        }}
                      />
                    </ListItem>
                    <ListItem
                      button
                      component={RouterLink}
                      to="/products"
                      onClick={handleProductsMenuClose}
                      sx={{ 
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#f8e1e7' }
                      }}
                    >
                      <ListItemText 
                        primary="View All Shoes" 
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: '#d72660'
                          } 
                        }}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Popover>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {user && (
                <IconButton
                  component={RouterLink}
                  to="/cart"
                  color="inherit"
                  sx={{
                    borderBottom: isActive("/cart")
                      ? "2px solid black"
                      : "none",
                    borderRadius: 0,
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  <Badge badgeContent={cartItems.length} color="error">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              )}
              {user ? (
                <>
                  <IconButton
                    size="large"
                    onClick={handleMenu}
                    color="inherit"
                    sx={{
                      borderBottom: isActive("/profile")
                        ? "2px solid black"
                        : "none",
                      borderRadius: 0,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      },
                    }}
                  >
                    <Avatar src={user?.profileImage || undefined}>
                      {!user?.profileImage && user?.name?.charAt(0)}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem
                      component={RouterLink}
                      to="/profile"
                      onClick={handleClose}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    color="inherit"
                    startIcon={<AccountCircle />}
                    sx={{
                      borderBottom: isActive("/login")
                        ? "2px solid black"
                        : "none",
                      borderRadius: 0,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    color="inherit"
                    startIcon={<PersonAdd />}
                    sx={{
                      borderBottom: isActive("/register")
                        ? "2px solid black"
                        : "none",
                      borderRadius: 0,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      },
                    }}
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Box>
          </>
        )}
      </Toolbar>
      {/* Logout confirmation dialog */}
      <Dialog open={showLogoutDialog} onClose={cancelLogout}>
        <DialogTitle>Logout</DialogTitle>
        <DialogContent>
          <Typography>Do you want to logout?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button color="error" variant="contained" onClick={confirmLogout}>Yes</Button>
          <Button onClick={cancelLogout}>No</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;
