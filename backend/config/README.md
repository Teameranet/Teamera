# Database Configuration

## Profiles Table Setup

To create the profiles table in your Supabase project:

1. Go to your Supabase project dashboard at https://supabase.com
2. Navigate to the **SQL Editor** section in the left sidebar
3. Click **New Query**
4. Copy the contents of `profiles-schema.sql` and paste it into the SQL editor
5. Click **Run** to execute the SQL

### What This Creates

The `profiles-schema.sql` file creates:

- **profiles table** with all required fields for user onboarding:
  - Basic info: id, email, name, title, bio
  - Onboarding fields: role, skills, experience, location
  - Social links: github_url, linkedin_url, portfolio_url
  - Structured data: education (JSONB), work_experience (JSONB)
  - Metadata: avatar_url, created_at, updated_at

- **Foreign key constraint** to auth.users(id) with CASCADE delete

- **Trigger** to automatically update the `updated_at` timestamp on profile updates

- **Row Level Security (RLS)** policies:
  - Users can view all profiles (public read access)
  - Users can only update their own profile
  - Users can only insert their own profile

- **Indexes** for optimized queries on email, role, and skills

### Verification

After running the SQL, verify the table was created:

```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';

-- Check triggers
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'profiles';
```

### Next Steps

After creating the profiles table:
1. Test the RLS policies by attempting to insert/update profiles
2. Verify the trigger works by updating a profile and checking the updated_at field
3. Integrate with the frontend AuthContext to save onboarding data
