# Library Management System - Setup Guide

## Prerequisites

- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher) with SQL Workbench
- **Razorpay Account** (for payment integration)

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd d:\projects\library\backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

Open SQL Workbench and execute the migration files:

```sql
-- First, create the database
CREATE DATABASE library_db;
USE library_db;

-- Then run the schema migration
SOURCE d:/projects/library/backend/migrations/001_initial_schema.sql;

-- Finally, run the seed data
SOURCE d:/projects/library/backend/migrations/002_seed_data.sql;
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=library_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Penalty Configuration
PENALTY_PER_DAY=10

# Subscription Configuration
SUBSCRIPTION_PRICE=500
```

### 5. Start Backend Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

---

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd d:\projects\library\frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment (Optional)

Create `.env` file if you need custom configuration:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Start Frontend Development Server
```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

---

## Default Credentials

### Admin Account
- **Email**: admin@library.com
- **Password**: admin123

### Member Accounts
- **Email**: rahul@example.com
- **Password**: member123

- **Email**: priya@example.com
- **Password**: member123

---

## Razorpay Setup

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get your API keys from Settings → API Keys
3. Add the keys to your backend `.env` file
4. For testing, use Razorpay test mode

### Test Card Details
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date

---

## Features Overview

### Member Features
- ✅ Browse and search books
- ✅ Issue books (with active subscription)
- ✅ Return books
- ✅ View issued books and penalties
- ✅ Subscribe/renew subscription
- ✅ Pay penalties
- ✅ Submit requests to admin
- ✅ Dark/Light mode toggle

### Admin Features
- ✅ View dashboard statistics
- ✅ Manage books (add/edit/delete)
- ✅ View all issued books
- ✅ Accept cash payments
- ✅ Manage user requests
- ✅ View audit logs
- ✅ User management

### Animations
- ✅ Floating labels with magnetic focus
- ✅ Shake animation on login error
- ✅ Tom & Jerry logout portal effect
- ✅ Netflix-style book browser
- ✅ Stepper animation in payment flow
- ✅ SVG draw animation for success
- ✅ Glassmorphism UI
- ✅ 60 FPS smooth transitions

---

## Project Structure

```
library/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth & validation
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── cron/            # Scheduled tasks
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Entry point
│   ├── migrations/          # SQL migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API & Socket services
│   │   ├── animations/      # Framer Motion variants
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── public/
│   └── package.json
└── docs/
    └── er-diagram.md        # Database schema
```

---

## Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure port 5000 is not in use

### Frontend won't connect to backend
- Verify backend is running on port 5000
- Check CORS settings in backend
- Clear browser cache

### Payment integration not working
- Verify Razorpay keys are correct
- Check if using test mode keys for development
- Ensure Razorpay script is loaded in browser

### Database connection errors
- Verify MySQL service is running
- Check database name and credentials
- Ensure migrations have been run

---

## Production Deployment

### Backend
1. Build TypeScript:
   ```bash
   npm run build
   ```
2. Set `NODE_ENV=production` in `.env`
3. Use a process manager like PM2:
   ```bash
   pm2 start dist/server.js --name library-backend
   ```

### Frontend
1. Build for production:
   ```bash
   npm run build
   ```
2. Deploy `dist/` folder to a static hosting service (Vercel, Netlify, etc.)
3. Update `VITE_API_URL` to point to production backend

---

## Support

For issues or questions, please refer to:
- Backend API documentation
- Frontend component documentation
- Database schema diagram
