# Local Development Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with your Supabase credentials:

   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit with your actual values
   nano .env.local
   ```

   Required variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Getting Your Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy the **Project URL**, **anon public** key, and **service_role** key
5. Paste them in your `.env.local` file

## Setting Up Authentication

### 1. Enable Email/Password Authentication in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Disable **Google** provider (since we're not using OAuth)
4. Set **Confirm email** to **false** (since admins will create confirmed accounts)

### 2. Create Your First Admin User

Since the system now requires admin-created accounts:

1. Go to **Authentication** → **Users** in Supabase
2. Click **Add User**
3. Enter your email and password
4. Set **Email confirmed** to **true**
5. Click **Create User**

### 3. Set Up the Database

1. Go to **SQL Editor** in Supabase
2. Run the following SQL to create the accounts table:

```sql
CREATE TABLE IF NOT EXISTS accounts (
  account_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('member', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accounts_auth_user_id ON accounts(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);

-- Insert your admin account
INSERT INTO accounts (auth_user_id, email, name, user_type)
VALUES (
  'YOUR_AUTH_USER_ID_HERE', -- Replace with the UUID from step 2
  'your-email@example.com', -- Replace with your email
  'Your Name', -- Replace with your name
  'admin'
);
```

### 4. Set Up Row Level Security (RLS)

```sql
-- Enable RLS on accounts table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own account
CREATE POLICY "Users can view own account" ON accounts
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Policy for admins to manage all accounts
CREATE POLICY "Admins can manage all accounts" ON accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE auth_user_id = auth.uid() 
      AND user_type = 'admin'
    )
  );
```

## Authentication Flow

The new system works as follows:

1. **User Creation**: Administrators create user accounts through the admin panel
2. **Login**: Users log in with email/password (no registration needed)
3. **JWT Sessions**: Supabase handles JWT-based authentication automatically
4. **Access Control**: Middleware checks user permissions and account status

## Admin Features

- **Member Management**: Create, edit, and delete user accounts
- **Password Reset**: Reset user passwords through admin panel
- **Role Management**: Assign admin or member roles to users
- **User Monitoring**: View all user accounts and their status

## Troubleshooting

- **"Supabase client error"**: Check that your `.env.local` file exists and has the correct Supabase URL and keys
- **"Build failed"**: Make sure all dependencies are installed with `pnpm install`
- **"Port already in use"**: Kill any existing processes on port 3000 or use a different port with `pnpm dev --port 3001`
- **"Authentication failed"**: Ensure your Supabase service role key is correct and RLS policies are set up properly
- **"User not found"**: Make sure the user account exists in both auth.users and accounts tables

## What Was Changed

This project has been updated to use Supabase's built-in JWT authentication:

✅ **Removed Google OAuth** - Now uses email/password authentication only  
✅ **Removed user registration** - Users are created by administrators only  
✅ **Added JWT-based sessions** - Supabase handles authentication automatically  
✅ **Added admin management** - Administrators can create and manage user accounts  
✅ **Updated middleware** - Now properly handles JWT sessions and account verification  
✅ **Added member management** - Admin panel for user account management  

You can now develop locally using `pnpm install` and `pnpm dev` with secure, admin-controlled user authentication!
