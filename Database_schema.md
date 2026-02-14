## Overview

Using a **SQLite** database with two main tables:
- **users** - Stores user account information
- **content** - Stores uploaded content (text and files) with metadata

The database is designed to support:
- User authentication and authorization
- Content storage with automatic expiration
- Password-protected links
- One-time view functionality
- View/download limits
- Soft deletion


## Tables

### Users Table

Stores user account information for authentication and authorization.

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INTEGER | NO | AUTO | Primary key, auto-incremented |
| `username` | TEXT | NO | - | Unique username (3-30 chars) |
| `email` | TEXT | NO | - | Unique email address |
| `password_hash` | TEXT | NO | - | Bcrypt hashed password |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Account creation timestamp |
| `last_login` | TIMESTAMP | YES | NULL | Last successful login timestamp |

#### Constraints

- **Primary Key:** `id`
- **Unique Constraints:** `username`, `email`
- **Not Null:** `username`, `email`, `password_hash`, `created_at`

---

### Content Table

Stores all uploaded content (text and files) with metadata for expiration, password protection, and view limits.


#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INTEGER | NO | AUTO | Primary key, auto-incremented |
| `unique_id` | TEXT | NO | - | Unique shareable ID (e.g., "abc123xyz") |
| `user_id` | INTEGER | NO | - | Foreign key to users table |
| `content_type` | TEXT | NO | - | Either 'text' or 'file' |
| `text_content` | TEXT | YES | NULL | The actual text content (if text type) |
| `file_path` | TEXT | YES | NULL | File system path (if file type) |
| `file_name` | TEXT | YES | NULL | Original filename |
| `file_size` | INTEGER | YES | NULL | File size in bytes |
| `mime_type` | TEXT | YES | NULL | MIME type (e.g., 'image/png') |
| `password_hash` | TEXT | YES | NULL | Bcrypt hash if password protected |
| `is_one_time` | BOOLEAN | NO | 0 (false) | Delete after first view |
| `max_views` | INTEGER | YES | NULL | Maximum allowed views (NULL = unlimited) |
| `view_count` | INTEGER | NO | 0 | Current number of views |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Upload timestamp |
| `expires_at` | TIMESTAMP | NO | - | Expiration timestamp (required) |
| `last_accessed_at` | TIMESTAMP | YES | NULL | Last view/download timestamp |
| `deleted_at` | TIMESTAMP | YES | NULL | Soft deletion timestamp |

#### Constraints

- **Primary Key:** `id`
- **Unique Constraint:** `unique_id`
- **Foreign Key:** `user_id` → `users.id` (CASCADE on delete)
- **Check Constraint:** `content_type IN ('text', 'file')`
- **Not Null:** `unique_id`, `user_id`, `content_type`, `expires_at`, `created_at`


#### Soft Deletion

Content is soft-deleted by setting `deleted_at`:

```sql
-- Soft delete
UPDATE content 
SET deleted_at = CURRENT_TIMESTAMP 
WHERE id = 123;

-- Query only active content
SELECT * FROM content 
WHERE deleted_at IS NULL;
```

---

### Data Types used

| Storage Class | Description | Example Values |
|---------------|-------------|----------------|
| INTEGER | Signed integer | 1, -42, 1000000 |
| TEXT | UTF-8 string | 'hello', 'user@example.com' |
| REAL | Floating point | 3.14, -273.15 |
| BLOB | Binary data | File contents |
| NULL | Null value | NULL |
