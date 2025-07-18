import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { products, Product } from '../data/products';

interface CartItem {
  customization: any;
  customizationId: any;
  id: string; // product id
  cartItemId: string; // cart item id
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  description?: string;
  type?: string; // Added for custom products
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!user) return setCartItems([]);
  
    const token = localStorage.getItem('stepstunnerToken');
    const res = await fetch('/api/auth/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (!res.ok) {
      console.error('Failed to fetch cart:', res.status);
      setCartItems([]);
      return;
    }
  
    let data = await res.json();
    console.log('Raw cart data from backend:', data);
  
    // 🆕 Merge duplicate products by product._id or customizationId
    const mergedItems: Record<string, any> = {};
  
    data.forEach((item: any) => {
      const productId = item.product?._id || item.customizationId;
  
      if (mergedItems[productId]) {
        // Sum quantities if duplicate
        mergedItems[productId].quantity += item.quantity;
      } else {
        // Clone item into mergedItems
        mergedItems[productId] = { ...item };
      }
    });
  
    const mergedData = Object.values(mergedItems);
  
    const mappedCartItems = mergedData.map((item: any) => {
      if (item.product) {
        const backendProduct = item.product;
  
        // Get fallback image and price from local products array
        const localProduct = products.find(
          (p: Product) => String(p.id) === String(backendProduct._id)
        ) || products.find(
          (p: Product) => p.name === backendProduct.name && p.category === backendProduct.category
        );
  
        const image = backendProduct.image || localProduct?.image || '/placeholder.png';
        const price = backendProduct.price ?? localProduct?.price ?? 0;
  
        return {
          id: backendProduct._id,
          cartItemId: item._id || item.customizationId,
          name: backendProduct.name,
          price,
          image,
          quantity: item.quantity,
          category: backendProduct.category,
          description: backendProduct.description,
          customization: null,
          customizationId: null,
          type: 'normal',
        };
      } else {
        // Handle customization items
        return {
          id: item.customizationId,
          cartItemId: item.customizationId,
          name: item.category
            ? `Custom ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}`
            : 'Custom Product',
          price: item.price,
          image: item.image || '/placeholder.png',
          quantity: item.quantity,
          category: item.category,
          description: 'Product',
          customization: item.customization || null,
          customizationId: item.customizationId,
          type: 'custom',
        };
      }
    });
  
    setCartItems(mappedCartItems);
    console.log('Cart items after merging duplicates:', mappedCartItems);
  };
  

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, [user]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const token = localStorage.getItem('stepstunnerToken');
    let productId = item.id;
    let cartItemId;
    // If this is a custom product (type: 'custom' or has customizationId), use the custom endpoint
    if (item.type === 'custom' || item.customizationId) {
      const payload = {
        customizationId: item.customizationId,
        category: item.category,
        customization: item.customization,
        price: item.price,
        image: item.image,
        quantity,
        name: item.name,
        type: 'custom',
      };
      const res = await fetch('/api/auth/customization/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchCart();
    } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('[addToCart] Failed to add custom product to cart:', res.status, errorData);
        throw new Error('Failed to add custom product to cart');
      }
      return;
    }
    
    // If not a valid ObjectId, call add-or-get endpoint
    if (!/^[a-fA-F0-9]{24}$/.test(productId)) {
      console.log('[addToCart] Product ID is not a valid ObjectId, calling add-or-get endpoint');
      const res = await fetch('/api/products/add-or-get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category || '',
          description: item.description || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        productId = data._id;
        console.log('[addToCart] Got product ID from add-or-get:', productId);
      } else {
        console.error('[addToCart] Failed to add or get product');
        throw new Error('Failed to add or get product');
      }
    }
    
    console.log('[addToCart] Sending to cart with productId:', productId);
    
    const res = await fetch('/api/auth/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product: productId, quantity }),
    });
    
    if (res.ok) {
      console.log('[addToCart] Successfully added to cart, fetching updated cart');
      await fetchCart();
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error('[addToCart] Failed to add to cart:', res.status, errorData);
      throw new Error('Failed to add to cart');
    }
  };

  const removeFromCart = async (id: string) => {
    const token = localStorage.getItem('stepstunnerToken');
    const res = await fetch('/api/auth/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product: id }),
    });
    if (res.ok) {
      await fetchCart();
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    // Enforce min/max
    const newQuantity = Math.max(1, Math.min(10, quantity));
    console.log('Calling updateQuantity for id:', id, 'quantity:', newQuantity);
    const token = localStorage.getItem('stepstunnerToken');
    const res = await fetch('/api/auth/cart', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product: id, quantity: newQuantity }),
    });
    if (res.ok) {
      console.log('updateQuantity success, fetching cart...');
      await fetchCart();
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error('updateQuantity failed:', res.status, errorData);
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem('stepstunnerToken');
    const res = await fetch('/api/auth/cart/clear', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
    setCartItems([]);
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 