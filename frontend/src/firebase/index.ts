// Firebase exports
export { app, db, storage, auth } from './config';
export { default as firebaseConfig } from './config';
export { 
  restaurantService, 
  menuService, 
  orderService, 
  favoriteService,
  reviewService,
  reportService
} from './firebaseService';
export { reservationService } from './reservationService';
export type { Order, OrderItem, Review, IssueReport, ReportCategory, ReportStatus } from './firebaseService';
export type { Reservation } from './reservationService';
