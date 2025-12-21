# Admin vs Customer View - Differences

## 🎯 Overview

Your e-commerce system has **two separate applications**:

1. **Admin Panel** (`/admin`) - For store management
2. **Customer Frontend** (`/frontend`) - For shopping

---

## 👨‍💼 ADMIN PANEL (Backend Management)

### Purpose
Manage the entire store - products, orders, customers, and inventory.

### Access
- **URL**: Usually runs on `http://localhost:3001` (or different port)
- **Authentication**: Requires admin login
- **Protected**: All routes require authentication

### Features Available

#### 1. **Dashboard**
- View store statistics:
  - Total products
  - Total orders
  - Total revenue
  - Total users
- Overview of store performance

#### 2. **Products Management**
- ✅ **View all products** (active, draft, archived)
- ✅ **Create new products**
- ✅ **Edit existing products**
- ✅ **Delete products**
- ✅ **Add product details**: name, description, price, images
- ✅ **Add sizes and colors** (variants)
- ✅ **Manage inventory** (stock levels)
- ✅ **Set product status** (draft/active/archived)
- ✅ **Mark products as featured**

#### 3. **Categories Management**
- ✅ **Create categories**
- ✅ **Edit categories**
- ✅ **Delete categories**
- ✅ **Activate/deactivate categories**

#### 4. **Orders Management**
- ✅ **View all orders**
- ✅ **See order details** (customer, items, total)
- ✅ **Update order status**
- ✅ **Track order fulfillment**

#### 5. **Users Management**
- ✅ **View all registered users**
- ✅ **See user details**
- ✅ **Manage user accounts**

### Design
- **Material-UI** components
- **Sidebar navigation** with icons
- **Professional dashboard** layout
- **Blue/Red color scheme** (Material Design)

### Port
- Typically runs on port **3001** (separate from customer frontend)

---

## 🛍️ CUSTOMER FRONTEND (Shopping Experience)

### Purpose
Public-facing store where customers browse and purchase products.

### Access
- **URL**: Usually runs on `http://localhost:3000` (or different port)
- **Authentication**: Optional (for account features)
- **Public**: Most pages accessible without login

### Features Available

#### 1. **Home Page**
- ✅ Hero section with brand messaging
- ✅ Promotional banners
- ✅ Featured/New Arrivals products
- ✅ Call-to-action buttons

#### 2. **Products Page**
- ✅ **Browse all products**
- ✅ **Filter by category** (dropdown)
- ✅ **View product cards** with images
- ✅ **Add to cart** directly from listing
- ✅ **Search functionality** (if implemented)

#### 3. **Product Detail Page**
- ✅ **View full product information**
- ✅ **See product images**
- ✅ **Select size** (XS, S, M, L, XL, XXL)
- ✅ **Select color** (color swatches)
- ✅ **Choose quantity**
- ✅ **Add to cart** with selected variants
- ✅ **View price and discounts**

#### 4. **Shopping Cart**
- ✅ **View cart items**
- ✅ **See selected sizes/colors**
- ✅ **Update quantities**
- ✅ **Remove items**
- ✅ **View subtotal, tax, shipping**
- ✅ **Calculate total**

#### 5. **Checkout**
- ✅ **Enter shipping information**
- ✅ **Enter payment details**
- ✅ **Review order summary**
- ✅ **Place order**

#### 6. **User Account**
- ✅ **Register** new account
- ✅ **Login** to existing account
- ✅ **View cart** (when logged in)
- ✅ **Logout**

### Design
- **6IXTY8IGHT brand styling**
- **Black and Pink** color scheme
- **Fashion-forward** design
- **Responsive** layout
- **Modern UI** with Poppins font

### Port
- Typically runs on port **3000** (default React port)

---

## 🔑 Key Differences Summary

| Feature | Admin Panel | Customer Frontend |
|---------|------------|-------------------|
| **Purpose** | Manage store | Shop products |
| **Users** | Store administrators | Customers |
| **Authentication** | Required | Optional |
| **Can Create Products** | ✅ Yes | ❌ No |
| **Can Edit Products** | ✅ Yes | ❌ No |
| **Can View Orders** | ✅ All orders | ❌ Only own orders |
| **Can Manage Users** | ✅ Yes | ❌ No |
| **Can Shop** | ❌ No | ✅ Yes |
| **Can Add to Cart** | ❌ No | ✅ Yes |
| **Can Checkout** | ❌ No | ✅ Yes |
| **Design** | Material-UI Dashboard | Fashion Brand Store |
| **Navigation** | Sidebar menu | Header menu (Home/Shop) |

---

## 🚀 How to Access

### Admin Panel
1. Navigate to `/admin` directory
2. Run `npm start`
3. Login with admin credentials
4. Access: `http://localhost:3001`

### Customer Frontend
1. Navigate to `/frontend` directory
2. Run `npm start`
3. Browse: `http://localhost:3000`

---

## 📝 Typical Workflow

### Admin Workflow:
1. Login to admin panel
2. Create categories (Lingerie, Nightwear, etc.)
3. Add products with details, sizes, colors
4. Set products as active/featured
5. View and manage orders
6. Monitor store statistics

### Customer Workflow:
1. Browse homepage
2. View products in shop
3. Select product → choose size/color
4. Add to cart
5. Review cart
6. Checkout and place order

---

## 🔒 Security

- **Admin Panel**: Protected routes - only admins can access
- **Customer Frontend**: Public browsing, login optional for cart persistence
- **Backend API**: Handles authentication and authorization

Both applications connect to the same backend API (`/backend`) but serve different purposes!

