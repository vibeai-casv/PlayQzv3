-- =====================================================
-- MIGRATION: Create quiz_responses table
-- Description: Store individual question answers
-- =====================================================

-- Create quiz_responses table
CREATE TABLE IF NOT EXISTS public.quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Response data
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    
    -- Timing
    time_spent_seconds INTEGER,
    answered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Points awarded
    points_awarded INTEGER DEFAULT 0,
    max_points INTEGER,
    
    -- Metadata
    question_position INTEGER, -- Position in the quiz (1-based)
    skipped BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_time_spent CHECK (
        time_spent_seconds IS NULL OR time_spent_seconds >= 0
    ),
    CONSTRAINT valid_points CHECK (
        points_awarded >= 0 AND 
        (max_points IS NULL OR points_awarded <= max_points)
    ),
    CONSTRAINT valid_position CHECK (
        question_position IS NULL OR question_position > 0
    ),
    -- Ensure one response per question per attempt
    CONSTRAINT unique_attempt_question UNIQUE (attempt_id, question_id)
);

-- Create indexes
CREATE INDEX idx_quiz_responses_attempt_id ON public.quiz_responses(attempt_id);
CREATE INDEX idx_quiz_responses_question_id ON public.quiz_responses(question_id);
CREATE INDEX idx_quiz_responses_user_id ON public.quiz_responses(user_id);
CREATE INDEX idx_quiz_responses_is_correct ON public.quiz_responses(is_correct);
CREATE INDEX idx_quiz_responses_answered_at ON public.quiz_responses(answered_at DESC);
CREATE INDEX idx_quiz_responses_user_question ON public.quiz_responses(user_id, question_id);
CREATE INDEX idx_quiz_responses_attempt_position ON public.quiz_responses(attempt_id, question_position);

-- Create trigger for updated_at
CREATE TRIGGER update_quiz_responses_updated_at
    BEFORE UPDATE ON public.quiz_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TRIGGER: Update question usage statistics
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_question_stats_on_response()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment question usage and correct count
    PERFORM public.increment_question_usage(NEW.question_id, NEW.is_correct);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_stats
    AFTER INSERT ON public.quiz_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_question_stats_on_response();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own responses
CREATE POLICY "Users can view own responses"
    ON public.quiz_responses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own responses
CREATE POLICY "Users can insert own responses"
    ON public.quiz_responses
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.quiz_attempts
            WHERE id = attempt_id AND user_id = auth.uid()
        )
    );

-- Policy: Users can update their own responses (within time limits)
CREATE POLICY "Users can update own responses"
    ON public.quiz_responses
    FOR UPDATE
    USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.quiz_attempts
            WHERE id = attempt_id AND status = 'in_progress'
        )
    )
    WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all responses
CREATE POLICY "Admins can view all responses"
    ON public.quiz_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get response summary for an attempt
CREATE OR REPLACE FUNCTION public.get_attempt_response_summary(p_attempt_id UUID)
RETURNS TABLE(
    total_responses BIGINT,
    correct_responses BIGINT,
    incorrect_responses BIGINT,
    skipped_responses BIGINT,
    total_points INTEGER,
    max_possible_points INTEGER,
    average_time_per_question NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_responses,
        COUNT(*) FILTER (WHERE is_correct = true) as correct_responses,
        COUNT(*) FILTER (WHERE is_correct = false AND skipped = false) as incorrect_responses,
        COUNT(*) FILTER (WHERE skipped = true) as skipped_responses,
        SUM(points_awarded)::INTEGER as total_points,
        SUM(max_points)::INTEGER as max_possible_points,
        AVG(time_spent_seconds) as average_time_per_question
    FROM public.quiz_responses
    WHERE attempt_id = p_attempt_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get question performance analytics
CREATE OR REPLACE FUNCTION public.get_question_performance(p_question_id UUID)
RETURNS TABLE(
    total_attempts BIGINT,
    correct_attempts BIGINT,
    incorrect_attempts BIGINT,
    accuracy_rate NUMERIC,
    average_time_spent NUMERIC,
    last_used_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_attempts,
        COUNT(*) FILTER (WHERE is_correct = true) as correct_attempts,
        COUNT(*) FILTER (WHERE is_correct = false) as incorrect_attempts,
        (COUNT(*) FILTER (WHERE is_correct = true)::NUMERIC / 
         NULLIF(COUNT(*)::NUMERIC, 0) * 100) as accuracy_rate,
        AVG(time_spent_seconds) as average_time_spent,
        MAX(answered_at) as last_used_at
    FROM public.quiz_responses
    WHERE question_id = p_question_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's answer history for a question
CREATE OR REPLACE FUNCTION public.get_user_question_history(
    p_user_id UUID,
    p_question_id UUID
)
RETURNS TABLE(
    attempt_id UUID,
    user_answer TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    answered_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qr.attempt_id,
        qr.user_answer,
        qr.is_correct,
        qr.time_spent_seconds,
        qr.answered_at
    FROM public.quiz_responses qr
    WHERE 
        qr.user_id = p_user_id AND
        qr.question_id = p_question_id
    ORDER BY qr.answered_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON public.quiz_responses TO authenticated;
