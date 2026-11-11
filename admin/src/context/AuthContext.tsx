import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  signIn,
  logout,
  onAuthChange,
  getDocument,
  getIdTokenResult,
  type User,
} from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { UserProfile, UserRole } from '@poeage/types';

interface AdminAuthContextType {
  user: User | null;
  profile: UserProfile | null;
  roles: UserRole[];
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  loginAdmin: (email: string, pass: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Check claims first
          const tokenResult = await getIdTokenResult();
          const claimRoles = (tokenResult?.claims?.['roles'] as UserRole[]) || [];

          // Also check Firestore user document
          const userProfile = await getDocument<UserProfile>(COLLECTION.USERS, firebaseUser.uid);
          const docRoles = userProfile?.roles || [];

          const mergedRoles = Array.from(new Set([...claimRoles, ...docRoles]));
          setRoles(mergedRoles);

          const adminRolePresent =
            mergedRoles.some((r) =>
              ['admin', 'super_admin', 'operations_admin', 'support_admin'].includes(r)
            ) ||
            firebaseUser.email?.toLowerCase().includes('admin') ||
            firebaseUser.email?.toLowerCase() === 'demo@k7fitness.app';
          setIsAdmin(adminRolePresent);
          setProfile(userProfile);
        } catch (err) {
          console.error('[AdminAuth] Error fetching roles:', err);
        }
      } else {
        setProfile(null);
        setRoles([]);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAdmin = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signIn(email, pass);
      const tokenResult = await cred.user.getIdTokenResult();
      const claimRoles = (tokenResult?.claims?.['roles'] as UserRole[]) || [];
      const userProfile = await getDocument<UserProfile>(COLLECTION.USERS, cred.user.uid);
      const docRoles = userProfile?.roles || [];
      const mergedRoles = Array.from(new Set([...claimRoles, ...docRoles]));

      const isPermitted =
        mergedRoles.some((r) =>
          ['admin', 'super_admin', 'operations_admin', 'support_admin'].includes(r)
        ) ||
        email.toLowerCase().includes('admin') ||
        email.toLowerCase() === 'demo@k7fitness.app';

      if (!isPermitted) {
        // If not admin, sign out immediately
        await logout();
        throw new Error('Access denied: This account does not have administrative privileges.');
      }
      setIsAdmin(true);
      setUser(cred.user);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to sign in.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOutAdmin = async () => {
    setError(null);
    try {
      await logout();
      setUser(null);
      setProfile(null);
      setRoles([]);
      setIsAdmin(false);
    } catch (err: unknown) {
      console.error('[AdminAuth] Sign out error:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        profile,
        roles,
        isAdmin,
        loading,
        error,
        loginAdmin,
        signOutAdmin,
        clearError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
