# E-Commerce Website Template

A full-featured e-commerce website template. This template can be easily customized and reused to build multiple e-commerce websites.

## Features

- **Product Management**: Full CRUD operations for products, categories, and inventory
- **Order Management**: Complete order processing and tracking system
- **User Authentication**: Secure admin and customer authentication
- **Admin Dashboard**: Intuitive content management interface
- **E-Commerce Frontend**: Modern, responsive storefront
- **Template Configuration**: Easy customization through config files
- **RESTful API**: Well-structured backend API

## Project Structure

```
├── backend/          # Node.js/Express API server
├── frontend/         # React e-commerce storefront
├── admin/            # React admin dashboard
├── config/           # Template configuration files
└── README.md
```

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, JWT
- **Frontend**: React, React Router, Axios
- **Admin**: React, Material-UI (or similar)
- **Database**: MongoDB with Mongoose

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance) - See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for setup instructions
- npm or yarn

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection and JWT secret
npm start
```

2. **Create Admin User** (First time setup)
```bash
cd backend
node src/utils/createAdmin.js
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

4. **Admin Panel Setup**
```bash
cd admin
npm install
npm start
```

### Configuration

Edit `config/template.config.js` to customize:
- Site name and branding
- Color scheme
- Payment gateways
- Email settings
- Feature toggles

## Default Admin Credentials

After running the admin creation script:
- Email: admin@example.com
- Password: admin123

**⚠️ Change these in production!**

## Development

### Running All Services

You'll need three terminal windows:

1. **Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

2. **Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

3. **Terminal 3 - Admin:**
```bash
cd admin
npm start
```

### Access Points

- Frontend Store: http://localhost:3000
- Admin Dashboard: http://localhost:3001 (or next available port)
- Backend API: http://localhost:5000

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (admin)

### Orders
- `GET /api/orders` - List orders (admin/customer)
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (admin)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

## Customization Guide

1. **Branding**: Update `config/template.config.js`
2. **Styling**: Modify theme files in frontend and admin
3. **Features**: Enable/disable features in config
4. **Database**: Modify models in `backend/src/models/`

## Template Customization

### For New Websites

1. **Copy the entire project** to a new directory
2. **Update `config/template.config.js`** with your site's information
3. **Modify branding:**
   - Update site name, logo, and colors
   - Edit frontend components for custom styling
4. **Configure features:**
   - Enable/disable features in config
   - Add custom payment gateways
5. **Customize database:**
   - Add new models if needed
   - Extend existing models with custom fields

### Environment Variables

Each deployment should have its own `.env` file:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string)
- `PORT` - Backend server port (default: 5000)
- `CORS_ORIGIN` - Allowed frontend origin

## Features Included

✅ Product Management (CRUD)
✅ Category Management
✅ Order Processing
✅ User Authentication & Authorization
✅ Shopping Cart
✅ Checkout System
✅ Admin Dashboard
✅ Responsive Design
✅ RESTful API
✅ Template Configuration System

## Extending the Template

### Adding New Models

1. Create model in `backend/src/models/`
2. Create controller in `backend/src/controllers/`
3. Create routes in `backend/src/routes/`
4. Add to admin panel if needed

### Adding New Features

1. Backend: Add routes, controllers, and models
2. Frontend: Add pages and components
3. Admin: Add management pages
4. Update config if needed

## License

MIT

