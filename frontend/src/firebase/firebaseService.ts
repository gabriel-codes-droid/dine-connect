// Firebase Service for real-time data operations
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import type { Restaurant, MenuItem } from '../data/restaurants';

// ---------------------------------------------------------------------
// Timeout wrapper — prevents Firestore calls from hanging forever when
// Firebase is not configured or unreachable.
// ---------------------------------------------------------------------
const DEFAULT_FIRESTORE_TIMEOUT = 5000;

async function withTimeout<T>(promise: Promise<T>, ms = DEFAULT_FIRESTORE_TIMEOUT): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Firestore request timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

// Order types
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: 'momo' | 'cash' | 'card';
  paymentTransactionId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deliveryAddress?: string;
  specialInstructions?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

// Restaurant operations
export const restaurantService = {
  // Get all restaurants
  async getAllRestaurants(): Promise<Restaurant[]> {
    const restaurantsRef = collection(db, 'restaurants');
    const snapshot = await withTimeout(getDocs(restaurantsRef));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
  },

  // Get restaurant by ID
  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const restaurantRef = doc(db, 'restaurants', id);
    const snapshot = await withTimeout(getDoc(restaurantRef));
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Restaurant;
    }
    return null;
  },

  // Subscribe to restaurant updates (real-time)
  subscribeToRestaurant(id: string, callback: (restaurant: Restaurant | null) => void) {
    const restaurantRef = doc(db, 'restaurants', id);
    return onSnapshot(restaurantRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Restaurant);
      } else {
        callback(null);
      }
    }, (error) => {
      console.warn('[Firestore] onSnapshot error:', error);
      callback(null);
    });
  },

  // Create or update restaurant
  async saveRestaurant(restaurant: Partial<Restaurant> & { id?: string }): Promise<string> {
    if (restaurant.id) {
      const restaurantRef = doc(db, 'restaurants', restaurant.id);
      await updateDoc(restaurantRef, restaurant);
      return restaurant.id;
    } else {
      const restaurantsRef = collection(db, 'restaurants');
      const docRef = await addDoc(restaurantsRef, {
        ...restaurant,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    }
  },

  // Get restaurant(s) owned by a given restaurant-admin (by username)
  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    const restaurantsRef = collection(db, 'restaurants');
    const q = query(restaurantsRef, where('ownerId', '==', ownerId));
    const snapshot = await withTimeout(getDocs(q));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
  },

  // Delete restaurant
  async deleteRestaurant(id: string): Promise<void> {
    const restaurantRef = doc(db, 'restaurants', id);
    await deleteDoc(restaurantRef);
  }
};

// Menu operations
export const menuService = {
  // Get menu items for a restaurant
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    const snapshot = await withTimeout(getDoc(restaurantRef));
    if (snapshot.exists()) {
      const data = snapshot.data();
      return data.menu || [];
    }
    return [];
  },

  // Add menu item to restaurant
  async addMenuItem(restaurantId: string, menuItem: Omit<MenuItem, 'id'>): Promise<string> {
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    const snapshot = await withTimeout(getDoc(restaurantRef));
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      const menu = data.menu || [];
      const newMenuItem = { ...menuItem, id: `menu-${Date.now()}` };
      menu.push(newMenuItem);
      await updateDoc(restaurantRef, { menu });
      return newMenuItem.id;
    }
    throw new Error('Restaurant not found');
  },

  // Update menu item
  async updateMenuItem(restaurantId: string, menuItemId: string, updates: Partial<MenuItem>): Promise<void> {
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    const snapshot = await withTimeout(getDoc(restaurantRef));
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      const menu = data.menu || [];
      const menuIndex = menu.findIndex((item: MenuItem) => item.id === menuItemId);
      
      if (menuIndex !== -1) {
        menu[menuIndex] = { ...menu[menuIndex], ...updates };
        await updateDoc(restaurantRef, { menu });
      }
    }
  },

  // Delete menu item
  async deleteMenuItem(restaurantId: string, menuItemId: string): Promise<void> {
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    const snapshot = await withTimeout(getDoc(restaurantRef));
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      const menu = data.menu || [];
      const filteredMenu = menu.filter((item: MenuItem) => item.id !== menuItemId);
      await updateDoc(restaurantRef, { menu: filteredMenu });
    }
  },

  // Upload menu item image
  async uploadMenuItemImage(restaurantId: string, menuItemId: string, file: File): Promise<string> {
    const fileName = `menu/${restaurantId}/${menuItemId}-${Date.now()}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
};

// Order operations
export const orderService = {
  // Create order
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Get order by ID
  async getOrderById(id: string): Promise<Order | null> {
    const orderRef = doc(db, 'orders', id);
    const snapshot = await withTimeout(getDoc(orderRef));
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Order;
    }
    return null;
  },

  // Get orders for customer
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
    const snapshot = await withTimeout(getDocs(q));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  },

  // Get orders for restaurant
  async getRestaurantOrders(restaurantId: string): Promise<Order[]> {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('restaurantId', '==', restaurantId), orderBy('createdAt', 'desc'));
    const snapshot = await withTimeout(getDocs(q));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  },

  // Subscribe to customer orders (real-time)
  subscribeToCustomerOrders(customerId: string, callback: (orders: Order[]) => void) {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      callback(orders);
    }, (error) => {
      console.warn('[Firestore] onSnapshot error:', error);
      callback([]);
    });
  },

  // Subscribe to restaurant orders (real-time)
  subscribeToRestaurantOrders(restaurantId: string, callback: (orders: Order[]) => void) {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('restaurantId', '==', restaurantId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      callback(orders);
    }, (error) => {
      console.warn('[Firestore] onSnapshot error:', error);
      callback([]);
    });
  },

  // Get every order across all restaurants (super-admin dashboard)
  async getAllOrders(): Promise<Order[]> {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await withTimeout(getDocs(q));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  },

  // Subscribe to every order in real time (super-admin dashboard)
  subscribeToAllOrders(callback: (orders: Order[]) => void) {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      callback(orders);
    }, (error) => {
      console.warn('[Firestore] onSnapshot error:', error);
      callback([]);
    });
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
  },

  // Cancel order
  async cancelOrder(orderId: string): Promise<void> {
    return this.updateOrderStatus(orderId, 'cancelled');
  }
};

// Favorite restaurants for customers
export const favoriteService = {
  // Add to favorites
  async addFavorite(customerId: string, restaurantId: string): Promise<void> {
    const favoriteRef = doc(db, 'favorites', `${customerId}_${restaurantId}`);
    await setDoc(favoriteRef, {
      customerId,
      restaurantId,
      createdAt: serverTimestamp()
    });
  },

  // Remove from favorites
  async removeFavorite(customerId: string, restaurantId: string): Promise<void> {
    const favoriteRef = doc(db, 'favorites', `${customerId}_${restaurantId}`);
    await deleteDoc(favoriteRef);
  },

  // Get customer favorites
  async getCustomerFavorites(customerId: string): Promise<string[]> {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('customerId', '==', customerId));
    const snapshot = await withTimeout(getDocs(q));
    return snapshot.docs.map(doc => doc.data().restaurantId);
  },

  // Check if restaurant is favorite
  async isFavorite(customerId: string, restaurantId: string): Promise<boolean> {
    const favoriteRef = doc(db, 'favorites', `${customerId}_${restaurantId}`);
    const snapshot = await withTimeout(getDoc(favoriteRef));
    return snapshot.exists();
  }
};

// Review operations
export interface Review {
  id: string;
  restaurantId: string;
  author: string;
  rating: number;
  comment: string;
  avatarColor: string;
  createdAt: Timestamp;
}

export const reviewService = {
  // Get reviews for a restaurant
  async getReviews(restaurantId: string): Promise<Review[]> {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('restaurantId', '==', restaurantId), orderBy('createdAt', 'desc'));
    const snapshot = await withTimeout(getDocs(q));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
  },

  // Add a review
  async addReview(
    restaurantId: string,
    review: { author: string; rating: number; comment: string; avatarColor: string }
  ): Promise<void> {
    const reviewsRef = collection(db, 'reviews');
    await addDoc(reviewsRef, {
      restaurantId,
      ...review,
      createdAt: serverTimestamp()
    });
  },

  // Subscribe to reviews (real-time)
  subscribeToReviews(restaurantId: string, callback: (reviews: Review[]) => void) {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('restaurantId', '==', restaurantId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
      callback(reviews);
    }, (error) => {
      console.warn('[Firestore] onSnapshot error:', error);
      callback([]);
    });
  }
};
