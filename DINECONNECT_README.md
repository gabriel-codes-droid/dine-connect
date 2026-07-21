# DineConnect - Restaurant Management Platform

A modern SaaS-style multi-restaurant management platform built with React, TypeScript, and Vite.

## Features

- **Multi-role Support**: Super Admin, Restaurant Admin, and Customer roles
- **Modern Dashboard**: Professional SaaS-style interface with Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Analytics**: KPI cards, revenue charts, and performance metrics
- **Restaurant Management**: Manage multiple restaurants, orders, and reservations
- **Professional UI**: Similar to Stripe, Linear, and Notion dashboards

## Tech Stack

- React 19+
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Lucide React Icons

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── App.tsx              # Main app component with all pages and components
├── App.css              # Application styles (using Tailwind CSS)
├── main.tsx             # React entry point
├── index.css            # Global styles with Tailwind directives
└── AppRoutes.tsx        # Routes configuration

public/                  # Static assets
```

## Design System

### Colors
- **Primary**: #6366F1 (Indigo)
- **Success**: #22C55E (Green)
- **Warning**: #F59E0B (Amber)
- **Danger**: #EF4444 (Red)
- **Background**: #F8FAFC (Light slate)
- **Text**: #111827 (Dark gray)

### Components

- **Sidebar**: Collapsible navigation with role-based menu items
- **Navbar**: Top navigation with user profile and notifications
- **DashboardLayout**: Main layout wrapper combining sidebar and navbar
- **KPICard**: Key performance indicator display card
- **ChartPlaceholder**: Placeholder for analytics charts

## Pages

### AdminOverview (Super Admin)
- Key performance indicators (KPIs)
- Revenue trends chart
- Top performing restaurants table
- Recent activity feed
- Quick statistics

### Additional Pages (Placeholder routes)
- Restaurants Management
- Orders Management
- Reservations
- Customers
- Analytics
- Reports
- Settings

## Role-Based Features

### Super Admin
- View all restaurants
- Manage all customers
- Full platform analytics
- System-wide reports

### Restaurant Admin
- Manage own restaurant
- View customer data
- Orders and reservations
- Restaurant-specific analytics

### Customer
- Browse restaurants
- Place orders
- Make reservations
- View order history

## Usage

1. Start the development server: `npm run dev`
2. Login page appears with role selection
3. Select a role and click "Login to Dashboard"
4. Navigate using the sidebar menu
5. All data shown is dummy data for demonstration

## Future Enhancements

- Add backend API integration
- Implement real authentication
- Add database for persistent storage
- Create additional pages (Restaurants, Orders, Customers, Analytics, Reports, Settings)
- Add data visualization charts
- Implement user preferences and settings
- Add notification system
- Create mobile app

## License

MIT
