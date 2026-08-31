# Legacy Backend - Not Currently Used

## Status: **DEPRECATED - NOT DEPLOYED**

This Express + MongoDB backend is **not currently used** in the live DineConnect application.

## Current Architecture

The live app uses **Firebase Client SDK exclusively**:
- **Authentication**: Firebase Auth
- **Database**: Firestore (not MongoDB)
- **Backend Logic**: Firebase Cloud Functions (not Express)
- **Hosting**: Firebase Hosting (not Express server)

## Why This Backend Exists

This backend was part of an earlier architecture decision that was later changed to use Firebase services instead of a custom Express + MongoDB setup.

## Why It Was Not Deployed

- No deployment configuration (no Procfile, render.yaml, Dockerfile)
- No API calls from frontend to backend endpoints
- Frontend uses Firebase client SDK for all data operations
- Firestore replaced MongoDB for database needs
- Firebase Auth replaced custom JWT authentication

## When to Use This Backend

**Do NOT use** this backend unless:
- You want to revert to the Express + MongoDB architecture
- You need to add features that Firebase cannot handle
- You specifically need a custom server for some reason

## How to Re-enable (If Needed)

1. Install dependencies: `cd legacy/backend && npm install`
2. Set up MongoDB connection (add to .env)
3. Configure environment variables (see .env.example)
4. Run locally: `npm run dev`
5. Deploy to a service (Render, Railway, Heroku, etc.)

## Current Deployment

The live app is deployed entirely on Firebase:
- **Frontend**: Firebase Hosting (https://dineconnect-36bc7.web.app)
- **Database**: Firestore (Spark plan)
- **Auth**: Firebase Auth
- **Functions**: None (using client SDK only)

## Migration Notes

If you need to migrate back to this backend:
1. Update frontend API calls to use backend endpoints
2. Configure CORS for Firebase Hosting domain
3. Add authentication middleware to Express
4. Deploy backend separately from Firebase
