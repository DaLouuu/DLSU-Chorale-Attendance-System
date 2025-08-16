# Authentication System Documentation

## Overview

The DLSU Chorale Attendance System now uses **Supabase's built-in JWT-based authentication** instead of Google OAuth. This provides better security, control, and user management capabilities.

## Key Changes

### ✅ What Was Removed
- Google OAuth authentication
- User registration page (`/register`)
- Public user signup functionality
- OAuth callback routes

### ✅ What Was Added
- Email/password authentication
- JWT-based sessions
- Admin user management panel
- Secure password handling
- Row-level security (RLS)

## Authentication Flow

```
1. Admin creates user account → 2. User logs in → 3. JWT session created → 4. Access granted
```

### Detailed Flow

1. **User Creation (Admin Only)**
   - Administrator logs into admin panel
   - Creates new user with email, password, name, and role
   - User account is automatically confirmed
   - User can immediately log in

2. **User Login**
   - User visits `/login` page
   - Enters email and password
   - Supabase validates credentials
   - JWT session is created and stored
   - User is redirected to dashboard

3. **Session Management**
   - JWT tokens are automatically refreshed
   - Sessions persist across browser sessions
   - Middleware validates sessions on each request
   - Unauthorized access is redirected to login

4. **Access Control**
   - Middleware checks user permissions
   - Admin routes are protected
   - User accounts are verified against database
   - Role-based access control enforced

## Database Schema

### Accounts Table

```sql
CREATE TABLE accounts (
  account_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('member', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own account
CREATE POLICY "Users can view own account" ON accounts
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Admins can manage all accounts
CREATE POLICY "Admins can manage all accounts" ON accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE auth_user_id = auth.uid() 
      AND user_type = 'admin'
    )
  );
```

## Environment Variables

Create a `.env.local` file with:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Admin Functions

### User Management

- **Create User**: Add new members or admins
- **Edit User**: Update names and roles
- **Delete User**: Remove user accounts
- **Reset Password**: Set new passwords for users

### Security Features

- **Service Role Key**: Admin operations use elevated privileges
- **Password Hashing**: Supabase handles secure password storage
- **Session Management**: Automatic token refresh and validation
- **Access Control**: Role-based permissions enforced

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login (handled by Supabase)
- `POST /api/auth/logout` - User logout

### Admin Operations
- `POST /api/admin/users` - Create user (server action)
- `PUT /api/admin/users/:id` - Update user (server action)
- `DELETE /api/admin/users/:id` - Delete user (server action)
- `POST /api/admin/users/:id/reset-password` - Reset password (server action)

## Security Considerations

### JWT Tokens
- Tokens are automatically refreshed
- Stored securely in HTTP-only cookies
- Short expiration times for security
- Automatic session validation

### Admin Access
- Service role key required for admin operations
- Row-level security prevents unauthorized access
- Admin status verified on each operation
- Audit trail through database timestamps

### Password Security
- Passwords are never stored in plain text
- Supabase handles secure hashing
- Password reset requires admin intervention
- Strong password policies enforced

## Troubleshooting

### Common Issues

1. **"Service role key required"**
   - Ensure `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` is set
   - Check that the key has admin privileges

2. **"User not found"**
   - Verify user exists in both `auth.users` and `accounts` tables
   - Check RLS policies are correctly configured

3. **"Authentication failed"**
   - Verify Supabase URL and keys are correct
   - Check that email/password authentication is enabled
   - Ensure user account is confirmed

4. **"Permission denied"**
   - Verify user has correct role in accounts table
   - Check RLS policies allow the operation
   - Ensure admin status is properly set

### Debug Steps

1. Check browser console for client-side errors
2. Verify Supabase dashboard authentication settings
3. Test database queries directly in Supabase SQL editor
4. Check environment variables are loaded correctly
5. Verify RLS policies are active and working

## Migration Guide

### From Google OAuth

1. **Disable Google Provider**
   - Go to Supabase Dashboard → Authentication → Providers
   - Disable Google OAuth

2. **Enable Email Provider**
   - Ensure email authentication is enabled
   - Set email confirmation to false (for admin-created accounts)

3. **Create Admin Account**
   - Use Supabase Dashboard → Authentication → Users
   - Create your first admin user manually

4. **Set Up Database**
   - Run the SQL schema provided in setup.md
   - Configure RLS policies

5. **Test Authentication**
   - Try logging in with admin account
   - Create test user through admin panel
   - Verify all functionality works

## Best Practices

### User Management
- Always verify admin status before operations
- Use service role key only for admin functions
- Implement proper error handling and logging
- Regular security audits of user accounts

### Security
- Keep service role key secure and private
- Regularly rotate admin passwords
- Monitor authentication logs
- Implement rate limiting for login attempts

### Development
- Use environment variables for all secrets
- Test authentication flows thoroughly
- Implement proper error boundaries
- Add comprehensive logging for debugging

## Support

For authentication issues:

1. Check this documentation first
2. Review Supabase authentication logs
3. Verify environment configuration
4. Test with minimal setup
5. Contact system administrator

---

**Note**: This authentication system provides enterprise-grade security while maintaining ease of use for administrators and end users.
