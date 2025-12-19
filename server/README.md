# ReaDefy Backend Setup Instructions

## Prerequisites
- XAMPP installed with MySQL running
- Node.js and npm installed

## Setup Steps

### 1. Start MySQL in XAMPP
- Open XAMPP Control Panel
- Click "Start" next to MySQL module
- Ensure it's running (green indicator)

### 2. Create Database
Open your DataGrip or phpMyAdmin (http://localhost/phpmyadmin) and run:

```sql
CREATE DATABASE IF NOT EXISTS readefy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE readefy_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Or run the SQL file from the terminal:
```bash
mysql -u root < database/schema.sql
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
```

### 4. Configure Environment
The `.env` file is already created with XAMPP defaults:
- Database: `readefy_db`
- User: `root`
- Password: (empty/passwordless)
- Port: 3001

### 5. Start Backend Server
```bash
npm start
```

You should see:
```
✅ MySQL database connected successfully!
🚀 ReaDefy Backend Server running on port 3001
```

### 6. Update Frontend Environment
Make sure your `.env.local` file in the root project directory contains:
```
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 7. Start Frontend Server
In a new terminal, from the root project directory:
```bash
npm run dev
```

## Testing

### Test Backend API
```bash
# Health check
curl http://localhost:3001/api/health

# Test signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### Database Connection Failed
- Ensure XAMPP MySQL is running
- Check MySQL is on port 3306 (default)
- Verify database `readefy_db` exists

### Port 3001 Already in Use
- Change `PORT` in `server/.env` to another port (e.g., 3002)
- Update `VITE_API_URL` in frontend `.env.local` accordingly

### CORS Errors
- Ensure frontend is running on `http://localhost:5173`
- Check `CORS_ORIGIN` in `server/.env` matches your frontend URL

## Security Notes

✅ **Improvements Made:**
- Passwords are now hashed with bcrypt (10 salt rounds)
- No plain text password storage
- JWT tokens for session management
- Secure API endpoints

⚠️ **For Production:**
- Change `JWT_SECRET` in `.env` to a strong random string
- Use HTTPS
- Add rate limiting
- Implement password strength requirements
- Add email verification
