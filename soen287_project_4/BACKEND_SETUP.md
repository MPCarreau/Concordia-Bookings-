# Backend Setup Instructions

## Prerequisites
1. Cloudflare account
2. Wrangler CLI installed (`npm install -g wrangler` or use `npx wrangler`)

## Database Setup

### 1. Create D1 Database
```bash
npm run db:create
```
This will create a new D1 database. Copy the database ID from the output.

### 2. Update wrangler.toml
Replace `your-database-id` in `wrangler.toml` with the actual database ID from step 1.

### 3. Run Database Migration
```bash
npm run db:migrate
```

## Worker Setup

### 1. Authentication
```bash
npm run login
```

### 2. Deploy Worker
```bash
npm run worker:deploy
```
Copy the Worker URL from the deployment output.

### 3. Update Frontend
In `register.html`, replace `https://your-worker-url.your-subdomain.workers.dev` with your actual Worker URL.

## Local Development

### 1. Local Database Migration
```bash
npm run db:migrate:local
```

### 2. Start Local Worker
```bash
npm run worker:dev
```

### 3. Start Local Pages
```bash
npm run dev
```

## Production Deployment

1. Deploy Worker: `npm run worker:deploy`
2. Deploy Pages: `npm run deploy`

## Database Schema

The `users` table contains:
- `id` - Auto-incrementing primary key
- `first_name` - User's first name
- `last_name` - User's last name
- `email` - Unique email address
- `phone_number` - Phone number
- `password_hash` - SHA-256 hashed password
- `created_at` - Registration timestamp
- `updated_at` - Last update timestamp

The `password_reset_tokens` table contains:
- `id` - Auto-incrementing primary key
- `user_id` - Foreign key to users table
- `token` - Unique reset token
- `expires_at` - Token expiration timestamp (1 hour)
- `created_at` - Token creation timestamp
- `used_at` - Token usage timestamp (NULL if unused)

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token
- `GET /api/health` - Health check

## Security Notes

- Passwords are hashed using SHA-256 (consider upgrading to bcrypt for production)
- CORS is enabled for all origins (restrict in production)
- Input validation is implemented on both client and server side