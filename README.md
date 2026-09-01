# DineConnect

## 🎯 What It Does
wk
DineConnect is a comprehensive restaurant management system that connects three key user types:

- **Customers**: Browse restaurants, view menus, place orders, make reservations, track order status
- **Restaurant Owners**: Manage menus, receive orders, track reservations, view analytics
- **Super Admins**: Oversee platform operations, manage restaurants, view overall analytics

## 🛠 Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript 6** - Type safety
- **Vite 8** - Build tool and dev server
- **React Router DOM 6** - Client-side routing
- **Tailwind CSS** - Styling
- **Leaflet + React Leaflet** - Maps and geolocation
- **Recharts** - Analytics charts
- **React Hot Toast** - Notifications

### Backend Services
- **Firebase Auth** - User authentication (sign up, login, password reset)
- **Firestore** - Real-time database for orders, restaurants, reservations
- **Firebase Hosting** - Static site hosting (free tier)
- **MoMo Payment** - Payment integration (Vietnam)

### Not Currently Used
- **Express + MongoDB** - Moved to `legacy/` folder (not deployed)
- **Firebase Storage** - Disabled (requires Blaze plan)
- **Cloud Functions** - Not deployed (using client SDK only)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gabriel-codes-droid/dine-connect.git
   cd dineconnect
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 📦 Deployment

### Quick Deploy
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting,firestore
```

### Auto-Deploy
GitHub Actions is configured for automatic deployment when pushing to the `main` branch. Requires the `FIREBASE_SERVICE_ACCOUNT_DINECONNECT_36BC7` secret to be configured in GitHub repository settings.

### Live Site
**https://dineconnect-36bc7.web.app**

## 🔧 Firebase Configuration

### Current Firebase Services
- ✅ **Hosting** - Deployed and active
- ✅ **Firestore** - Active with rules and indexes
- ✅ **Authentication** - Configured and working
- ❌ **Storage** - Disabled (requires Blaze plan)
- ❌ **Cloud Functions** - Not deployed (using client SDK)

### Free Tier Limits
- **Hosting**: 10GB storage, 10GB/month bandwidth
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Authentication**: Free tier included

## 📁 Project Structure

```
dineconnect/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── firebase/    # Firebase services
│   │   ├── services/    # API services
│   │   └── routes/      # Route configuration
│   ├── public/          # Static assets
│   └── dist/            # Build output
├── legacy/             # Legacy Express backend (not used)
│   └── backend/        # Old Express + MongoDB setup
├── .firebase/          # Firebase configuration
├── .github/            # GitHub Actions workflows
└── firebase.json       # Firebase deployment config
```

## 🔐 Authentication

The app uses Firebase Authentication with three user roles:
- **customer** - Regular restaurant users
- **restaurant-admin** - Restaurant owners/managers
- **super-admin** - Platform administrators

## 🍽️ Key Features

### For Customers
- Browse restaurants with search and filters
- View restaurant menus and details
- Place orders with item customization
- Make table reservations
- Track order status in real-time
- View order history and favorites

### For Restaurant Owners
- Manage restaurant profile and menu
- Receive and process orders
- Manage reservations
- View sales analytics and reports
- Track restaurant performance

### For Super Admins
- Overview of all platform activity
- Manage restaurant accounts
- View platform-wide analytics
- Monitor system performance

## 🌍 Features Implemented

✅ User authentication (Firebase Auth)
✅ Restaurant browsing and search
✅ Menu management (CRUD operations)
✅ Order placement and tracking
✅ Table reservations
✅ Real-time updates (Firestore)
✅ Role-based access control
✅ Analytics and reporting
✅ Geolocation and map view
✅ Payment integration (MoMo)
✅ Responsive design
✅ Dark mode support

## 🚧 Current Limitations

- **Profile Pictures**: Disabled (Firebase Storage requires Blaze plan)
- **Image Uploads**: Not available (Storage not enabled)
- **Express Backend**: Not deployed (using Firebase client SDK only)

## 📄 License

This project is for demonstration purposes.

## 🤝 Contributing

This is a portfolio project. Feel free to fork and experiment!

## 📞 Support

For issues or questions, please open an issue on GitHub.
