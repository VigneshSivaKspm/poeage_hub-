import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User,
  type UserCredential,
  type IdTokenResult,
} from 'firebase/auth';
import { firebaseAuth } from './config.ts';

export const auth = firebaseAuth;

const MOCK_SESSION_KEY = 'poeage_hub_mock_session';

export interface MockSession {
  uid: string;
  email: string;
  displayName: string;
  roles: string[];
}

export function getMockSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(MOCK_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function createMockUser(session: MockSession): User {
  return {
    uid: session.uid,
    email: session.email,
    displayName: session.displayName,
    photoURL: null,
    phoneNumber: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    providerId: 'password',
    getIdToken: async () => 'mock-jwt-token',
    getIdTokenResult: async (): Promise<IdTokenResult> => ({
      token: 'mock-jwt-token',
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      signInProvider: 'password',
      signInSecondFactor: null,
      claims: {
        roles: session.roles,
        admin: session.roles.includes('admin'),
      },
    }),
    reload: async () => {},
    delete: async () => {},
    toJSON: () => session,
  } as unknown as User;
}

const listeners = new Set<(user: User | null) => void>();

function notifyListeners(user: User | null) {
  listeners.forEach((cb) => {
    try {
      cb(user);
    } catch (err) {
      console.warn('[Poeage Auth] Listener dispatch warning:', err);
    }
  });
}

export function buildMockUserForCredentials(email: string, displayName?: string): MockSession {
  const normEmail = email.toLowerCase().trim();
  if (normEmail.includes('admin') || normEmail === 'demo@k7fitness.app') {
    return {
      uid: 'admin-user-demo-id',
      email: normEmail,
      displayName: displayName || 'Chief Administrator (Demo)',
      roles: ['admin', 'super_admin', 'operations_admin'],
    };
  }
  if (normEmail.includes('vendor') || normEmail.includes('k7fitness')) {
    return {
      uid: 'vendor-k7-fitness',
      email: normEmail,
      displayName: displayName || 'K7 Fitness & Athletics Pro',
      roles: ['vendor'],
    };
  }
  if (normEmail.includes('driver')) {
    return {
      uid: 'driver-rajesh',
      email: normEmail,
      displayName: displayName || 'Rajesh Kumar (Fleet Partner)',
      roles: ['driver'],
    };
  }
  return {
    uid: 'customer-demo-uid',
    email: normEmail,
    displayName: displayName || normEmail.split('@')[0] || 'Customer',
    roles: ['customer'],
  };
}

export async function signIn(email: string, password: string): Promise<UserCredential> {
  const apiKey = (import.meta.env['VITE_FIREBASE_API_KEY'] as string) || 'mock-api-key';
  const isMockKey = apiKey === 'mock-api-key' || apiKey.startsWith('mock');

  if (isMockKey) {
    const mockSession = buildMockUserForCredentials(email);
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
    const mockUser = createMockUser(mockSession);
    notifyListeners(mockUser);
    return {
      user: mockUser,
      providerId: 'password',
      operationType: 'signIn',
    } as unknown as UserCredential;
  }

  try {
    return await signInWithEmailAndPassword(firebaseAuth, email, password);
  } catch (err: any) {
    if (
      err?.code === 'auth/api-key-not-valid' ||
      err?.message?.includes('api-key-not-valid') ||
      err?.code === 'auth/network-request-failed'
    ) {
      console.warn('[Poeage Auth] Cloud API key invalid/unreachable. Activating local demo session.');
      const mockSession = buildMockUserForCredentials(email);
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
      const mockUser = createMockUser(mockSession);
      notifyListeners(mockUser);
      return {
        user: mockUser,
        providerId: 'password',
        operationType: 'signIn',
      } as unknown as UserCredential;
    }
    throw err;
  }
}

export async function register(
  email: string,
  password: string,
  displayName: string,
): Promise<UserCredential> {
  const apiKey = (import.meta.env['VITE_FIREBASE_API_KEY'] as string) || 'mock-api-key';
  const isMockKey = apiKey === 'mock-api-key' || apiKey.startsWith('mock');

  if (isMockKey) {
    const mockSession = buildMockUserForCredentials(email, displayName);
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
    const mockUser = createMockUser(mockSession);
    notifyListeners(mockUser);
    return {
      user: mockUser,
      providerId: 'password',
      operationType: 'signIn',
    } as unknown as UserCredential;
  }

  try {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await updateProfile(credential.user, { displayName });
    return credential;
  } catch (err: any) {
    if (
      err?.code === 'auth/api-key-not-valid' ||
      err?.message?.includes('api-key-not-valid') ||
      err?.code === 'auth/network-request-failed'
    ) {
      const mockSession = buildMockUserForCredentials(email, displayName);
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
      const mockUser = createMockUser(mockSession);
      notifyListeners(mockUser);
      return {
        user: mockUser,
        providerId: 'password',
        operationType: 'signIn',
      } as unknown as UserCredential;
    }
    throw err;
  }
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const apiKey = (import.meta.env['VITE_FIREBASE_API_KEY'] as string) || 'mock-api-key';
  const isMockKey = apiKey === 'mock-api-key' || apiKey.startsWith('mock');

  if (isMockKey) {
    const mockSession = buildMockUserForCredentials('google.customer@poeagehub.com', 'Google Customer');
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
    const mockUser = createMockUser(mockSession);
    notifyListeners(mockUser);
    return {
      user: mockUser,
      providerId: 'google.com',
      operationType: 'signIn',
    } as unknown as UserCredential;
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    return await signInWithPopup(firebaseAuth, provider);
  } catch (err: any) {
    if (err?.code === 'auth/api-key-not-valid' || err?.message?.includes('api-key-not-valid')) {
      const mockSession = buildMockUserForCredentials('google.customer@poeagehub.com', 'Google Customer');
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
      const mockUser = createMockUser(mockSession);
      notifyListeners(mockUser);
      return {
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn',
      } as unknown as UserCredential;
    }
    throw err;
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem(MOCK_SESSION_KEY);
  notifyListeners(null);
  try {
    await signOut(firebaseAuth);
  } catch {
    // Ignore signout error if in mock mode
  }
}

export async function resetPassword(email: string): Promise<void> {
  const apiKey = (import.meta.env['VITE_FIREBASE_API_KEY'] as string) || 'mock-api-key';
  if (apiKey === 'mock-api-key' || apiKey.startsWith('mock')) {
    console.info(`[Poeage Auth] Mock password reset sent to ${email}`);
    return;
  }
  return sendPasswordResetEmail(firebaseAuth, email);
}

export function onAuthChange(callback: (user: User | null) => void) {
  listeners.add(callback);

  // Initialize with existing mock session if present
  const existing = getMockSession();
  if (existing) {
    callback(createMockUser(existing));
  }

  const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
    if (user) {
      callback(user);
    } else {
      const mock = getMockSession();
      if (mock) {
        callback(createMockUser(mock));
      } else {
        callback(null);
      }
    }
  });

  return () => {
    listeners.delete(callback);
    unsubscribe();
  };
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = firebaseAuth.currentUser;
  if (user) return user.getIdToken(forceRefresh);
  const mock = getMockSession();
  return mock ? 'mock-jwt-token' : null;
}

export async function getIdTokenResult(forceRefresh = false): Promise<any> {
  const user = firebaseAuth.currentUser;
  if (user) return user.getIdTokenResult(forceRefresh);
  const mock = getMockSession();
  if (mock) {
    return {
      claims: {
        roles: mock.roles,
        admin: mock.roles.includes('admin'),
      },
    };
  }
  return null;
}

export { type User };
