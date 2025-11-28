-- Add missing profile fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS course_of_study TEXT,
ADD COLUMN IF NOT EXISTS class_level TEXT;
