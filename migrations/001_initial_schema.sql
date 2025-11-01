-- Migration to create tables for the application

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT CHECK (role IN ('student', 'instructor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    instructor_id TEXT REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create module_contents table
CREATE TABLE IF NOT EXISTS module_contents (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    level TEXT CHECK (level IN ('easy', 'medium', 'high')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, level) -- Ensures only one content per module and level
);

-- Create items table (questions)
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    level TEXT CHECK (level IN ('easy', 'medium', 'high')) NOT NULL,
    type TEXT CHECK (type IN ('pretest', 'practice', 'posttest')) NOT NULL,
    question_type TEXT CHECK (question_type IN ('mcq', 'short')) NOT NULL,
    question TEXT NOT NULL,
    options TEXT[], -- Array of text for multiple choice options
    answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create attempts table
CREATE TABLE IF NOT EXISTS attempts (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id),
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    selected_answer TEXT NOT NULL,
    ai_feedback TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create placements table
CREATE TABLE IF NOT EXISTS placements (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id),
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    level TEXT CHECK (level IN ('easy', 'medium', 'high')) NOT NULL,
    score INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_modules_instructor_id ON modules(instructor_id);
CREATE INDEX IF NOT EXISTS idx_module_contents_module_id ON module_contents(module_id);
CREATE INDEX IF NOT EXISTS idx_items_module_id ON items(module_id);
CREATE INDEX IF NOT EXISTS idx_items_module_type ON items(module_id, type);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_placements_user_module ON placements(user_id, module_id);