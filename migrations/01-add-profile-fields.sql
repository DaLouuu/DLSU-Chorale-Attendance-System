-- Add new profile fields to Users table
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "birthday" TEXT,
ADD COLUMN IF NOT EXISTS "id_number" TEXT,
ADD COLUMN IF NOT EXISTS "degree_program" TEXT,
ADD COLUMN IF NOT EXISTS "contact_number" TEXT,
ADD COLUMN IF NOT EXISTS "profile_image_url" TEXT;

-- Create storage bucket for profile images if it doesn't exist
-- Note: This needs to be run in the Supabase dashboard or via the Supabase CLI
