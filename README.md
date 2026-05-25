Concordia Booking Website

This is a collaborative project 
A web-based resource booking system built with Express.js, MySQL, and vanilla JavaScript.

## 🎯 Features

- User authentication (register, login, email verification)
- Resource browsing and booking
- Admin dashboard for managing bookings
- Booking approval system
- Maintenance mode for resources
- Email notifications via SendGrid

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Email**: SendGrid (nodemailer)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (via XAMPP or standalone)
- SendGrid account (for email functionality)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd soen287_project_2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update database credentials
   - Add your SendGrid API key

4. **Setup database**
   - Import `database/complete_setup_all_data.sql` in phpMyAdmin
   - Or run: `mysql -u root -p < database/complete_setup_all_data.sql`
   - Import `database/bookings_data.sql` for booking history

5. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:3000/api`
   - Health check: `http://localhost:3000/api/health`

## 📁 Project Structure

```
soen287_project_2/
├── server.js              # Express.js API server
├── package.json           # Node.js dependencies
├── .env                   # Environment configuration (not in git)
├── *.html                 # Frontend pages
├── static/                # CSS and JavaScript
├── images/                # Static assets
├── database/              # SQL schema and data
└── src/                   # Additional backend files
```

## 🔐 Admin Accounts

Default admin credentials for testing:

| Email | Password | Role |
|-------|----------|------|
| michaelkauzman2001@gmail.com | admin123 | admin |

## 🚀 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/verify-email` - Email verification
- `POST /api/login` - User login
- `POST /api/admin/login` - Admin login
- `POST /api/forgot-password` - Password reset request
- `POST /api/reset-password` - Reset password
- `GET /api/user/role` - Get user role
- `PUT /api/update-profile` - Update user profile

### Resources & Bookings
- `GET /api/resources` - Get all resources
- `GET /api/bookings` - Get bookings by date/category
- `POST /api/bookings` - Create booking
- `GET /api/user-bookings` - Get user's bookings
- `POST /api/cancel-booking` - Cancel booking
- `POST /api/toggle-maintenance` - Block/unblock time slot

### Admin Features
- `GET /api/booking-approval-mode` - Get approval mode status
- `POST /api/booking-approval-mode` - Set approval mode
- `GET /api/pending-booking-requests` - Get pending requests
- `GET /api/user-pending-booking-requests` - Get user's pending requests
- `POST /api/approve-booking-request` - Approve booking request
- `POST /api/reject-booking-request` - Reject booking request

## 📚 Documentation

- [Express Setup Guide](EXPRESS_SETUP_GUIDE.md)
- [Database Import Guide](DATA_IMPORT_GUIDE.md)
- [Migration Guide](MIGRATION_GUIDE.md)

## 🤝 Contributing

This is a course project for SOEN287. Contributions are welcome for educational purposes.

## 📝 License

This project is created for educational purposes as part of SOEN287 coursework.

## 👥 Team

- Michael Kauzman
- Dafan Ho
- Micah Carreau
- Nadezhda Gagnon

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=soen287_project
BASE_URL=http://localhost:3000
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

## 🐛 Known Issues

- Email functionality requires valid SendGrid API key
- Database must be created and imported before running
- Port 3000 must be available

## 📞 Support

For issues or questions, please open an issue on GitHub.

