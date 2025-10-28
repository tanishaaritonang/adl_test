-- Database schema for the Adaptive Computer Network Learning Platform
-- This schema is conceptual and would need to be implemented with Supabase

-- Profiles table (extends Supabase auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('student', 'instructor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Modules table
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Placements table (AI-assigned difficulty level per user per module)
CREATE TABLE placements (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  level TEXT CHECK (level IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE (user_id, module_id)
);

-- Attempts table (records pre-test, practice, and post-test sessions)
CREATE TABLE attempts (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  attempt_type TEXT CHECK (attempt_type IN ('pre-test', 'practice', 'post-test')),
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Items table (stores generated questions, answers, explanations, and timestamps)
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  content_type TEXT CHECK (content_type IN ('question', 'learning_material')),
  title TEXT,
  content TEXT,
  options JSONB, -- For questions: array of options
  correct_answer INTEGER, -- Index of correct option for questions
  explanation TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- User answers table (to track responses to questions)
CREATE TABLE user_answers (
  id UUID DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  selected_answer INTEGER,
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);