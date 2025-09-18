# Admin Portal Whitelist Setup Guide

This guide will help you set up the admin portal with whitelist functionality for managing user registrations.

## Overview

The whitelist system ensures that:
- **Patients** can register directly without approval
- **Doctors, Staff, and Admins** must be whitelisted by an admin before they can register

## Setup Steps

### 1. Database Setup

Run the whitelist schema in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of whitelist-schema.sql
```

This creates:
- `whitelist` table for managing user approvals
- Helper functions for checking whitelist status
- RLS policies for admin-only access
- Admin view for dashboard display

### 2. Edge Functions Setup

Deploy the edge functions to your Supabase project:

#### Add Whitelist User Function
```bash
# Deploy the add-whitelist-user function
supabase functions deploy add-whitelist-user
```

#### Approve Whitelist User Function
```bash
# Deploy the approve-whitelist-user function
supabase functions deploy approve-whitelist-user
```

### 3. Environment Variables

Ensure your Supabase project has the necessary environment variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

### 4. Admin Access

To access the admin portal:
1. Create an admin user manually in Supabase Auth
2. Set the user's `user_type` to 'admin' in their metadata
3. Create a corresponding profile record
4. Log in with the admin account
5. Navigate to `/admin` to access the dashboard

## How It Works

### Registration Flow

1. **Patient Registration**: 
   - Patients can register directly at `/signup`
   - No whitelist check required
   - Account created immediately

2. **Non-Patient Registration**:
   - Doctors, staff, and admins select their type at `/signup`
   - System checks if they're whitelisted
   - If not whitelisted: Shows error message
   - If whitelisted: Proceeds with registration

### Admin Workflow

1. **Add User to Whitelist**:
   - Admin goes to `/admin` dashboard
   - Clicks "Add User to Whitelist"
   - Fills in user details (email, type, department, etc.)
   - User is added with "pending" status

2. **Approve User**:
   - Admin sees pending users in the dashboard
   - Clicks "Approve" for a user
   - Sets a password for the user
   - System creates the user account automatically
   - User can now log in with their email and the set password

3. **Reject User**:
   - Admin can reject users if needed
   - User status changes to "rejected"
   - User cannot register

## Features

### Admin Dashboard Features

- **User Whitelist Management**: Add, approve, or reject users
- **Department Management**: View and manage departments
- **Status Tracking**: See pending, approved, and rejected users
- **User Details**: View full user information including department and specialization
- **Bulk Operations**: Manage multiple users efficiently

### Security Features

- **Admin-Only Access**: Only users with `user_type = 'admin'` can access the dashboard
- **RLS Policies**: Database-level security ensures only admins can manage whitelist
- **Edge Function Security**: Functions verify admin status before processing requests
- **Password Management**: Admins set initial passwords for approved users

## API Endpoints

### Add User to Whitelist
```
POST /functions/v1/add-whitelist-user
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "doctor@example.com",
  "user_type": "doctor",
  "full_name": "Dr. John Doe",
  "phone": "+1234567890",
  "department_id": "uuid",
  "specialization": "Cardiology",
  "license_number": "MD123456"
}
```

### Approve/Reject User
```
POST /functions/v1/approve-whitelist-user
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "whitelist_id": "uuid",
  "action": "approve", // or "reject"
  "password": "secure_password" // required for approve
}
```

## Database Schema

### Whitelist Table
- `id`: UUID primary key
- `email`: User's email address (unique)
- `user_type`: 'doctor', 'staff', or 'admin'
- `full_name`: User's full name
- `phone`: Contact number
- `department_id`: Foreign key to departments table
- `specialization`: For doctors only
- `license_number`: For doctors only
- `status`: 'pending', 'approved', or 'rejected'
- `invited_by`: Admin who added the user
- `approved_by`: Admin who approved the user
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Troubleshooting

### Common Issues

1. **"User already whitelisted" error**:
   - Check if the email already exists in the whitelist
   - Use a different email or update the existing entry

2. **"Admin access required" error**:
   - Ensure the user has `user_type = 'admin'` in their profile
   - Check RLS policies are correctly set up

3. **Edge function deployment fails**:
   - Verify Supabase CLI is installed and configured
   - Check function code for syntax errors
   - Ensure proper environment variables are set

4. **Whitelist check fails**:
   - Verify the `can_user_register` function is created
   - Check if the user is properly whitelisted with 'approved' status

### Testing

1. **Test Patient Registration**:
   - Go to `/signup`
   - Select "Patient"
   - Complete registration
   - Should work without whitelist

2. **Test Non-Patient Registration**:
   - Go to `/signup`
   - Select "Doctor", "Staff", or "Admin"
   - Try to register
   - Should show whitelist error

3. **Test Admin Functions**:
   - Log in as admin
   - Go to `/admin`
   - Add a user to whitelist
   - Approve the user
   - Test registration with that user

## Security Considerations

- **Admin Account Security**: Use strong passwords for admin accounts
- **Regular Audits**: Review whitelist entries regularly
- **Access Logs**: Monitor admin actions
- **Password Policies**: Enforce strong passwords for approved users
- **Email Verification**: Consider adding email verification for approved users

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify database schema is correctly applied
3. Ensure edge functions are deployed
4. Check Supabase logs for function errors
5. Verify RLS policies are working correctly

