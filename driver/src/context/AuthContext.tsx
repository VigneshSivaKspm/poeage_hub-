import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  signIn,
  register,
  logout,
  onAuthChange,
  getDocument,
  setDocument,
  updateDocument,
  type User,
} from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Driver, DriverStatus, VehicleType } from '@poeage/types';

export interface DriverOnboardingInput {
  displayName: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  licenseNumber: string;
}

interface DriverAuthContextType {
  user: User | null;
  driver: Driver | null;
  status: DriverStatus | 'none';
  isOnline: boolean;
  loading: boolean;
  error: string | null;
  loginDriver: (email: string, pass: string) => Promise<void>;
  registerDriverAccount: (email: string, pass: string, name: string) => Promise<void>;
  submitDriverOnboarding: (data: DriverOnboardingInput) => Promise<void>;
  toggleAvailability: () => Promise<void>;
  signOutDriver: () => Promise<void>;
  refreshDriverState: () => Promise<void>;
  clearError: () => void;
}

const DriverAuthContext = createContext<DriverAuthContextType | undefined>(undefined);

export const DriverAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriverData = async (uid: string) => {
    try {
      const d = await getDocument<Driver>(COLLECTION.DRIVERS, uid);
      setDriver(d);
      if (d) {
        setIsOnline(d.isOnline ?? false);
      }
    } catch (err) {
      console.error('[DriverAuth] Error fetching driver profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchDriverData(firebaseUser.uid);
      } else {
        setDriver(null);
        setIsOnline(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginDriver = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signIn(email, pass);
      await fetchDriverData(cred.user.uid);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to sign in to driver portal.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerDriverAccount = async (email: string, pass: string, name: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await register(email, pass, name);
      await setDocument(COLLECTION.USERS, cred.user.uid, {
        uid: cred.user.uid,
        email,
        displayName: name,
        roles: ['driver'],
        status: 'active',
      });
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to create driver account.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitDriverOnboarding = async (data: DriverOnboardingInput) => {
    if (!user) throw new Error('Must be authenticated');
    setError(null);
    setLoading(true);
    try {
      const driverDoc = {
        id: user.uid,
        userId: user.uid,
        displayName: data.displayName,
        phone: data.phone,
        email: user.email || '',
        status: 'pending_review' as DriverStatus,
        vehicleType: data.vehicleType,
        vehicleNumber: data.vehicleNumber.toUpperCase(),
        licenseNumber: data.licenseNumber.toUpperCase(),
        isOnline: false,
        metadata: {
          totalDeliveries: 0,
          totalEarnings: 0,
          pendingSettlement: 0,
          averageRating: 5.0,
          totalRatings: 0,
          successRate: 1.0,
        },
      };

      await setDocument(COLLECTION.DRIVERS, user.uid, driverDoc);
      await fetchDriverData(user.uid);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to submit onboarding profile.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (!user || !driver) return;
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      await updateDocument(COLLECTION.DRIVERS, user.uid, {
        isOnline: nextState,
        status: nextState ? 'active' : 'offline',
      });
    } catch (err) {
      console.error('Failed to toggle driver availability:', err);
      setIsOnline(!nextState);
    }
  };

  const signOutDriver = async () => {
    setError(null);
    try {
      if (user && isOnline) {
        await updateDocument(COLLECTION.DRIVERS, user.uid, { isOnline: false, status: 'offline' });
      }
      await logout();
      setUser(null);
      setDriver(null);
      setIsOnline(false);
    } catch (err: unknown) {
      console.error('[DriverAuth] Sign out error:', err);
    }
  };

  const refreshDriverState = async () => {
    if (user) await fetchDriverData(user.uid);
  };

  const clearError = () => setError(null);

  const status: DriverStatus | 'none' = driver ? driver.status : 'none';

  return (
    <DriverAuthContext.Provider
      value={{
        user,
        driver,
        status,
        isOnline,
        loading,
        error,
        loginDriver,
        registerDriverAccount,
        submitDriverOnboarding,
        toggleAvailability,
        signOutDriver,
        refreshDriverState,
        clearError,
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  );
};

export const useDriverAuth = () => {
  const context = useContext(DriverAuthContext);
  if (!context) {
    throw new Error('useDriverAuth must be used within a DriverAuthProvider');
  }
  return context;
};
