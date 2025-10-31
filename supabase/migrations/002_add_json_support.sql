-- Migration: Add JSON lesson support
-- This migration adds columns to support both old code-based lessons and new JSON-based lessons

-- Add lesson_type column to identify the type of lesson
ALTER TABLE lessons
ADD COLUMN lesson_type TEXT;

-- Add is_json flag to distinguish between code-based and JSON-based lessons
ALTER TABLE lessons
ADD COLUMN is_json BOOLEAN DEFAULT false;

-- Add comment to lesson_type column
COMMENT ON COLUMN lessons.lesson_type IS 'Type of lesson: quiz, flashcard, math, reading, interactive, matching';

-- Add comment to is_json column
COMMENT ON COLUMN lessons.is_json IS 'True for JSON-based lessons, false for code-based lessons';

-- Create index on lesson_type for faster filtering
CREATE INDEX idx_lessons_lesson_type ON lessons(lesson_type);

-- Create index on is_json for faster filtering
CREATE INDEX idx_lessons_is_json ON lessons(is_json);
