// Firebase exports
export { app, db, storage, auth } from './config';
export { default as firebaseConfig } from './config';
export { 
  restaurantService, 
  menuService, 
  orderService, 
  favoriteService,
  reviewService 
} from './firebaseService';
export { reservationService } from './reservationService';
export type { Order, OrderItem, Review } from './firebaseService';
export type { Reservation } from './reservationService';
