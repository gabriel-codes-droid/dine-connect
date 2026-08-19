# Firebase Setup Guide for DineConnect

This guide will help you set up Firebase for real-time data, image uploads, and order tracking in DineConnect.

## Overview

The Firebase integration has been added alongside your existing MongoDB backend to provide:
- **Real-time order tracking** for customers and restaurants
- **Image storage** for menu items and restaurants
- **Customer order history** with live updates
- **Restaurant menu CRUD operations** with image uploads

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or create a new project
3. Follow the setup wizard:
   - Enter project name (e.g., "dineconnect")
   - Enable Google Analytics (optional)
   - Select location for your project

## Step 2: Enable Required Firebase Services

### Enable Firestore Database
1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose a location (select one close to your users)
4. Select **Start in Test Mode** (we'll update rules later)
5. Click "Enable"

### Enable Storage
1. In Firebase Console, go to **Build** → **Storage**
2. Click "Get Started"
3. Choose **Start in Test Mode** (we'll update rules later)
4. Click "Enable"

### Enable Authentication (Optional but Recommended)
1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** (Project Settings)
2. Scroll down to "Your apps" section
3. Click the **</> (Web)** icon to add a web app
4. Register the app:
   - App nickname: "dineconnect-frontend"
   - Don't check "Firebase Hosting"
5. Copy the **firebaseConfig** object that appears

## Step 4: Configure Environment Variables

1. Copy the Firebase config values to your `.env` file:

```bash
# Copy this from Firebase Console
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Replace the placeholder values in `C:\Users\HP\OneDrive\Desktop\dineconnect\.env` with your actual Firebase config

## Step 5: Set Up Firestore Security Rules

In Firebase Console → Firestore Database → Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Restaurants - readable by all, writable by admins
    match /restaurants/{restaurantId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders - customers can read their own, restaurants can read theirs
    match /orders/{orderId} {
      allow read: if 
        request.auth != null && (
          resource.data.customerId == request.auth.uid ||
          request.auth.token.admin == true
        );
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Favorites - users can manage their own
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 6: Set Up Storage Security Rules

In Firebase Console → Storage → Rules, replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu/{restaurantId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /restaurants/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 7: Test the Implementation

### Start the Development Server

```bash
cd C:\Users\HP\OneDrive\Desktop\dineconnect
npm run dev
```

### Test Features

1. **Customer Order History**:
   - Log in as a customer
   - Navigate to Customer Dashboard
   - You should see order history (will be empty initially)
   - Orders will appear in real-time when created

2. **Restaurant Menu CRUD**:
   - Log in as a restaurant admin
   - Navigate to Restaurant Dashboard
   - Click "Menu Management" tab
   - You can now:
     - Add new menu items
     - Edit existing items
     - Delete items
     - Upload images for items

### Create Sample Data (Optional)

To test with sample data, you can manually add restaurants in Firestore:

1. Go to Firebase Console → Firestore Database
2. Create a collection called `restaurants`
3. Add a document with this structure:
```javascript
{
  "name": "Test Restaurant",
  "description": "A test restaurant",
  "cuisine": "Italian",
  "priceRange": "$$",
  "rating": 4.5,
  "reviewCount": 10,
  "menu": [
    {
      "id": "menu-1",
      "name": "Test Dish",
      "description": "Delicious test dish",
      "price": 15.99,
      "category": "Mains"
    }
  ]
}
```

## Architecture Notes

### Data Flow

1. **Authentication**: Still uses your MongoDB backend (`src/services/auth.ts`)
2. **Real-time Data**: Uses Firebase Firestore for orders, restaurants, favorites
3. **File Storage**: Uses Firebase Storage for menu item images
4. **Static Data**: Mock restaurant data in `src/data/restaurants.ts` (can be migrated to Firestore)

### Service Structure

- `src/firebase/config.ts` - Firebase initialization
- `src/firebase/firebaseService.ts` - CRUD operations for restaurants, menu, orders, favorites
- `src/pages/CustomerOverview.tsx` - Updated with real-time order history
- `src/pages/RestaurantOverview.tsx` - Updated with menu management tab
- `src/components/restaurant/MenuEditor.tsx` - Menu CRUD component with image upload

### Firebase Services Available

```typescript
import { 
  restaurantService,  // Restaurant CRUD
  menuService,        // Menu item CRUD + image upload
  orderService,       // Order tracking with real-time updates
  favoriteService     // Customer favorites
} from './firebase';
```

## Troubleshooting

### Build Errors
- If you see TypeScript errors, run `npm run build` to check
- Ensure `.env` file exists and is properly formatted

### Firebase Connection Issues
- Check that your Firebase config in `.env` matches the Firebase Console
- Ensure Firestore and Storage are enabled in your project
- Check browser console for Firebase-specific errors

### Real-time Updates Not Working
- Verify Firestore rules allow read/write access
- Check that you're authenticated (Firebase Auth optional but recommended)
- Ensure you're using the correct customer/restaurant IDs

### Image Upload Fails
- Check Storage security rules
- Ensure Storage bucket is enabled
- Verify file size limits (default: 10MB)

## Next Steps

Once Firebase is configured and tested, you can:

1. **Migrate mock data**: Move restaurant data from `src/data/restaurants.ts` to Firestore
2. **Add more features**: Implement delivery tracking, reviews, search
3. **Enhance security**: Tighten Firestore rules for production
4. **Add analytics**: Use Firebase Analytics for user insights
5. **Implement push notifications**: Use Firebase Cloud Messaging

## Support

If you encounter issues:
- Check Firebase Console for error logs
- Review browser console for client-side errors
- Verify your `.env` configuration
- Ensure all Firebase services are enabled in your project
