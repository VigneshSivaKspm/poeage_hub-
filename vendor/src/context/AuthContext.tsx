import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  signIn,
  register,
  logout,
  onAuthChange,
  getDocument,
  setDocument,
  type User,
} from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Vendor, VendorStatus } from '@poeage/types';

export interface VendorApplicationInput {
  storeName: string;
  description?: string;
  email: string;
  phone: string;
  gstNumber?: string;
  panNumber?: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface VendorAuthContextType {
  user: User | null;
  vendor: Vendor | null;
  status: VendorStatus | 'none';
  loading: boolean;
  error: string | null;
  loginVendor: (email: string, pass: string) => Promise<void>;
  registerVendorAccount: (email: string, pass: string, name: string) => Promise<void>;
  submitVendorApplication: (data: VendorApplicationInput) => Promise<void>;
  signOutVendor: () => Promise<void>;
  refreshVendorState: () => Promise<void>;
  clearError: () => void;
}

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined);

export const VendorAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendorData = async (uid: string) => {
    try {
      const v = await getDocument<Vendor>(COLLECTION.VENDORS, uid);
      setVendor(v);
    } catch (err) {
      console.error('[VendorAuth] Error fetching vendor doc:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchVendorData(firebaseUser.uid);
      } else {
        setVendor(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginVendor = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signIn(email, pass);
      await fetchVendorData(cred.user.uid);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to sign in to vendor portal.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerVendorAccount = async (email: string, pass: string, name: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await register(email, pass, name);
      // Create users doc
      await setDocument(COLLECTION.USERS, cred.user.uid, {
        uid: cred.user.uid,
        email,
        displayName: name,
        roles: ['vendor'],
        status: 'active',
      });
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to register account.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitVendorApplication = async (data: VendorApplicationInput) => {
    if (!user) throw new Error('Must be authenticated');
    setError(null);
    setLoading(true);
    try {
      const vendorDoc = {
        id: user.uid,
        userId: user.uid,
        storeName: data.storeName,
        storeSlug: data.storeName.toLowerCase().replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
        description: data.description || '',
        email: data.email || user.email || '',
        phone: data.phone,
        gstNumber: data.gstNumber || '',
        panNumber: data.panNumber || '',
        status: 'pending_review' as VendorStatus,
        commissionRate: 0.10, // 10%
        address: data.address,
        metadata: {
          totalSales: 0,
          totalOrders: 0,
          totalProducts: 0,
          averageRating: 5.0,
          totalRatings: 0,
          totalEarnings: 0,
          pendingSettlement: 0,
        },
      };

      await setDocument(COLLECTION.VENDORS, user.uid, vendorDoc);
      await fetchVendorData(user.uid);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to submit application.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOutVendor = async () => {
    setError(null);
    try {
      await logout();
      setUser(null);
      setVendor(null);
    } catch (err: unknown) {
      console.error('[VendorAuth] Sign out error:', err);
    }
  };

  const refreshVendorState = async () => {
    if (user) await fetchVendorData(user.uid);
  };

  const clearError = () => setError(null);

  const status: VendorStatus | 'none' = vendor ? vendor.status : 'none';

  return (
    <VendorAuthContext.Provider
      value={{
        user,
        vendor,
        status,
        loading,
        error,
        loginVendor,
        registerVendorAccount,
        submitVendorApplication,
        signOutVendor,
        refreshVendorState,
        clearError,
      }}
    >
      {children}
    </VendorAuthContext.Provider>
  );
};

export const useVendorAuth = () => {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within a VendorAuthProvider');
  }
  return context;
};
