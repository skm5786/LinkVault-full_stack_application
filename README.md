# 🔐 LinkVault - Secure File & Text Sharing

A full-stack web application for secure, temporary file and text sharing with advanced access controls.

## 🌟 Features

### Core Features
- ✅ Upload text or files (up to 50MB)
- ✅ Generate unique, hard-to-guess URLs
- ✅ Automatic content expiry (10 min to 30 days)
- ✅ Link-based access control
- ✅ Text viewing with copy-to-clipboard
- ✅ File download functionality

### 🎁 Bonus Features (ALL IMPLEMENTED)
- ✅ **User Authentication** - JWT-based auth with registration/login
- ✅ **Password-Protected Links** - Add password requirement to content
- ✅ **One-Time View Links** - Content auto-deletes after first view
- ✅ **Maximum View Limits** - Set view/download count limits
- ✅ **Manual Delete** - Users can delete their content before expiry
- ✅ **User Dashboard** - View upload history and statistics
- ✅ **File Type Validation** - Security filters for dangerous files
- ✅ **Background Cleanup Job** - Automatic deletion of expired content
- ✅ **Access Logging** - Track views and downloads

## 🛠 Tech Stack

**Frontend:**
- React 18.3 + Vite
- Tailwind CSS
- React Router v6
- Axios
- Context API for state

**Backend:**
- Node.js 18.x
- Express.js
- SQLite3 (perfect for localhost)
- JWT authentication
- bcryptjs for password hashing
- node-cron for cleanup jobs
- Multer for file uploads

## 📦 Installation & Setup

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=change-this-secret-key
SESSION_SECRET=change-this-session-secret
```

3. Create uploads directory:
```bash
mkdir uploads
```

4. Start backend:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start frontend:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📖 Usage

### Basic Flow
1. Register/Login (optional - upload works without account)
2. Upload text or file
3. Configure options:
   - Set expiry time
   - Add password (optional)
   - Enable one-time view (optional)
   - Set view limit (optional)
4. Share generated link
5. Recipients access content via link

### With User Account
- View upload history in dashboard
- See statistics (total uploads, views)
- Delete content before expiry
- Track view counts

## 🏗 Architecture

### High-Level Flow