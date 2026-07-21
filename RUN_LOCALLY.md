# 🚀 Running DineConnect Locally

## Prerequisites

- **Node.js** 16+ (LTS recommended)
- **npm** 8+
- **Git** (for cloning the repository)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/gabriel-codes-droid/dine-connect.git
cd dine-connect
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React Icons
- All development tools

### 3. Start Development Server
```bash
npm run dev
```

The application will start on: **http://localhost:5173**

You should see:
```
VITE v8.0.12  ready in 245 ms

➜  Local:   http://localhost:5173/
```

## Using the Application

### Login Page
1. **Select a Role**:
   - Super Admin (Full platform access)
   - Restaurant Admin (Restaurant management)
   - Customer (Customer portal)

2. **Click "Login to Dashboard"** to enter

### Dashboard Features
- **Sidebar**: Navigate using 8 menu items (role-based)
- **KPI Cards**: View 4 key business metrics
- **Tables**: See top 5 restaurants with data
- **Activity Feed**: Check recent platform activities
- **Quick Stats**: Monitor platform statistics

### Responsive Testing
- **Desktop**: Full sidebar and 4-column KPI grid
- **Tablet**: Responsive layout at 768px breakpoint
- **Mobile**: Hamburger menu and single-column layout

## Available Commands

### Development
```bash
npm run dev              # Start development server with HMR
```

### Build
```bash
npm run build            # Build for production (dist/)
npm run preview          # Preview production build locally
```

### Code Quality
```bash
npm run lint             # Run ESLint for code quality
```

## Project Structure

```
dine-connect/
├── src/
│   ├── App.tsx              (685 lines - all components)
│   ├── main.tsx             (entry point with routing)
│   ├── index.css            (Tailwind CSS + globals)
│   ├── App.css              (application styles)
│   └── AppRoutes.tsx        (routes configuration)
├── public/                  (static assets)
├── tailwind.config.js       (Tailwind configuration)
├── postcss.config.js        (PostCSS configuration)
├── vite.config.ts           (Vite configuration)
├── package.json             (dependencies)
└── Documentation/           (8 comprehensive guides)
```

## Documentation Files

Start with these docs to understand the project:

1. **QUICKSTART.md** - 5-minute setup guide
2. **BUILD_SUMMARY.md** - Complete build overview
3. **DINECONNECT_README.md** - Full feature documentation
4. **COMPONENT_REFERENCE.md** - Component specifications
5. **VISUAL_GUIDE.md** - Layout diagrams
6. **PROJECT_SUMMARY.md** - Project overview
7. **README_INDEX.md** - Documentation index
8. **COMPLETION_REPORT.md** - Completion summary

## Customization

### Change Port
```bash
npm run dev -- --port 3000
```

### Modify Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#YOUR_COLOR',
      // ...
    }
  }
}
```

### Add Custom Fonts
Edit `src/index.css`:
```css
@font-face {
  font-family: 'Your Font';
  src: url('/fonts/your-font.woff2') format('woff2');
}
```

## Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 3000
```

### Dependencies Not Installing
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Styles Not Applied
- Restart the development server
- Clear browser cache (Ctrl+Shift+Delete)
- Check if Tailwind CSS is properly configured

### TypeScript Errors
```bash
npm run build  # This performs full type checking
```

## Building for Production

### 1. Build the Project
```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### 2. Preview Production Build
```bash
npm run preview
```

### 3. Deploy
The `dist/` folder contains everything needed for deployment to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any static host

## Development Workflow

### 1. Make Changes
Edit files in `src/`

### 2. See Live Updates
Changes appear instantly with HMR (Hot Module Replacement)

### 3. Test Responsive Design
- Open DevTools (F12)
- Toggle Device Toolbar (Ctrl+Shift+M)
- Test mobile, tablet, desktop views

### 4. Check Code Quality
```bash
npm run lint
```

### 5. Build for Production
```bash
npm run build
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Performance

### Development Build
- Initial load: ~500KB (with dependencies)
- HMR: <500ms
- Fast refresh on file changes

### Production Build
- Optimized size: ~300KB (gzipped)
- Tree-shaking enabled
- Code splitting ready
- Minified and optimized

## Git Workflow

### Commit Changes
```bash
git add .
git commit -m "Your commit message"
```

### Push to GitHub
```bash
git push origin main
```

### View Repository
```
https://github.com/gabriel-codes-droid/dine-connect
```

## Learning Resources

### Official Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide)

### Related
- [React Router](https://reactrouter.com)
- [Lucide Icons](https://lucide.dev)

## Next Steps

### Immediate
1. ✅ Clone the repository
2. ✅ Run `npm install`
3. ✅ Run `npm run dev`
4. ✅ Explore the dashboard

### Short Term
1. Review the component code
2. Understand the architecture
3. Customize colors and styles
4. Create new pages following the pattern

### Medium Term
1. Connect to backend API
2. Implement real authentication
3. Add data visualization charts
4. Create additional pages

### Long Term
1. Deploy to production
2. Add more features
3. Optimize performance
4. Scale the application

## Support

### Common Issues
Check **QUICKSTART.md** troubleshooting section

### Questions
Review the documentation files in the project root

### Bugs
Report issues on GitHub or review the code in `src/App.tsx`

## Environment Variables

Currently, no environment variables are required. To add them:

1. Create `.env.local` in project root
2. Define variables with `VITE_` prefix
3. Access with `import.meta.env.VITE_VARIABLE_NAME`

Example:
```env
VITE_API_URL=https://api.example.com
```

## Production Deployment

### Vercel
```bash
vercel deploy
```

### Netlify
```bash
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
npm run build
git add dist/
git commit -m "Deploy"
git push origin main
```

## Performance Tips

1. **Code Splitting**: React Router enables automatic code splitting
2. **Lazy Loading**: Use React.lazy() for pages
3. **Image Optimization**: Compress images before adding to public/
4. **Tree Shaking**: Vite automatically removes unused code
5. **CSS Purging**: Tailwind removes unused CSS in production

## Version Information

- **Project Version**: 1.0.0
- **React Version**: 19.2.6
- **Vite Version**: 8.0.12
- **TypeScript Version**: 6.0.2
- **Node Version Required**: 16+

## License

MIT License - See LICENSE file for details

## Credits

Built with:
- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React Icons

---

**Happy Coding! 🚀**

For more details, see the documentation files in the project root.
