# C.H.A.O.S. Testing Guide

## Overview

This guide explains how to set up and test the C.H.A.O.S. (Communication Hub for Animated Online Socializing) application. The testing environment includes pre-configured users, conversations, and channels to help you explore the functionality without manual setup.

## Prerequisites

- **Windows or Linux** - The application is cross-platform compatible
- **Node.js** (v16+) and npm
- **PostgreSQL** (v12+) running locally
- **Python** (v3.8+) for virtual environment

## Quick Setup for Testing

### Windows Setup

1. Run the test setup script:
   ```powershell
   .\test-setup.ps1
   ```

   This script will:
   - Create/activate a Python virtual environment
   - Check PostgreSQL status
   - Install backend and frontend dependencies
   - Set up the database schema
   - Seed the database with test data

2. Start the application:
   ```powershell
   .\run.ps1
   ```

### Linux Setup

1. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. Seed the database:
   ```bash
   cd Backend
   npm run seed
   cd ..
   ```

3. Start the backend and frontend in separate terminals:
   ```bash
   # Terminal 1
   cd Backend
   npm run dev
   
   # Terminal 2
   cd Frontend
   npm run dev
   ```

## Test Accounts

The seed script creates the following test accounts:

| Username | Password    | Role  | Status |
|----------|-------------|-------|--------|
| admin    | password123 | ADMIN | ONLINE |
| alice    | password123 | USER  | ONLINE |
| bob      | password123 | USER  | AWAY   |
| carol    | password123 | USER  | BUSY   |
| dave     | password123 | USER  | OFFLINE|

## Test Scenarios

### 1. Authentication

- Log in with the admin account
- Test registration with a new account
- Test password recovery flow (if implemented)
- Test logout functionality

### 2. User Statuses

- Change your status between Online, Away, Busy, and Offline
- Set a custom status message
- Observe status changes in the contacts list

### 3. Messaging

- Send direct messages between users
- Test emoji support
- Test typing indicators

### 4. Hub (Server) and Channels

- Join the "C.H.A.O.S HQ" hub
- Send messages in the "general" and "random" channels
- Test channel member permissions

### 5. Friend Management

- Accept the pending friend request from Dave
- Send a new friend request
- Remove a friend

### 6. Profile Customization

- Update your profile information
- Change your avatar
- Modify display name

## Troubleshooting

### Database Connection Issues

If you encounter database connection problems:

1. Ensure PostgreSQL is running:
   ```powershell
   # Windows
   Get-Service -Name "postgresql*"
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Verify .env configuration:
   - Check `DATABASE_URL` in `Backend/.env`
   - Default is: `postgresql://postgres:postgres@localhost:5432/chaos_db`

### Frontend Connection Issues

If the frontend cannot connect to the backend:

1. Check that the backend is running on port 3000
2. Verify that CORS is properly configured
3. Make sure `VITE_API_URL` in `Frontend/.env` is set to `http://localhost:3000`

## Reset Testing Environment

To reset all test data and start fresh:

```powershell
# Windows
cd Backend
npx prisma migrate reset --force
npm run seed

# Linux
cd Backend
npx prisma migrate reset --force
npm run seed
```

## Next Steps After Testing

Once basic functionality is verified, consider:

1. Testing on multiple browsers simultaneously to verify real-time updates
2. Stress testing with multiple users
3. Implementing additional features like voice/video chat
4. Enhancing UI customization options
