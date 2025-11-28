-- =====================================================
-- MIGRATION: Create quiz_attempts table
-- Description: Track user quiz sessions and results
-- =====================================================

-- Create enum for attempt status
CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'abandoned', 'expired');

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User reference
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Quiz configuration stored as JSONB
    config JSONB NOT NULL DEFAULT jsonb_build_object(
        'numQuestions', 10,
        'difficulty', 'medium',
        'categories', '[]'::jsonb,
        'timeLimit', 60,
        'includeExplanations', true
    ),
    
    -- Quiz metadata
    quiz_hash TEXT, -- Hash of question IDs for duplicate detection
    question_ids UUID[] NOT NULL, -- Array of question IDs in order
    
    -- Results
    status attempt_status DEFAULT 'in_progress' NOT NULL,
    score NUMERIC(5,2), -- Percentage score (0-100)
    correct_answers INTEGER DEFAULT 0,
    total_questions INTEGER NOT NULL,
    
    -- Timing
    time_spent_seconds INTEGER, -- Total time spent
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- When the attempt expires
    
    -- Additional metrics
    accuracy_rate NUMERIC(5,2), -- Percentage of correct answers
    average_time_per_question NUMERIC(6,2), -- Average seconds per question
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_score CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
    CONSTRAINT valid_correct_answers CHECK (
        correct_answers >= 0 AND correct_answers <= total_questions
    ),
    CONSTRAINT valid_total_questions CHECK (total_questions > 0),
    CONSTRAINT valid_time_spent CHECK (
        time_spent_seconds IS NULL OR time_spent_seconds >= 0
    ),
    CONSTRAINT completed_has_score CHECK (
        status != 'completed' OR (score IS NOT NULL AND completed_at IS NOT NULL)
    ),
    CONSTRAINT question_ids_count CHECK (
        array_length(question_ids, 1) = total_questions
    )
);

-- Create indexes
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_status ON public.quiz_attempts(status);
CREATE INDEX idx_quiz_attempts_started_at ON public.quiz_attempts(started_at DESC);
CREATE INDEX idx_quiz_attempts_user_status ON public.quiz_attempts(user_id, status);
CREATE INDEX idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at DESC) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_quiz_attempts_score ON public.quiz_attempts(score DESC) WHERE score IS NOT NULL;
CREATE INDEX idx_quiz_attempts_config ON public.quiz_attempts USING GIN(config);

-- Create trigger for updated_at
CREATE TRIGGER update_quiz_attempts_updated_at
    BEFORE UPDATE ON public.quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own attempts
CREATE POLICY "Users can view own attempts"
    ON public.quiz_attempts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own attempts
CREATE POLICY "Users can insert own attempts"
    ON public.quiz_attempts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own attempts
CREATE POLICY "Users can update own attempts"
    ON public.quiz_attempts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all attempts
CREATE POLICY "Admins can view all attempts"
    ON public.quiz_attempts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update all attempts
CREATE POLICY "Admins can update all attempts"
    ON public.quiz_attempts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate and update attempt results
CREATE OR REPLACE FUNCTION public.finalize_quiz_attempt(
    attempt_id UUID,
    p_correct_answers INTEGER,
    p_time_spent INTEGER
)
RETURNS public.quiz_attempts AS $$
DECLARE
    v_attempt public.quiz_attempts;
BEGIN
    UPDATE public.quiz_attempts
    SET 
        status = 'completed',
        correct_answers = p_correct_answers,
        score = (p_correct_answers::NUMERIC / total_questions::NUMERIC) * 100,
        accuracy_rate = (p_correct_answers::NUMERIC / total_questions::NUMERIC) * 100,
        time_spent_seconds = p_time_spent,
        average_time_per_question = p_time_spent::NUMERIC / total_questions::NUMERIC,
        completed_at = NOW()
    WHERE id = attempt_id
    RETURNING * INTO v_attempt;
    
    -- Update user stats
    UPDATE public.profiles
    SET stats = jsonb_set(
        jsonb_set(
            jsonb_set(
                jsonb_set(
                    stats,
                    '{totalAttempts}',
                    to_jsonb((stats->>'totalAttempts')::INTEGER + 1)
                ),
                '{totalTimeSpent}',
                to_jsonb((stats->>'totalTimeSpent')::INTEGER + p_time_spent)
            ),
            '{bestScore}',
            to_jsonb(GREATEST(
                (stats->>'bestScore')::NUMERIC,
                v_attempt.score
            ))
        ),
        '{averageScore}',
        to_jsonb((
            SELECT AVG(score)
            FROM public.quiz_attempts
            WHERE user_id = v_attempt.user_id AND status = 'completed'
        ))
    )
    WHERE id = v_attempt.user_id;
    
    RETURN v_attempt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for expired attempts
CREATE OR REPLACE FUNCTION public.mark_expired_attempts()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.quiz_attempts
    SET status = 'expired'
    WHERE 
        status = 'in_progress' AND
        expires_at IS NOT NULL AND
        expires_at < NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user quiz statistics
CREATE OR REPLACE FUNCTION public.get_user_quiz_stats(p_user_id UUID)
RETURNS TABLE(
    total_attempts BIGINT,
    completed_attempts BIGINT,
    average_score NUMERIC,
    best_score NUMERIC,
    total_time_spent INTEGER,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_attempts,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_attempts,
        AVG(score) FILTER (WHERE status = 'completed') as average_score,
        MAX(score) FILTER (WHERE status = 'completed') as best_score,
        SUM(time_spent_seconds)::INTEGER as total_time_spent,
        (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / 
         NULLIF(COUNT(*)::NUMERIC, 0) * 100) as completion_rate
    FROM public.quiz_attempts
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON public.quiz_attempts TO authenticated;
