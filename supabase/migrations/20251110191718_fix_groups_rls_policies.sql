/*
  # Fix Groups RLS Policies

  1. Changes
    - Drop existing restrictive policies on groups table
    - Add new permissive policies that allow anyone to create and manage groups
    - This enables the app to work without authentication

  2. Security Notes
    - Groups are now publicly accessible
    - Anyone can create, read, update, and delete groups
    - This is appropriate for a shared expense tracking app without user authentication
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON groups;

-- Create new permissive policies
CREATE POLICY "Public can view groups"
  ON groups FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can create groups"
  ON groups FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update groups"
  ON groups FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete groups"
  ON groups FOR DELETE
  TO public
  USING (true);