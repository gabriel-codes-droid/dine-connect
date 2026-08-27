# DineConnect Firebase-only deployment

DineConnect follows the same production model as the live Personal Management Dashboard deployment:

| Application area | Firebase service |
|---|---|
| React/Vite application | Firebase Hosting |
| Login, signup, sessions, password reset | Firebase Authentication |
| User profiles, restaurants, orders, reservations, favorites, and reviews | Cloud Firestore |
| Profile and menu images | Firebase Storage |
| Server-side Express API | Not required for the Firebase-only build |

## 1. Configure the Firebase web app

The production frontend reads the Firebase web-app values from `frontend/.env`. These are client configuration values, not server secrets. Use the values shown in Firebase Console under Project settings → Your apps → Web app.

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=dineconnect-36bc7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dineconnect-36bc7
VITE_FIREBASE_STORAGE_BUCKET=dineconnect-36bc7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

No `VITE_API_URL` is needed. The frontend uses Firebase Auth, Firestore, and Storage directly.

## 2. Enable Firebase services

In Firebase Console, enable Email/Password under Authentication → Sign-in method. Create a Firestore database and enable Storage. The `firebase.json` file registers the Hosting directory, Firestore rules/indexes, and Storage rules.

## 3. Build and deploy

Run these commands from the project root:

```powershell
cd C:\Users\HP\OneDrive\Desktop\dineconnect\frontend
npm install
npm run build
cd ..
firebase login
firebase use dineconnect-36bc7
firebase deploy --only hosting,firestore,storage
```

Do not run `firebase deploy --only functions`; the Firebase-only architecture does not use Cloud Functions, Secret Manager, Render, or the Express server for browser authentication.

## 4. Verify the deployment

Open `https://dineconnect-36bc7.web.app` and test account creation, login, logout, password reset, profile image upload, restaurant browsing, order creation, reservations, Reports, and Settings. A new customer account should create a Firebase Auth user and a matching `users/{uid}` Firestore document.

## 5. Firestore ownership model

New customer orders and reservations store `customerId` as the Firebase Auth uid. New restaurant documents store `ownerId` as the restaurant-admin Firebase Auth uid. Favorites store `customerId` as the Firebase Auth uid. Review documents store `authorId` as the Firebase Auth uid. The rules in `firestore.rules` use these values to prevent users from reading or changing another user’s private data.

Existing documents created by the previous Mongo/JWT or username-based version may not be visible under the new rules until they are migrated to uid-based ownership. Do not loosen production rules to make legacy documents appear.

## 6. Important security notes

Never place MongoDB credentials, JWT secrets, payment secrets, or other private keys in `frontend/.env` or any `VITE_` variable. Firebase web-app configuration values are intended to be public, while Firestore and Storage rules enforce access control.

The Express backend remains in the repository for local development and possible future server-side integrations, but it is not part of the Firebase-only browser deployment. Payment integrations that require private credentials should also be disabled or moved to a secure server-side service until a server-side deployment is intentionally added.
