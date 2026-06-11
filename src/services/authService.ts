import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import type { UserProfile, UserRole } from '../types';

const DEMO_USERS_KEY = 'dineconnect_demo_users';

interface DemoUser {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  uid: string;
}

function getDemoUsers(): DemoUser[] {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDemoUsers(users: DemoUser[]) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

export function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This account already exists. Please sign in instead.';
    case 'auth/user-not-found':
      return 'No account found for this email. Please create an account.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password. Please try again.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole = 'customer',
): Promise<UserProfile> {
  if (!isFirebaseConfigured || !auth || !db) {
    const users = getDemoUsers();
    if (users.find((u) => u.email === email)) {
      throw { code: 'auth/email-already-in-use' };
    }
    const profile: UserProfile = {
      uid: `demo_${Date.now()}`,
      email,
      fullName,
      role,
    };
    users.push({ ...profile, password });
    saveDemoUsers(users);
    localStorage.setItem('dineconnect_user', JSON.stringify(profile));
    return profile;
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: fullName });

  const profile: UserProfile = {
    uid: credential.user.uid,
    email,
    fullName,
    role,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', credential.user.uid), profile);
  return profile;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  if (!isFirebaseConfigured || !auth || !db) {
    const users = getDemoUsers();
    const user = users.find((u) => u.email === email);
    if (!user) throw { code: 'auth/user-not-found' };
    if (user.password !== password) throw { code: 'auth/wrong-password' };
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
    localStorage.setItem('dineconnect_user', JSON.stringify(profile));
    return profile;
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, 'users', credential.user.uid));
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  return {
    uid: credential.user.uid,
    email: credential.user.email ?? email,
    fullName: credential.user.displayName ?? 'User',
    role: 'customer',
  };
}

export async function logOut(): Promise<void> {
  if (!isFirebaseConfigured || !auth) {
    localStorage.removeItem('dineconnect_user');
    return;
  }
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  if (!isFirebaseConfigured || !auth || !db) {
    const stored = localStorage.getItem('dineconnect_user');
    callback(stored ? JSON.parse(stored) : null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) {
      callback(null);
      return;
    }
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      callback(snap.data() as UserProfile);
    } else {
      callback({
        uid: user.uid,
        email: user.email ?? '',
        fullName: user.displayName ?? 'User',
        role: 'customer',
      });
    }
  });
}
