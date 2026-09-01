import {
  confirmPasswordReset,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  reload,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
  verifyPasswordResetCode,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import type { UserRole } from '../types';
import { auth as firebaseAuth, db } from '../firebase/config';

const SESSION_KEY = 'dineconnect_session';
const PENDING_EMAIL_KEY = 'dineconnect_pending_email';

export interface Session {
  uid: string;
  username: string;
  email: string;
  role: UserRole;
  authenticated: boolean;
  profilePicture?: string | null;
}

const validRoles: UserRole[] = ['customer', 'restaurant-admin', 'super-admin'];

function requireFirebaseAuth() {
  if (!firebaseAuth) {
    throw new Error('Firebase Authentication is not configured. Add the Firebase web-app values to frontend/.env.');
  }
  return firebaseAuth;
}

function requireFirestore() {
  if (!db) {
    throw new Error('Firestore is not configured. Check the Firebase web-app values and enable Firestore.');
  }
  return db;
}

function persistSession(session: Session): Session {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.sessionStorage.setItem('dineconnect_uid', session.uid);
  window.sessionStorage.setItem('dineconnect_role', session.role);
  window.sessionStorage.setItem('dineconnect_email', session.email);
  window.sessionStorage.setItem('dineconnect_authenticated', 'true');
  window.sessionStorage.setItem('dineconnect_username', session.username);
  return session;
}

function clearSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem('dineconnect_uid');
  window.sessionStorage.removeItem('dineconnect_role');
  window.sessionStorage.removeItem('dineconnect_email');
  window.sessionStorage.removeItem('dineconnect_authenticated');
  window.sessionStorage.removeItem('dineconnect_username');
  window.sessionStorage.removeItem(PENDING_EMAIL_KEY);
}

function getDefaultUsername(user: FirebaseUser): string {
  return user.displayName?.trim() || user.email?.split('@')[0] || 'customer';
}

async function sessionFromFirebaseUser(user: FirebaseUser, fallback?: Partial<Session>): Promise<Session> {
  const firestore = requireFirestore();
  const userRef = doc(firestore, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  const profile = snapshot.exists() ? snapshot.data() : {};
  const role = validRoles.includes(profile.role as UserRole) ? profile.role as UserRole : fallback?.role || 'customer';
  const username = String(profile.username || fallback?.username || getDefaultUsername(user));
  const email = user.email || String(profile.email || fallback?.email || '');
  const profilePicture = profile.profilePicture ?? null;

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      username,
      email,
      role,
      profilePicture,
      preferences: { theme: 'light' },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return persistSession({
    uid: user.uid,
    username,
    email,
    role,
    authenticated: true,
    profilePicture,
  });
}

function firebaseErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/invalid-login-credentials': 'Invalid email or password.',
    'auth/email-already-in-use': 'An account with that email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'auth/requires-recent-login': 'For security, sign in again before changing this account detail.',
    'auth/expired-action-code': 'This reset or verification link has expired. Request a new one.',
    'auth/invalid-action-code': 'This reset or verification link is invalid. Request a new one.',
  };
  if (messages[code]) return messages[code];
  return error instanceof Error ? error.message : 'Authentication request failed.';
}

export const auth = {
  async checkEmail(_email: string): Promise<{ exists: boolean }> {
    // Firebase Auth intentionally does not expose account existence to unauthenticated callers.
    return { exists: false };
  },

  async checkUsername(username: string): Promise<{ exists: boolean }> {
    const cleanUsername = username.trim();
    if (!cleanUsername || !db) return { exists: false };
    const snapshot = await getDoc(doc(db, 'usernames', cleanUsername));
    return { exists: snapshot.exists() };
  },

  async signup(input: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<Session> {
    const username = input.username.trim();
    const email = input.email.toLowerCase().trim();
    if (!username || !email || !input.password) {
      throw new Error('Username, email, and password are required.');
    }
    if (input.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const firebase = requireFirebaseAuth();
    const firestore = requireFirestore();
    try {
      const usernameRef = doc(firestore, 'usernames', username);
      const usernameSnapshot = await getDoc(usernameRef);
      if (usernameSnapshot.exists()) {
        const duplicate = new Error('That username is already taken.') as Error & { field?: string };
        duplicate.field = 'username';
        throw duplicate;
      }

      const credential = await createUserWithEmailAndPassword(firebase, email, input.password);
      await updateProfile(credential.user, { displayName: username });
      const role: UserRole = input.role === 'restaurant-admin' ? input.role : 'customer';
      await setDoc(doc(firestore, 'users', credential.user.uid), {
        username,
        email,
        role,
        profilePicture: null,
        preferences: { theme: 'light' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await setDoc(usernameRef, { uid: credential.user.uid, createdAt: serverTimestamp() });
      return sessionFromFirebaseUser(credential.user, { username, email, role });
    } catch (error) {
      const wrapped = error as Error & { field?: string };
      if (!wrapped.field && (error as { code?: string })?.code === 'auth/email-already-in-use') {
        wrapped.field = 'email';
      }
      throw new Error(firebaseErrorMessage(wrapped), { cause: wrapped });
    }
  },

  async login(input: { email: string; password: string; role: UserRole }): Promise<Session> {
    const email = input.email.toLowerCase().trim();
    if (!email || !input.password) {
      throw new Error('Email and password are required.');
    }

    try {
      const credential = await signInWithEmailAndPassword(requireFirebaseAuth(), email, input.password);
      return await sessionFromFirebaseUser(credential.user);
    } catch (error) {
      throw new Error(firebaseErrorMessage(error), { cause: error });
    }
  },

  logout() {
    if (firebaseAuth) void firebaseSignOut(firebaseAuth);
    clearSession();
  },

  getSession(): Session | null {
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      const session = raw ? JSON.parse(raw) as Partial<Session> : null;
      return session?.authenticated && session.uid && session.username && session.role
        ? session as Session
        : null;
    } catch {
      return null;
    }
  },

  subscribeToAuthState(callback: (session: Session | null) => void): () => void {
    if (!firebaseAuth) {
      callback(this.getSession());
      return () => {};
    }

    return onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        // Firebase reports no current user. This can be a genuine sign-out,
        // but it can also fire this way on the very first auth check in a
        // session (e.g. landing straight on a public page) before persisted
        // auth state has settled. An explicit sign-out already clears the
        // session directly via auth.logout() — so here we only clear it if
        // there wasn't a locally persisted session to begin with. This
        // avoids wiping a valid, already-persisted session on an ambiguous
        // "no user yet" signal.
        if (!this.getSession()) {
          clearSession();
          callback(null);
        } else {
          callback(this.getSession());
        }
        return;
      }
      try {
        callback(await sessionFromFirebaseUser(user, this.getSession() || undefined));
      } catch (error) {
        console.warn('Unable to restore Firebase session:', error);
        callback(this.getSession());
      }
    }, () => callback(this.getSession()));
  },

  async forgotPassword(email: string): Promise<void> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) throw new Error('Email is required.');
    try {
      await sendPasswordResetEmail(requireFirebaseAuth(), cleanEmail, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      });
    } catch (error) {
      console.error('Firebase Auth error:', error);
      throw new Error(firebaseErrorMessage(error), { cause: error });
    }
  },

  async resetPassword(input: { email?: string; token: string; newPassword: string }): Promise<Session> {
    if (!input.token || !input.newPassword) {
      throw new Error('The reset link or new password is missing.');
    }
    if (input.newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const firebase = requireFirebaseAuth();
    try {
      const resetEmail = input.email?.toLowerCase().trim() || await verifyPasswordResetCode(firebase, input.token);
      await confirmPasswordReset(firebase, input.token, input.newPassword);
      const credential = await signInWithEmailAndPassword(firebase, resetEmail, input.newPassword);
      return sessionFromFirebaseUser(credential.user);
    } catch (error) {
      throw new Error(firebaseErrorMessage(error), { cause: error });
    }
  },

  async sendVerificationCode(newEmail: string): Promise<{ message: string }> {
    const cleanEmail = newEmail.toLowerCase().trim();
    const firebase = requireFirebaseAuth();
    const currentUser = firebase.currentUser;
    if (!currentUser) throw new Error('Please sign in again before changing your email.');
    if (!cleanEmail) throw new Error('Email is required.');

    try {
      await verifyBeforeUpdateEmail(currentUser, cleanEmail, {
        url: `${window.location.origin}/settings`,
        handleCodeInApp: true,
      });
      window.sessionStorage.setItem(PENDING_EMAIL_KEY, cleanEmail);
      return { message: 'Verification link sent. Open it from your email, then return here and refresh the status.' };
    } catch (error) {
      throw new Error(firebaseErrorMessage(error), { cause: error });
    }
  },

  async confirmEmailChange(_code: string): Promise<{ email: string }> {
    const firebase = requireFirebaseAuth();
    const currentUser = firebase.currentUser;
    if (!currentUser) throw new Error('Please sign in again before confirming your email.');
    const pendingEmail = window.sessionStorage.getItem(PENDING_EMAIL_KEY);
    await reload(currentUser);
    const refreshedEmail = firebase.currentUser?.email || currentUser.email || '';
    if (!pendingEmail || refreshedEmail.toLowerCase() !== pendingEmail.toLowerCase()) {
      throw new Error('Open the verification link sent to your new email, then try again.');
    }

    if (db) {
      await setDoc(doc(db, 'users', currentUser.uid), {
        email: refreshedEmail,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    const session = auth.getSession();
    if (session) persistSession({ ...session, email: refreshedEmail });
    window.sessionStorage.removeItem(PENDING_EMAIL_KEY);
    return { email: refreshedEmail };
  },

  async updateProfilePicture(_dataUrl: string): Promise<void> {
    // Firebase Storage is not enabled for this project (requires Blaze plan)
    // Profile picture upload is disabled for free tier deployment
    throw new Error('Profile picture upload is currently disabled. Firebase Storage requires the Blaze plan (billing enabled). Please contact the administrator to enable this feature.');
  },

  async updatePassword(newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 6) throw new Error('Password must be at least 6 characters.');
    const currentUser = requireFirebaseAuth().currentUser;
    if (!currentUser) throw new Error('Please sign in again before changing your password.');
    try {
      await firebaseUpdatePassword(currentUser, newPassword);
    } catch (error) {
      throw new Error(firebaseErrorMessage(error), { cause: error });
    }
  },
};
