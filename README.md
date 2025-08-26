# TutorTracker - Tax Management System

A comprehensive tax tracking application for self-employed tutors with two deployment options.

## 🚀 Two Versions Available

### 1. **Simple Version (Current)** - Personal Edition
- **Local Storage**: All data stored in browser
- **No Authentication**: Single-user application
- **No Database Required**: Works offline
- **Quick Setup**: Ready to use immediately

### 2. **Database Version** - Professional Edition
- **Multi-User Support**: Authentication system
- **Cloud Database**: Supabase integration
- **Role-Based Access**: User, Admin, Owner roles
- **Data Persistence**: Secure cloud storage

## 🔄 Switching Between Versions

### To Use Simple Version (Default):
```bash
# Already configured - no changes needed
npm run dev
```

### To Use Database Version:
1. **Update main.tsx:**
   ```typescript
   // Change this line in src/main.tsx:
   import App from './App-Simple.tsx';
   // To this:
   import App from './App-Database.tsx';
   ```

2. **Set up Supabase:**
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Copy project URL and anon key
   - Create `.env` file with your credentials:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

3. **Run database migration:**
   - Go to Supabase SQL Editor
   - Run the SQL from `supabase/migrations/20250825125255_round_snow.sql`

## ✨ Features

### Core Features (Both Versions)
- **Client Management**: Store client information and rates
- **Session Tracking**: Log tutoring sessions with payment status
- **Expense Tracking**: Categorize business expenses for tax deductions
- **Tax Reports**: Generate comprehensive tax reports
- **Calendar Import**: Import sessions from Google Calendar, Outlook, Apple Calendar
- **CSV Import/Export**: Bulk data management
- **Mileage Tracking**: Automatic calculation for in-person sessions

### Professional Edition Additional Features
- **Multi-User Support**: Unlimited user accounts
- **Role Management**: User, Admin, Owner permissions
- **Admin Dashboard**: User management and statistics
- **Cloud Sync**: Data accessible from any device
- **Data Security**: Enterprise-grade security with Supabase

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

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

## 🔒 Security (Professional Edition)

- **Row Level Security**: Database-level data isolation
- **Authentication**: Secure email/password login
- **Role-Based Access**: Granular permission system
- **Data Encryption**: All data encrypted in transit and at rest

## 📈 Deployment

### Simple Version
- Deploy to any static hosting (Netlify, Vercel, etc.)
- No backend configuration required

### Professional Edition
- Requires Supabase project setup
- Deploy frontend to static hosting
- Database automatically managed by Supabase

## 🆘 Support

For issues or questions:
1. Check the appropriate version documentation
2. Verify environment configuration
3. Ensure database migrations are applied (Professional Edition)

## 📄 License

This project is licensed under the MIT License.