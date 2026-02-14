
## Features

### Core Features
 **User Authentication** - Secure registration and login with JWT tokens  
 **Text Sharing** - Share text content with auto-expiring links  
 **File Sharing** - Upload and share files (images, PDFs, documents) up to 50MB  
 **Auto-Expiration** - Content automatically deletes after set time (10 min - 30 days)  
 **Shareable Links** - Generate unique, secure URLs for each upload  

### Bonus Features
**Password Protection** - Add passwords to links for extra security  
**One-Time Links** - Content self-destructs after first view  
**View Limits** - Set maximum number of views before deletion  
**Manual Delete** - Remove content anytime from your dashboard  
**Background Cleanup** - Automated job removes expired content every 5 minutes  
**File Type Validation** - Whitelist-based file type security  

---
## Tech Stack

### Backend
- **Runtime:** Node.js v20.19+
- **Framework:** Express.js
- **Database:** SQLite3
- **Authentication:** JWT (jsonwebtoken), bcrypt
- **File Upload:** Multer
- **Validation:** Custom middleware
- **Scheduling:** node-cron (cleanup job)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v3
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **State Management:** React Context API

### Development Tools
- **Backend:** nodemon (hot reload)
- **Frontend:** Vite dev server (HMR)
- **Code Quality:** ESLint
- **Version Control:** Git

---

## Setup instructions

Before setting up ensure some prerequisites:

### Required Software
- **Node.js** v20.19+ or v22.12+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)

### Check Versions
```bash
node --version 
npm --version  
git --version  
```
---

### Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/skm5786/LinkVault-full_stack_application.git
cd LinkVault-full_stack_application.git
# Or download and extract the ZIP file
```

### Step 2: Backend Setup

```bash
cd backend

#Install dependencies
npm install
#can change the JWT_SECRET and SESSION_SECRET to some strong, random strings in backend/.env file

#Create uploads directory
mkdir -p uploads
```


### Step 3: Frontend Setup

```bash
cd ..
cd frontend

# Install dependencies
npm install
```
---


### step 4: Running the Application

You need **two terminal windows/tabs** - one for backend, one for frontend.

#### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

The backend API will be available at: **http://localhost:5001**

#### Terminal 2: Start Frontend Server

```bash
cd frontend
npm run dev
```
The frontend application will be available at: **http://localhost:5173**

---
## API overview

### Base URL
```
http://localhost:5001/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "test",
  "email": "test@example.com",
  "password": "testing123"
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "test",
      "email": "test@example.com"
    }
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "username": "test",
  "password": "testing123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer 

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "created_at": "2024-02-13T10:30:00.000Z"
  }
}
```

### Upload Endpoints

#### Upload Text
```http
POST /upload/text
Authorization: Bearer 
Content-Type: application/json

{
  "text": "This is my secret message",
  "expiryMinutes": 60,
  "password": "optional-password",
  "isOneTime": false,
  "maxViews": 10
}

Response: 201 Created
{
  "success": true,
  "message": "Text content created successfully",
  "data": {
    "id": 123,
    "unique_id": "abc123xyz",
    "share_url": "http://localhost:5001/share/abc123xyz",
    "content_type": "text",
    "expires_in_minutes": 60,
    "expires_at": "2024-02-13T11:30:00.000Z",
    "has_password": true,
    "is_one_time": false,
    "max_views": 10
  }
}
```

#### Upload File
```http
POST /upload/file
Authorization: Bearer 
Content-Type: multipart/form-data

file: document.pdf
expiryMinutes: 120
password: optional-password
isOneTime: false
maxViews: 5

Response: 201 Created
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 124,
    "unique_id": "def456uvw",
    "share_url": "http://localhost:5001/share/def456uvw",
    "content_type": "file",
    "file_name": "document.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    ...
  }
}
```

### Content Access Endpoints

#### View Content
```http
POST /content/:uniqueId
Content-Type: application/json

{
  "password": "optional-password-if-protected"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "type": "text",
    "content": "This is my secret message",
    "fileName": null,
    "mimeType": null,
    "createdAt": "2024-02-13T10:30:00.000Z",
    "expiresAt": "2024-02-13T11:30:00.000Z",
    "viewCount": 1,
    "maxViews": 10,
    "creatorUsername": "test"
  }
}
```

#### Download File
```http
GET /download/:uniqueId?password=optional-password

Response: File download
Content-Disposition: attachment; filename="document.pdf"
Content-Type: application/pdf
```

### User Dashboard Endpoints

#### Get User Dashboard
```http
GET /user/dashboard
Authorization: Bearer 

Response: 200 OK
{
  "success": true,
  "data": {
    "stats": {
      "total_content": 15,
      "text_count": 8,
      "file_count": 7,
      "total_views": 142,
      "active_content": 12
    },
    "content": [
      {
        "id": 123,
        "unique_id": "abc123xyz",
        "content_type": "text",
        "created_at": "2024-02-13T10:30:00.000Z",
        "expires_at": "2024-02-13T11:30:00.000Z",
        "view_count": 5,
        "max_views": 10,
        "has_password": true,
        "is_one_time": false
      },
      ...
    ]
  }
}
```

#### Delete Content
```http
DELETE /content/:linkId
Authorization: Bearer 

Response: 200 OK
{
  "success": true,
  "message": "Content deleted successfully"
}
```


Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (wrong password)
- `404` - Not Found
- `409` - Conflict (duplicate username/email)
- `500` - Internal Server Error

---

## Quick Start Summary

```bash
# 1. Clone and install
git clone https://github.com/skm5786/LinkVault-full_stack_application.git
cd LinkVault-full_stack_application.git

# 2. Setup backend
cd backend
npm install
mkdir uploads

# 3. Setup frontend
cd ../frontend
npm install

# 4. Run (in separate terminals)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# 5. Open browser
# http://localhost:5173
```
---
# Design desicions

### seperate Backend and Frontend
Using a traditional client-server architecture with a separate backend API and frontend SPA.
provides technology flexibility, Can change frontend framework without affecting backend

### RESTful API Architecture

Implement REST API with resource-based endpoints.
**API Structure:**
```
/api/auth/register          POST    - User registration
/api/auth/login             POST    - User login
/api/auth/me                GET     - Current user info
/api/upload/text            POST    - Upload text
/api/upload/file            POST    - Upload file
/api/content/:id            POST    - View content (password in body)
/api/download/:id           GET     - Download file
/api/user/dashboard         GET     - User dashboard
/api/content/:id            DELETE  - Delete content
```

### Stateless Authentication with JWT
using JWT (JSON Web Tokens) for authentication instead of session-based auth.
used because No server-side session storage required

---
### Technology Stack Decisions


### 1. Node.js + Express for Backend
Use Node.js runtime with Express.js framework.

because, it provides:
- Same language for frontend and backend
- Extensive npm package availability
- Efficient for I/O-heavy operations (file uploads/downloads)
- Fast development with minimal boilerplate
- Lightweight, unopinionated framework
- Large community, extensive documentation
- Excellent for I/O-bound operations
- Single-threaded event loop
- Good for handling many concurrent connections
- Not ideal for CPU-intensive tasks (but we don't have those)

---
### 2. SQLite for Database

Use SQLite as the primary database.
as it provies:
- No separate database server needed
- Runs in-process with application
- Instant setup, no installation
- Full transaction support
- Works on all operating systems

**Alternatives summarised:**
- **PostgreSQL:** Better concurrency, more features, but it requires separate server
- **MySQL:** Similar to PostgreSQL, but less feature-rich
- **MongoDB:** NoSQL, but relationships are important in the schema
- **Firebase:** Can lead to Vendor lock-in, less control

---

### 3. React for Frontend

Use React with functional components and hooks.
It provides:
- Reusable UI components
- Virtual DOM mechanism for efficient updates
- Extensive libraries and tools
- **Hooks:** Simpler state management than class components
- Built-in state management for auth


---

### 4. Vite as Build Tool

- Use Vite instead of Create React App or Webpack.
- As it requires minimal config
- Uses Rollup for optimal bundles
- Instant server start, fast refresh


### 5. Tailwind CSS for Styling

Use Tailwind CSS utility-first framework:
-  No need to write custom CSS
-  Design system built-in
- No need to invent class names
- Full theme customization

---
## Database Design Decisions

### 1. Soft Deletion Instead of Hard Deletion
- Implemented soft deletion with `deleted_at` in database timestamp instead of permanently deleting records.

- Hard delete after 30 days (cleanup job) except for permanent links
---

### 2. Unique Random IDs for Share Links

- Use short random alphanumeric IDs (e.g., "abc123xyz") instead of sequential IDs or UUIDs as you Can't guess other links by incrementing
- Possible combinations: 36^9 ≈ 101 trillion with Collision probability: Extremely low for <1M records

---

### 3. Password Storage with Bcrypt

- Use bcrypt for password hashing instead of other algorithms.
- As it makes Makes brute-force attacks impractical

```
Plain password: "mypassword123"
Bcrypt hash: "$2b$10$vFvHXmz8qTNnzVzp7ZNx6O7qJxVzp7ZNx6O7q..."
             ^^^^ ^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
             Algo Cost Salt + Hash (combined 60 chars)
```
---

## Security Design Decisions

### 1. JWT Token Expiration

- Set JWT expiration to 7 days instead of never expiring or very short durations.
- As they become Long enough for convenience, short enough for security


---

### 2. Password Validation Requirements

- Minimum 8 characters, no complexity requirements.
- Long passwords more secure than complex short ones


---

### 3. File Upload Restrictions

- Implemented whitelist-based file type validation with size limits.

**Blocked File Types:**
- Executables: .exe, .dll, .sh, .bat
- Scripts: .js, .php, .py (in upload context)
- System files: .sys, .ini


---

### 4. CORS Configuration

- Restrict CORS to specific frontend origin instead of allowing all origins.
- Prevents unauthorized websites from calling API and reduces cross-site request forgery risk

---

## API Design Decisions

### 1. Consistent Response Format

Use standardized response structure for all API endpoints.

---

### 2. POST for Content Viewing (with Optional Password)

Using POST instead of GET for `/api/content/:id` endpoint to support password in request body.

---

### 3. Separate Upload Endpoints for Text and Files

- Create separate `/upload/text` and `/upload/file` endpoints instead of single unified endpoint.
- meaninig text and files need different validation so Frontend knows exactly what to send

---

### 4. ID in URL Path vs Query Parameter

- Use path parameters for resource IDs instead of query parameters.
- As it is easier to cache by URL

---

## Frontend Design Decisions

### 1. Context API for Authentication State

- Use React Context API for global authentication state instead of Redux or other state management libraries.

### 2. Client-Side Routing with React Router

- Use React Router v6 for client-side routing instead of server-side routing.


### 3. Controlled Components for Forms

- Use controlled components (React state) for all form inputs instead of uncontrolled components or form libraries.


### 4. Axios for HTTP Requests
- Use Axios instead of native Fetch API.
 ---
## User Experience Decisions

### 1. Expiry Time Presets

Provide preset expiry times instead of only custom input which is more friendlier to use


**Presets:**
```javascript
[
  { label: '45 seconds', value: 0.75 },
  { label: '10 minutes', value: 10 },
  { label: '1 hour', value: 60 },
  { label: '24 hours', value: 1440 },
  { label: '7 days', value: 10080 },
  { label: '30 days', value: 43200 },
  { label: 'permanent', value: 525000 }
]
```

### 2.Copy Link Button

- Provide one-click copy button instead of requiring manual selection.


### 3. Success Screen After Upload

- Show success screen with link details instead of redirecting immediately.
 ---
## Assumptions and Limitations
### Core Assumptions

### User Environment assumptions
- Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
-  **Trusted Users:** Minimal abuse/spam expected
### Usage Patterns
- 100-10,000 active users
- Mostly small files (1-20 MB average)
- Most content expires within 1-7 days

### Content Types
- **Supported Files:** Images, PDFs, Office documents, text files, archives
- **Text Content:** Plain text only, no rich formatting

---

### Technical Limitations

#### Database (SQLite)
- **Single Writer:** Only one write operation at a time
- **Recommended Scale:** Up to 1,000 active users
- **Storage:** Performs well up to ~50 GB
- PostgreSQL for larger scale

#### File Storage
- **Local Filesystem:** Files stored on server disk
- **No Replication:** Single server storage only
- **Disk Capacity:** Limited by server disk space
- **No CDN:** Files served directly from origin server

#### Authentication
- **No Password Reset:** Forgot password = account lost (future feature)
- **No 2FA:** Username/password only
- **JWT Cannot Be Revoked:** Tokens valid until expiration (7 days)

#### Encryption
- **No End-to-End Encryption:** Server can read all content
- **HTTPS Only:** Data encrypted in transit but not at rest
- **Use Case:** Not suitable for highly classified information

#### Access Control
- **No User Roles:** All users have equal permissions
- **No Rate Limiting:** Currently vulnerable to spam (production needs this)
- **No Content Moderation:** No abuse reporting or admin tools

#### Single Server
- **No Load Balancing:** Single server deployment only
- **Single Point of Failure:** Server downtime = complete outage
- **Vertical Scaling Only:** Must upgrade server resources
- **No Auto-Scaling:** Manual scaling required

#### Performance
- **No Caching:** Every request hits database
- **No CDN:** Slow for geographically distant users
- **Background Jobs:** Cleanup runs in main process
 ---
## Future Improvements

1. Password reset via email
2. Rate limiting for production
3. Search and filter dashboard
4. Two-factor authentication
5. File preview (PDF, images)
6. Bulk operations (multi-select)
7. Usage analytics dashboard
8. CDN integration
9. Custom vanity URLs
10. Collaborative features
11. Rich text formatting
12. Mobile native apps

---

##  Troubleshooting

### Common Issues

#### "Port 5001 already in use"
```bash
# Find process using port
lsof -i :5001

# Kill the process
kill -9 <PID>

# Or change port to 5002 : three changes required in backend/.env, frontend/vite.config.js and frontend/src/services/api.js respectively
PORT=5002
target: 'http://localhost:5002'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
```

#### "Cannot find module"
```bash
# Reinstall dependencies
cd backend  # or frontend
rm -rf node_modules package-lock.json
npm install
```
---