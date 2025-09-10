# TutorTracker - Tax Management System

A comprehensive tax tracking application for self-employed tutors.

## 🚀 Current Version: Professional Edition

**Current Setup**: Multi-user authentication with cloud database sync
- **Cross-Platform Sync**: Access your data from web, mobile app, or any device
- **User Authentication**: Secure login system
- **Cloud Database**: Supabase integration for data persistence
- **Role-Based Access**: User, Admin, Owner permissions
- **Real-time Sync**: Changes sync instantly across all your devices

## ✨ Features

### Core Features
- **Client Management**: Store client information and rates
- **Session Tracking**: Log tutoring sessions with payment status
- **Expense Tracking**: Categorize business expenses for tax deductions
- **Tax Reports**: Generate comprehensive tax reports
- **Calendar Import**: Import sessions from Google Calendar, Outlook, Apple Calendar
- **CSV Import/Export**: Bulk data management
- **Mileage Tracking**: Automatic calculation for in-person sessions

### Professional Features
- **Cross-Device Access**: Same data on web, mobile, and desktop
- **Role Management**: User, Admin, Owner permissions
- **Admin Dashboard**: User management and statistics
- **Data Security**: Enterprise-grade security with Supabase

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env and add your Supabase credentials
cp .env.example .env

# Get credentials from https://supabase.com
# VITE_SUPABASE_URL=your_project_url
# VITE_SUPABASE_ANON_KEY=your_anon_key

# Start development server
npm run dev
```

## 📊 Tax Categories Supported

- **Home Office**: Rent, mortgage interest (business portion)
- **Utilities**: Electricity, heating, internet (business portion)
- **Phone**: Business phone expenses
- **Supplies**: Teaching materials, books, stationery
- **Vehicle**: Gas, maintenance, repairs (business use)
- **Professional Development**: Training, courses, conferences
- **Marketing**: Advertising, website, business cards

## 📅 Calendar Import Support

- **Google Calendar**: Export as ICS
- **Outlook**: Save as iCalendar format
- **Apple Calendar**: Export calendar
- **CSV Exports**: From various calendar applications

## 📱 Mobile Apps

Build native mobile apps for Android and iOS:

```bash
# Build mobile-ready version
npm run build:mobile

# Add platforms
npm run add:android  # For Android
npm run add:ios      # For iOS (macOS only)
```

## 🔒 Security

- **Row Level Security**: Database-level data isolation
- **Authentication**: Secure email/password login
- **Role-Based Access**: Granular permission system
- **Data Encryption**: All data encrypted in transit and at rest

## 🌐 Access Anywhere
Your data syncs across all platforms:
- **Web App**: Access from any browser
- **Mobile Apps**: Native Android and iOS apps
- **Desktop**: Progressive Web App (PWA) support

## 🆘 Support

For issues or questions:
1. Check the appropriate version documentation
2. Verify environment configuration
3. Ensure database migrations are applied (Professional Edition)

## 📄 License

This project is licensed under the MIT License.