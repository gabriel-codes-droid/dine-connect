import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './config';

function requireFirestore() {
  if (!db) throw new Error('Firebase is not configured.');
  return db;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  customerId: string;
  partySize: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const reservationService = {
  // Create a reservation
  async createReservation(
    restaurantId: string,
    customerId: string,
    partySize: number,
    date: string,
    time: string
  ): Promise<string> {
    const reservationsRef = collection(requireFirestore(), 'reservations');
    const docRef = await addDoc(reservationsRef, {
      restaurantId,
      customerId,
      partySize,
      date,
      time,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get reservation by ID
  async getReservationById(id: string): Promise<Reservation | null> {
    const reservationRef = doc(requireFirestore(), 'reservations', id);
    const snapshot = await getDoc(reservationRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Reservation;
    }
    return null;
  },

  // Get reservations by customer
  async getReservationsByCustomer(customerId: string): Promise<Reservation[]> {
    const reservationsRef = collection(requireFirestore(), 'reservations');
    const q = query(reservationsRef, where('customerId', '==', customerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
  },

  // Get reservations by restaurant
  async getReservationsByRestaurant(restaurantId: string): Promise<Reservation[]> {
    const reservationsRef = collection(requireFirestore(), 'reservations');
    const q = query(reservationsRef, where('restaurantId', '==', restaurantId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
  },

  // Subscribe to reservations by customer (real-time)
  subscribeToReservationsByCustomer(
    customerId: string,
    callback: (reservations: Reservation[]) => void
  ) {
    const reservationsRef = collection(requireFirestore(), 'reservations');
    const q = query(reservationsRef, where('customerId', '==', customerId));
    return onSnapshot(q, (snapshot) => {
      const reservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      callback(reservations);
    });
  },

  // Subscribe to reservations by restaurant (real-time)
  subscribeToReservationsByRestaurant(
    restaurantId: string,
    callback: (reservations: Reservation[]) => void
  ) {
    const reservationsRef = collection(requireFirestore(), 'reservations');
    const q = query(reservationsRef, where('restaurantId', '==', restaurantId));
    return onSnapshot(q, (snapshot) => {
      const reservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      callback(reservations);
    });
  },

  // Update reservation status
  async updateReservationStatus(id: string, status: Reservation['status']): Promise<void> {
    const reservationRef = doc(requireFirestore(), 'reservations', id);
    await updateDoc(reservationRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  // Cancel reservation
  async cancelReservation(id: string): Promise<void> {
    return this.updateReservationStatus(id, 'cancelled');
  },
};
