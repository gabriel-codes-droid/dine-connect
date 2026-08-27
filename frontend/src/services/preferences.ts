import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth as firebaseAuth, db } from '../firebase/config';

type Theme = 'light' | 'dark';

export const preferences = {
  async getTheme(): Promise<Theme | null> {
    const user = firebaseAuth?.currentUser;
    if (!user || !db) return null;
    try {
      const snapshot = await getDoc(doc(db, 'users', user.uid));
      const theme = snapshot.data()?.preferences?.theme;
      return theme === 'dark' || theme === 'light' ? theme : 'light';
    } catch {
      return null;
    }
  },

  async setTheme(theme: Theme): Promise<void> {
    const user = firebaseAuth?.currentUser;
    if (!user || !db) return;
    await setDoc(doc(db, 'users', user.uid), {
      preferences: { theme },
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
};
