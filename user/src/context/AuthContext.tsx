import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  signIn,
  register,
  signInWithGoogle,
  logout,
  resetPassword,
  onAuthChange,
  getDocument,
  setDocument,
  type User,
} from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { UserProfile, UserRole } from '@poeage/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  roles: UserRole[];
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  loginWithGoogleAuth: () => Promise<void>;
  signOutUser: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Fetch or initialize user profile document in Firestore
          let userProfile = await getDocument<UserProfile>(COLLECTION.USERS, firebaseUser.uid);
          if (!userProfile) {
            // Document creation fallback
            const newProfile: Record<string, unknown> = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Customer',
              photoURL: firebaseUser.photoURL || null,
              phone: firebaseUser.phoneNumber || null,
              roles: ['customer'],
              status: 'active',
              metadata: {
                totalOrders: 0,
                totalSpent: 0,
              },
            };
            await setDocument(COLLECTION.USERS, firebaseUser.uid, newProfile);
            userProfile = { id: firebaseUser.uid, ...newProfile } as unknown as UserProfile;
          }
          setProfile(userProfile);
        } catch (err) {
          console.error('[AuthContext] Error loading user profile:', err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email, pass);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to sign in. Please verify your credentials.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, phone?: string) => {
    setError(null);
    setLoading(true);
    try {
      const credential = await register(email, pass, name);
      // Create user record in Firestore
      const newProfile: Record<string, unknown> = {
        uid: credential.user.uid,
        email,
        displayName: name,
        phone: phone || null,
        roles: ['customer'],
        status: 'active',
        metadata: {
          totalOrders: 0,
          totalSpent: 0,
        },
      };
      await setDocument(COLLECTION.USERS, credential.user.uid, newProfile);
      setProfile({ id: credential.user.uid, ...newProfile } as unknown as UserProfile);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to create account.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const credential = await signInWithGoogle();
      const userProfile = await getDocument<UserProfile>(COLLECTION.USERS, credential.user.uid);
      if (!userProfile) {
        const newProfile: Record<string, unknown> = {
          uid: credential.user.uid,
          email: credential.user.email || '',
          displayName: credential.user.displayName || 'Customer',
          photoURL: credential.user.photoURL || null,
          roles: ['customer'],
          status: 'active',
          metadata: {
            totalOrders: 0,
            totalSpent: 0,
          },
        };
        await setDocument(COLLECTION.USERS, credential.user.uid, newProfile);
        setProfile({ id: credential.user.uid, ...newProfile } as unknown as UserProfile);
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Google sign in failed.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setError(null);
    try {
      await logout();
      setUser(null);
      setProfile(null);
    } catch (err: unknown) {
      console.error('[AuthContext] Sign out error:', err);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to send password reset email.';
      setError(msg);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const roles = profile?.roles || (user ? ['customer'] : []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        roles,
        loading,
        error,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogleAuth,
        signOutUser,
        sendPasswordReset,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
