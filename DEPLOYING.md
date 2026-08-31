# DineConnect Deployment Guide

## 🚀 Deployment Process

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase account with project `dineconnect-36bc7`
- Logged into Firebase: `firebase login`

### Build and Deploy Sequence

#### 1. Build the Frontend
```bash
cd frontend
npm run build
```
This creates the production build in `frontend/dist/`

#### 2. Deploy to Firebase
```bash
cd ..
firebase deploy --only hosting,firestore
```

This deploys:
- **Hosting**: Frontend application to Firebase Hosting
- **Firestore**: Database rules and indexes

### When to Deploy Different Services

#### Full Deploy (Hosting + Firestore)
```bash
firebase deploy --only hosting,firestore
```
Use when: Frontend changes + database schema changes

#### Hosting Only
```bash
firebase deploy --only hosting
```
Use when: Only UI/frontend changes, no database changes

#### Firestore Only
```bash
firebase deploy --only firestore
```
Use when: Only database rules or indexes changed

### Auto-Deploy Setup

GitHub Actions is configured for automatic deployment on pushes to `main` branch.

**Required GitHub Secret:**
- `FIREBASE_SERVICE_ACCOUNT_DINECONNECT_36BC7`

**To set up the secret:**
1. Go to Firebase Console → Settings → Service Accounts
2. Generate new private key → Download JSON
3. Go to GitHub repo → Settings → Secrets and variables → Actions
4. Add secret with the JSON content

### Deployment Environments

#### Development
```bash
cd frontend
npm run dev
```
Runs on `http://localhost:5173` with hot reload

#### Production
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting,firestore
```
Deploys to `https://dineconnect-36bc7.web.app`

### Troubleshooting

#### Build Errors
```bash
cd frontend
npm run typecheck  # Check TypeScript errors
npm run lint        # Check linting errors
```

#### Deployment Errors
```bash
firebase login --reauth  # Re-authenticate Firebase
firebase use dineconnect-36bc7  # Ensure correct project
```

#### Firestore Index Errors
If you see "requires an index" errors:
1. Check `firestore.indexes.json` has the required index
2. Run `firebase deploy --only firestore`
3. The error message will provide a link to create the index manually

### Firebase Services Status

| Service | Status | Plan | Notes |
|---------|--------|------|-------|
| Hosting | ✅ Active | Spark (Free) | 10GB storage, 10GB bandwidth |
| Firestore | ✅ Active | Spark (Free) | 1GB storage, 50K reads/day |
| Auth | ✅ Active | Spark (Free) | Included in Spark plan |
| Storage | ❌ Disabled | - | Requires Blaze plan |
| Functions | ❌ Not deployed | - | Using client SDK only |

### Deployment Checklist

Before deploying:
- [ ] Run `npm run typecheck` - no TypeScript errors
- [ ] Run `npm run build` - build succeeds
- [ ] Test locally - app works as expected
- [ ] Check `firebase.json` - correct project configured
- [ ] Update `firestore.indexes.json` if new queries added
- [ ] Update `firestore.rules` if security rules changed

After deploying:
- [ ] Test live site at `https://dineconnect-36bc7.web.app`
- [ ] Verify authentication works
- [ ] Test key user flows (orders, reservations)
- [ ] Check console for runtime errors
- [ ] Verify Firestore rules are working

### Rollback Procedure

If deployment breaks the live site:

```bash
firebase hosting:rollback dineconnect-36bc7
```

This reverts to the previous hosting version.

### Monitoring

#### Firebase Console
- https://console.firebase.google.com/project/dineconnect-36bc7/overview

#### GitHub Actions
- https://github.com/gabriel-codes-droid/dine-connect/actions

#### Analytics
- Check Firebase Console for usage metrics
- Monitor Firestore read/write operations
- Track authentication events

### Cost Monitoring

Since we're on the Spark (free) plan, monitor:
- Firestore storage usage (1GB limit)
- Bandwidth usage (10GB/month for hosting)
- If approaching limits, consider upgrading to Blaze plan

### Support

For deployment issues:
1. Check Firebase Console for error messages
2. Review GitHub Actions logs
3. Verify Firebase CLI is up to date: `firebase --version`
4. Check this deployment guide for common issues
