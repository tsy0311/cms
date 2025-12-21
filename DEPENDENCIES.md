# Dependencies Installation Guide

This document explains how to install all dependencies for the CMS E-Commerce project.

## Quick Install

### Option 1: Using npm script (Recommended)
```bash
npm run install:all
```

### Option 2: Using installation scripts

**Windows (PowerShell):**
```powershell
.\install-dependencies.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### Option 3: Manual installation

Install dependencies for each project:

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..

# Admin dependencies
cd admin
npm install
cd ..
```

## Project Structure

This project consists of three separate Node.js applications:

1. **Root** - Contains shared dev dependencies (concurrently, cross-env)
2. **Backend** - Node.js/Express API server
3. **Frontend** - React e-commerce storefront
4. **Admin** - React admin dashboard

Each has its own `package.json` with specific dependencies.

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community)

## Backend Dependencies

Located in `backend/package.json`:
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- cors - CORS middleware
- dotenv - Environment variables
- multer - File uploads
- express-validator - Input validation
- nodemon - Development server (dev dependency)

## Frontend Dependencies

Located in `frontend/package.json`:
- react - UI library
- react-dom - React DOM renderer
- react-router-dom - Routing
- axios - HTTP client
- react-scripts - Create React App tooling (dev dependency)

## Admin Dependencies

Located in `admin/package.json`:
- react - UI library
- react-dom - React DOM renderer
- react-router-dom - Routing
- axios - HTTP client
- @mui/material - Material-UI components
- @mui/icons-material - Material-UI icons
- @emotion/react - CSS-in-JS library
- @emotion/styled - Styled components
- recharts - Chart library
- react-scripts - Create React App tooling (dev dependency)

## Troubleshooting

### Port conflicts
If you encounter port conflicts:
- Backend: Default port 5000
- Frontend: Default port 3000
- Admin: Default port 3001

### MongoDB connection issues
Make sure MongoDB is running:
```bash
# Windows
Get-Service MongoDB

# Linux/Mac
sudo systemctl status mongod
```

### Permission errors
On Linux/Mac, you may need to use `sudo` for global installations, but it's better to use a Node version manager like `nvm`.

## After Installation

1. **Start MongoDB** (if not running as a service)
2. **Create backend/.env** (optional, uses defaults if not present):
   ```
   MONGODB_URI=mongodb://localhost:27017/cms_ecommerce
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```
3. **Run the application**:
   ```bash
   npm run dev
   ```

This will start all three services simultaneously.

