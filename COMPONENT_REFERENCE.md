# DineConnect - Component & Feature Reference

## 📋 Components List

### 1. Sidebar Component
**File**: `src/App.tsx` (lines 31-152)
**Props**:
- `userRole: 'super-admin' | 'restaurant-admin' | 'customer'`

**Features**:
- Collapsible sidebar (toggle with button)
- Role-based menu filtering
- 8 menu items:
  - Overview
  - Restaurants (Super Admin only)
  - Orders (All roles)
  - Reservations (All roles)
  - Customers (Super Admin & Restaurant Admin)
  - Analytics (All roles)
  - Reports (All roles)
  - Settings (All roles)
- Active state indication with highlight
- Mobile hamburger menu
- Desktop sidebar with expand/collapse
- Smooth animations and transitions
- Sticky positioning

### 2. Navbar Component
**File**: `src/App.tsx` (lines 154-233)
**Props**:
- `userName?: string` (default: 'John Doe')
- `userRole?: 'super-admin' | 'restaurant-admin' | 'customer'` (default: 'super-admin')

**Features**:
- Top navigation bar with sticky positioning
- Dashboard title
- Notifications button with red badge
- Settings button
- User profile section with:
  - Avatar (initial letter in colored circle)
  - User name
  - Role display
  - Chevron dropdown indicator
- Dropdown menu with:
  - Profile option
  - Settings option
  - Logout option (red text)
- Responsive design (hides user name on small screens)
- Hover effects on buttons

### 3. DashboardLayout Component
**File**: `src/App.tsx` (lines 235-277)
**Props**:
- `children: React.ReactNode`
- `userRole?: 'super-admin' | 'restaurant-admin' | 'customer'` (default: 'super-admin')
- `userName?: string` (default: 'John Doe')

**Features**:
- Main layout wrapper
- Combines Sidebar and Navbar
- Flex layout for responsive design
- Scrollable main content area
- Background color #F8FAFC
- Full height layout (h-screen)

### 4. KPICard Component
**File**: `src/App.tsx` (lines 285-310)
**Props**:
- `title: string`
- `value: string | number`
- `change?: number` (optional percentage)
- `icon: React.ReactNode`
- `bgColor?: string` (default: 'bg-blue-50')

**Features**:
- Displays key performance indicator
- Shows title, value, and optional change percentage
- Percentage display with arrow:
  - Green with ↑ for positive changes
  - Red with ↓ for negative changes
- Customizable background color
- Hover shadow effect
- Professional styling

### 5. ChartPlaceholder Component
**File**: `src/App.tsx` (lines 312-328)
**Props**:
- `title: string`
- `height?: string` (default: 'h-80')

**Features**:
- Placeholder for chart components
- Dashed border design
- Centered TrendingUp icon
- Placeholder text
- Customizable height
- Light gradient background

### 6. AdminOverview Component
**File**: `src/App.tsx` (lines 330-600)

**Sections**:

#### Welcome Section
- Heading: "Welcome back!"
- Subtitle: Dashboard overview description

#### KPI Cards Section (4 cards)
1. **Total Restaurants**
   - Value: 1,248
   - Change: +12%
   - Icon: Building2 (blue)
   - Background: bg-blue-50

2. **Total Orders**
   - Value: 15,842
   - Change: +8%
   - Icon: ShoppingCart (green)
   - Background: bg-green-50

3. **Total Customers**
   - Value: 8,456
   - Change: -3%
   - Icon: Users (purple)
   - Background: bg-purple-50

4. **Total Revenue**
   - Value: $542,890
   - Change: +15%
   - Icon: TrendingUp (orange)
   - Background: bg-orange-50

#### Charts Section (2-column on desktop)
- Revenue Trend (placeholder, 2/3 width)
- Top Channels (placeholder, 1/3 width)

#### Top Restaurants Table
- 5 restaurant entries
- Columns: Restaurant, Orders, Revenue, Rating
- Hover effects
- Responsive table design
- Data includes:
  - The Golden Fork (542 orders, $18,450, 4.8★)
  - Urban Bistro (485 orders, $16,920, 4.6★)
  - Taste of Asia (421 orders, $14,735, 4.7★)
  - Pizza Paradise (398 orders, $13,930, 4.5★)
  - Seafood Delights (356 orders, $12,460, 4.9★)

#### Recent Activity Section (2/3 width on desktop)
- 4 recent activities:
  1. New order at The Golden Fork (2 minutes ago)
  2. Urban Bistro registered (1 hour ago)
  3. New customer registration (3 hours ago)
  4. Reservation at Taste of Asia (5 hours ago)
- Each activity shows:
  - Icon (colored)
  - Description
  - Time stamp

#### Quick Stats Section (1/3 width on desktop)
- Platform Uptime: 99.9%
- Active Users: 2,847
- Order Fulfillment: 94%
- Customer Satisfaction: 4.7/5
- Each stat includes a progress bar

### 7. Login Component
**File**: `src/App.tsx` (lines 602-668)
**Props**:
- `onLogin: (role: 'super-admin' | 'restaurant-admin' | 'customer') => void`

**Features**:
- Full-screen login page
- Gradient background (indigo to purple)
- Logo with DC text
- Title: "DineConnect"
- Subtitle: "Restaurant Management Platform"
- Role selection with 3 radio button options:
  1. Super Admin (Platform administration)
  2. Restaurant Admin (Restaurant management)
  3. Customer (Customer portal)
- Login button
- Helper text about demo credentials
- Professional card-based design

### 8. Main App Component
**File**: `src/App.tsx` (lines 670-685)

**Features**:
- Main application component
- State management for user role
- Conditional rendering:
  - Shows Login page if not logged in
  - Shows DashboardLayout with AdminOverview if logged in
- User name: "Sarah Anderson"
- Default role: "super-admin"

## 🎨 Design Elements

### Typography
- **Headings**: Bold, gray-900 color
- **Body Text**: Regular, gray-700 color
- **Secondary Text**: Regular, gray-600 color
- **Small Text**: Regular, gray-500 color
- **Code**: Monospace font family

### Spacing
- Cards: 24px padding (p-6)
- Sections: 24px gap (gap-6)
- Sidebar: 32px vertical (py-8), 16px horizontal (px-4)
- Buttons: 12px padding (px-4 py-2) or 12px padding (px-4 py-3)

### Shadows & Borders
- Cards: 1px gray-200 border, subtle hover shadow
- Buttons: No shadow by default, shadow on hover
- Icons: 1px gray-200 border for input elements

### Border Radius
- Cards: 8px (rounded-lg)
- Buttons: 8px (rounded-lg)
- Small elements: 6px (rounded-md)
- Avatar/Icon circles: Full (rounded-full)

## 📊 Dummy Data Summary

### Restaurants
- 5 top restaurants with names, orders, revenue, and ratings
- All data is representative and for demonstration

### Metrics
- Total Restaurants: 1,248
- Total Orders: 15,842
- Total Customers: 8,456
- Total Revenue: $542,890

### Performance Indicators
- Platform Uptime: 99.9%
- Active Users: 2,847
- Order Fulfillment: 94%
- Customer Satisfaction: 4.7/5

### Recent Activities
- 4 recent platform activities with timestamps
- Activities span from 2 minutes to 5 hours ago

## 🔄 State Management

### App-level State
- `userRole`: Tracks current user role
- `isOpen`: Sidebar open/close state (in Sidebar component)
- `isProfileOpen`: Profile dropdown state (in Navbar component)

### Props Flow
```
App
├── userRole state
│
└── DashboardLayout
    ├── userRole prop
    ├── userName prop
    │
    ├── Sidebar
    │   └── userRole prop
    │       └── filteredMenuItems
    │
    ├── Navbar
    │   ├── userName prop
    │   └── userRole prop
    │
    └── AdminOverview
        └── Static content with dummy data
```

## 🎯 Responsive Design

### Mobile (<768px)
- Full-width layout
- Hamburger menu button visible
- Single column for KPI cards
- Table scrolls horizontally
- Single column for activity and stats

### Tablet (768px-1024px)
- 2-column grid for KPIs
- Sidebar still collapsible
- 2-column layout for activity/stats

### Desktop (>1024px)
- Full sidebar visible
- 4-column grid for KPIs
- 2-column layout for charts and tables
- Full responsive features

## 🔐 Role-Based Access

### Menu Visibility by Role

**Super Admin** - All items:
- ✓ Overview
- ✓ Restaurants
- ✓ Orders
- ✓ Reservations
- ✓ Customers
- ✓ Analytics
- ✓ Reports
- ✓ Settings

**Restaurant Admin** - Limited items:
- ✓ Overview
- ✗ Restaurants (hidden)
- ✓ Orders
- ✓ Reservations
- ✓ Customers
- ✓ Analytics
- ✓ Reports
- ✓ Settings

**Customer** - Limited items:
- ✓ Overview
- ✗ Restaurants (hidden)
- ✓ Orders
- ✓ Reservations
- ✗ Customers (hidden)
- ✓ Analytics
- ✓ Reports
- ✓ Settings

## 📦 Import Statements Used

```typescript
import { useState } from 'react';
import {
  BarChart3,
  Building2,
  ShoppingCart,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  Settings as SettingsIcon,
  Menu,
  X,
  Bell,
  LogOut,
  User,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import './App.css';
```

---

**Total Lines of Code**: ~685 lines in App.tsx
**Components**: 8 main components
**Pages**: 2 pages (Login & AdminOverview)
**Icons Used**: 18 different Lucide React icons
**Styling**: 100% Tailwind CSS utility classes
