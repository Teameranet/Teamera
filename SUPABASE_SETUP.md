# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: teamera (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development

## Step 2: Get Your API Keys

Once your project is created:

1. Go to **Project Settings** (gear icon in the sidebar)
2. Navigate to **API** section
3. You'll find:
   - **Project URL**: Copy this value
   - **Project API keys**:
     - `anon` `public` key: Copy this value
     - `service_role` `secret` key: Copy this value (keep this secure!)

## Step 3: Update Environment Variables

### Root Directory `.env` file:

Replace the placeholder values in `.env` with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
VITE_API_URL=http://localhost:5000
```

### Backend Directory `backend/.env` file:

Replace the placeholder values in `backend/.env` with your actual Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-actual-service-role-key
SUPABASE_ANON_KEY=your-actual-anon-key
PORT=5000
JWT_SECRET=generate-a-random-secret-key-here
NODE_ENV=development
```

**Important**: 
- The `JWT_SECRET` should be a random string. You can generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Never commit your `.env` files to version control
- The `.env.example` files are templates for other developers

## Step 4: Verify Installation

Run the following commands to verify the installation:

```bash
# Check root directory
npm list @supabase/supabase-js

# Check backend directory
cd backend
npm list @supabase/supabase-js
```

## Next Steps

After completing this setup:
1. Proceed to Task 2: Create database schema and security policies
2. The database schema SQL file will be created in `backend/config/database-schema.sql`
3. You'll execute this SQL in the Supabase SQL Editor to create all tables

## Troubleshooting

### Can't find API keys?
- Make sure you're in the correct project
- Go to Settings → API
- The keys are displayed in the "Project API keys" section

### Installation failed?
- Make sure you have Node.js installed (v16 or higher)
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Environment variables not loading?
- Make sure the `.env` file is in the correct directory
- Restart your development server after changing `.env` files
- For Vite (frontend), variables must start with `VITE_`
