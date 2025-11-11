/*
  # Create Expense Tracking Schema

  1. New Tables
    - `groups`
      - `id` (uuid, primary key)
      - `name` (text) - Group name
      - `code` (text, unique) - Unique 6-character group code
      - `created_at` (timestamptz)
      - `created_by` (uuid) - Reference to auth.users
    
    - `group_members`
      - `id` (uuid, primary key)
      - `group_id` (uuid) - Reference to groups
      - `name` (text) - Member name
      - `email` (text) - Member email
      - `created_at` (timestamptz)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `group_id` (uuid) - Reference to groups
      - `member_id` (uuid) - Reference to group_members
      - `description` (text) - Expense description
      - `amount` (decimal) - Expense amount
      - `category` (text) - Expense category
      - `date` (date) - Expense date
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their groups
    - Add policies for group members to view and add expenses
*/

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES group_members(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Anyone can view groups"
  ON groups FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Anyone can view group members"
  ON group_members FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can add group members"
  ON group_members FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update group members"
  ON group_members FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete group members"
  ON group_members FOR DELETE
  TO public
  USING (true);

-- Expenses policies
CREATE POLICY "Anyone can view expenses"
  ON expenses FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can add expenses"
  ON expenses FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update expenses"
  ON expenses FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete expenses"
  ON expenses FOR DELETE
  TO public
  USING (true);

-- Create index for faster group code lookups
CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(code);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_member_id ON expenses(member_id);