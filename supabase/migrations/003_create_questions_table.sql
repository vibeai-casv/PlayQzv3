-- =====================================================
-- MIGRATION: Create questions table
-- Description: Quiz questions with multiple types
-- =====================================================

-- Create enum types
CREATE TYPE question_type AS ENUM ('text_mcq', 'image_identify_logo', 'image_identify_person', 'true_false', 'short_answer');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Question content
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    
    -- For MCQ questions
    options JSONB, -- Array of answer options
    correct_answer TEXT NOT NULL,
    
    -- For image-based questions
    image_url TEXT,
    media_id UUID REFERENCES public.media_library(id) ON DELETE SET NULL,
    
    -- Additional info
    explanation TEXT,
    hint TEXT,
    
    -- Classification
    difficulty difficulty_level NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Scoring
    points INTEGER DEFAULT 10 NOT NULL,
    time_limit_seconds INTEGER DEFAULT 60,
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    
    -- AI generation metadata
    ai_generated BOOLEAN DEFAULT false,
    ai_prompt TEXT,
    
    -- Authorship
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_question_text CHECK (char_length(question_text) >= 10),
    CONSTRAINT valid_points CHECK (points > 0 AND points <= 100),
    CONSTRAINT valid_time_limit CHECK (
        time_limit_seconds IS NULL OR 
        (time_limit_seconds >= 10 AND time_limit_seconds <= 300)
    ),
    CONSTRAINT mcq_has_options CHECK (
        question_type NOT IN ('text_mcq', 'true_false') OR 
        (options IS NOT NULL AND jsonb_array_length(options) >= 2)
    ),
    CONSTRAINT image_questions_have_image CHECK (
        question_type NOT IN ('image_identify_logo', 'image_identify_person') OR 
        (image_url IS NOT NULL OR media_id IS NOT NULL)
    ),
    CONSTRAINT true_false_has_two_options CHECK (
        question_type != 'true_false' OR 
        jsonb_array_length(options) = 2
    )
);

-- Create indexes for performance
CREATE INDEX idx_questions_category ON public.questions(category);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_questions_type ON public.questions(question_type);
CREATE INDEX idx_questions_is_active ON public.questions(is_active) WHERE is_active = true;
CREATE INDEX idx_questions_created_by ON public.questions(created_by);
CREATE INDEX idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX idx_questions_tags ON public.questions USING GIN(tags);
CREATE INDEX idx_questions_category_difficulty ON public.questions(category, difficulty) WHERE is_active = true;

-- Full-text search index
CREATE INDEX idx_questions_search ON public.questions USING GIN(
    to_tsvector('english', question_text || ' ' || COALESCE(explanation, ''))
);

-- Create trigger for updated_at
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active, verified questions
CREATE POLICY "Public can view active verified questions"
    ON public.questions
    FOR SELECT
    USING (is_active = true AND is_verified = true);

-- Policy: Authenticated users can view active questions
CREATE POLICY "Authenticated users can view active questions"
    ON public.questions
    FOR SELECT
    USING (
        is_active = true AND 
        auth.role() = 'authenticated'
    );

-- Policy: Admins can view all questions
CREATE POLICY "Admins can view all questions"
    ON public.questions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can insert questions
CREATE POLICY "Admins can insert questions"
    ON public.questions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update questions
CREATE POLICY "Admins can update questions"
    ON public.questions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can delete questions
CREATE POLICY "Admins can delete questions"
    ON public.questions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_question_usage(question_id UUID, was_correct BOOLEAN)
RETURNS VOID AS $$
BEGIN
    UPDATE public.questions
    SET 
        usage_count = usage_count + 1,
        correct_count = CASE 
            WHEN was_correct THEN correct_count + 1 
            ELSE correct_count 
        END
    WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get question difficulty distribution
CREATE OR REPLACE FUNCTION public.get_difficulty_distribution(category_filter TEXT DEFAULT NULL)
RETURNS TABLE(difficulty difficulty_level, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.difficulty,
        COUNT(*) as count
    FROM public.questions q
    WHERE 
        is_active = true AND
        (category_filter IS NULL OR q.category = category_filter)
    GROUP BY q.difficulty
    ORDER BY q.difficulty;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON public.questions TO authenticated;
