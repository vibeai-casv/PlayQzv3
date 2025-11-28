-- =====================================================
-- MIGRATION: Create user_activity_logs table
-- Description: Admin monitoring of user activities
-- =====================================================

-- Create enum for activity types
CREATE TYPE activity_type AS ENUM (
    'login',
    'logout',
    'signup',
    'profile_updated',
    'quiz_started',
    'quiz_completed',
    'quiz_abandoned',
    'password_changed',
    'email_changed',
    'account_disabled',
    'account_enabled',
    'question_created',
    'question_updated',
    'media_uploaded',
    'achievement_earned',
    'settings_changed'
);

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User reference (nullable for system events)
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Activity details
    activity_type activity_type NOT NULL,
    description TEXT NOT NULL,
    
    -- Related entities
    related_entity_type TEXT, -- e.g., 'quiz_attempt', 'question', 'profile'
    related_entity_id UUID,
    
    -- Additional metadata stored as JSONB
    metadata JSONB DEFAULT '{}',
    
    -- Request information
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    
    -- Location data (optional)
    country_code TEXT,
    city TEXT,
    
    -- Status
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_description CHECK (char_length(description) > 0),
    CONSTRAINT error_requires_failure CHECK (
        success = true OR error_message IS NOT NULL
    )
);

-- Create indexes for efficient querying
CREATE INDEX idx_activity_user_id ON public.user_activity_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_activity_type ON public.user_activity_logs(activity_type);
CREATE INDEX idx_activity_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_activity_user_created ON public.user_activity_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_activity_success ON public.user_activity_logs(success) WHERE success = false;
CREATE INDEX idx_activity_related ON public.user_activity_logs(related_entity_type, related_entity_id) 
    WHERE related_entity_type IS NOT NULL;
CREATE INDEX idx_activity_ip ON public.user_activity_logs(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX idx_activity_metadata ON public.user_activity_logs USING GIN(metadata);

-- Partition by month for better performance (optional, for high-volume systems)
-- This can be enabled later if needed

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity logs
CREATE POLICY "Users can view own activity"
    ON public.user_activity_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Admins can view all activity logs
CREATE POLICY "Admins can view all activity"
    ON public.user_activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: System can insert activity logs (no user context needed)
CREATE POLICY "System can insert activity"
    ON public.user_activity_logs
    FOR INSERT
    WITH CHECK (true); -- Allow all inserts, will be controlled at application level

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_user_id UUID,
    p_activity_type activity_type,
    p_description TEXT,
    p_related_entity_type TEXT DEFAULT NULL,
    p_related_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.user_activity_logs (
        user_id,
        activity_type,
        description,
        related_entity_type,
        related_entity_id,
        metadata,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_description,
        p_related_entity_type,
        p_related_entity_id,
        p_metadata,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent user activity
CREATE OR REPLACE FUNCTION public.get_recent_user_activity(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
    id UUID,
    activity_type activity_type,
    description TEXT,
    created_at TIMESTAMPTZ,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ual.id,
        ual.activity_type,
        ual.description,
        ual.created_at,
        ual.metadata
    FROM public.user_activity_logs ual
    WHERE ual.user_id = p_user_id
    ORDER BY ual.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get activity statistics
CREATE OR REPLACE FUNCTION public.get_activity_statistics(
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
    activity_type activity_type,
    total_count BIGINT,
    success_count BIGINT,
    failure_count BIGINT,
    unique_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ual.activity_type,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE success = true) as success_count,
        COUNT(*) FILTER (WHERE success = false) as failure_count,
        COUNT(DISTINCT user_id) as unique_users
    FROM public.user_activity_logs ual
    WHERE 
        ual.created_at >= p_start_date AND
        ual.created_at <= p_end_date
    GROUP BY ual.activity_type
    ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUTOMATIC ACTIVITY LOGGING TRIGGERS
-- =====================================================

-- Trigger to log profile updates
CREATE OR REPLACE FUNCTION public.log_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.log_user_activity(
        NEW.id,
        'profile_updated',
        'User profile updated',
        'profile',
        NEW.id,
        jsonb_build_object(
            'updated_fields', (
                SELECT jsonb_object_agg(key, value)
                FROM jsonb_each(to_jsonb(NEW))
                WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
            )
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_profile_update
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION public.log_profile_update();

-- Trigger to log quiz completion
CREATE OR REPLACE FUNCTION public.log_quiz_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        PERFORM public.log_user_activity(
            NEW.user_id,
            'quiz_completed',
            'Quiz completed with score: ' || ROUND(NEW.score, 2) || '%',
            'quiz_attempt',
            NEW.id,
            jsonb_build_object(
                'score', NEW.score,
                'correct_answers', NEW.correct_answers,
                'total_questions', NEW.total_questions,
                'time_spent', NEW.time_spent_seconds
            )
        );
    ELSIF NEW.status = 'in_progress' AND OLD.status IS NULL THEN
        PERFORM public.log_user_activity(
            NEW.user_id,
            'quiz_started',
            'Started a new quiz',
            'quiz_attempt',
            NEW.id,
            jsonb_build_object(
                'total_questions', NEW.total_questions,
                'config', NEW.config
            )
        );
    ELSIF NEW.status = 'abandoned' AND OLD.status = 'in_progress' THEN
        PERFORM public.log_user_activity(
            NEW.user_id,
            'quiz_abandoned',
            'Quiz attempt abandoned',
            'quiz_attempt',
            NEW.id,
            jsonb_build_object(
                'questions_answered', NEW.correct_answers
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_quiz_activity
    AFTER INSERT OR UPDATE ON public.quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION public.log_quiz_completion();

-- Function to clean old activity logs (optional maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_old_activity_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_activity_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON public.user_activity_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_user_activity TO authenticated;
