import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartItem, Product } from '@poeage/types';
import { useAuth } from './AuthContext';
import { getDocument, setDocument } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  couponCode: string | null;
  couponDiscount: number;
  grandTotal: number;
  addToCart: (product: Product, quantity?: number, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const LOCAL_STORAGE_KEY = 'poeage_hub_cart';
const FREE_SHIPPING_THRESHOLD = 49900; // ₹499 in paise
const STANDARD_DELIVERY_FEE = 5000; // ₹50 in paise

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to save cart to localStorage', err);
    }
  }, [items]);

  // Load from Firestore when user logs in
  useEffect(() => {
    if (!user) return;

    const loadRemoteCart = async () => {
      try {
        const remote = await getDocument<{ items?: CartItem[]; couponCode?: string }>(
          COLLECTION.CARTS,
          user.uid
        );
        if (remote?.items && remote.items.length > 0) {
          // Merge remote items with local items (avoid duplicates)
          setItems((local) => {
            const merged = [...remote.items!];
            for (const item of local) {
              if (!merged.some((m) => m.productId === item.productId && m.variantId === item.variantId)) {
                merged.push(item);
              }
            }
            return merged;
          });
        }
      } catch (err) {
        console.warn('Could not sync remote cart:', err);
      }
    };

    loadRemoteCart();
  }, [user]);

  // Sync back to Firestore when items change and user is logged in
  useEffect(() => {
    if (!user) return;
    const saveRemoteCart = async () => {
      try {
        await setDocument(
          COLLECTION.CARTS,
          user.uid,
          {
            userId: user.uid,
            items,
            couponCode: couponCode || null,
            couponDiscount,
          },
          true
        );
      } catch (err) {
        console.warn('Failed to update remote cart:', err);
      }
    };

    const timeout = setTimeout(saveRemoteCart, 800);
    return () => clearTimeout(timeout);
  }, [items, user, couponCode, couponDiscount]);

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryCharge = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : STANDARD_DELIVERY_FEE;
  const grandTotal = Math.max(0, subtotal + deliveryCharge - couponDiscount);

  const addToCart = useCallback((product: Product, quantity = 1, variantId?: string) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product.id && i.variantId === (variantId || undefined)
      );

      const unitPrice = product.basePrice;
      const imageURL = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex]!;
        const newQty = existing.quantity + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPrice: unitPrice * newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        productId: product.id,
        ...(variantId ? { variantId } : {}),
        vendorId: product.vendorId,
        name: product.name,
        imageURL,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      };

      return [...prev, newItem];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === (variantId || undefined)) {
          return {
            ...item,
            quantity,
            totalPrice: item.unitPrice * quantity,
          };
        }
        return item;
      })
    );
  }, []);

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.variantId === (variantId || undefined))
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const applyCoupon = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    // Common promotional coupons supported out of the box
    if (cleanCode === 'WELCOME100') {
      if (subtotal < 50000) {
        return { success: false, message: 'WELCOME100 requires a minimum order of ₹500.' };
      }
      setCouponCode('WELCOME100');
      setCouponDiscount(10000); // ₹100 discount
      return { success: true, message: 'Coupon WELCOME100 applied! ₹100 saved.' };
    }

    if (cleanCode === 'SUPER10') {
      if (subtotal < 100000) {
        return { success: false, message: 'SUPER10 requires a minimum order of ₹1,000.' };
      }
      const disc = Math.round(subtotal * 0.1);
      const capped = Math.min(disc, 20000); // ₹200 cap
      setCouponCode('SUPER10');
      setCouponDiscount(capped);
      return { success: true, message: `Coupon SUPER10 applied! ₹${(capped / 100).toFixed(2)} saved.` };
    }

    // Try fetching from Firestore collection
    try {
      const coupon = await getDocument<any>(COLLECTION.COUPONS, cleanCode);
      if (!coupon || !coupon.isActive) {
        return { success: false, message: 'Invalid or expired coupon code.' };
      }
      if (subtotal < (coupon.minOrderAmount || 0)) {
        return {
          success: false,
          message: `Minimum order amount for this coupon is ₹${((coupon.minOrderAmount || 0) / 100).toFixed(2)}.`,
        };
      }

      let discount = 0;
      if (coupon.discountType === 'percentage') {
        const calculated = Math.round((subtotal * coupon.discountValue) / 100);
        discount = coupon.maxDiscountAmount ? Math.min(calculated, coupon.maxDiscountAmount) : calculated;
      } else {
        discount = coupon.discountValue;
      }

      setCouponCode(cleanCode);
      setCouponDiscount(discount);
      return { success: true, message: `Coupon ${cleanCode} applied successfully!` };
    } catch {
      return { success: false, message: 'Could not validate coupon at this time.' };
    }
  }, [subtotal]);

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    setCouponDiscount(0);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryCharge,
        couponCode,
        couponDiscount,
        grandTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
