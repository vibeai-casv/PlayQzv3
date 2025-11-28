-- =====================================================
-- MIGRATION: Create analytics views and functions
-- =====================================================

-- Daily quiz statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.daily_quiz_stats AS
SELECT 
    DATE(started_at) as date,
    COUNT(*) as total_attempts,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_attempts,
    AVG(score) FILTER (WHERE status = 'completed') as average_score,
    COUNT(DISTINCT user_id) as unique_users
FROM public.quiz_attempts
WHERE started_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(started_at)
ORDER BY date DESC;

CREATE UNIQUE INDEX idx_daily_quiz_stats_date ON public.daily_quiz_stats(date);

-- Category performance
CREATE MATERIALIZED VIEW IF NOT EXISTS public.category_performance AS
SELECT 
    q.category,
    COUNT(DISTINCT q.id) as total_questions,
    COUNT(qr.id) as total_attempts,
    (COUNT(qr.id) FILTER (WHERE qr.is_correct)::NUMERIC / 
     NULLIF(COUNT(qr.id)::NUMERIC, 0) * 100) as accuracy_rate
FROM public.questions q
LEFT JOIN public.quiz_responses qr ON q.id = qr.question_id
WHERE q.is_active = true
GROUP BY q.category;

CREATE UNIQUE INDEX idx_category_performance_category ON public.category_performance(category);

-- Refresh function
CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_quiz_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.category_performance;
END;
$$ LANGUAGE plpgsql;

-- Admin dashboard analytics
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_analytics(
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'totalUsers', (SELECT COUNT(*) FROM public.profiles),
        'activeUsers', (
            SELECT COUNT(DISTINCT user_id) FROM public.quiz_attempts
            WHERE started_at BETWEEN p_start_date AND p_end_date
        ),
        'totalAttempts', (
            SELECT COUNT(*) FROM public.quiz_attempts
            WHERE started_at BETWEEN p_start_date AND p_end_date
        ),
        'averageScore', (
            SELECT ROUND(AVG(score), 2) FROM public.quiz_attempts
            WHERE status = 'completed' AND started_at BETWEEN p_start_date AND p_end_date
        )
    );
END;
$$ LANGUAGE plpgsql;

GRANT SELECT ON public.daily_quiz_stats TO authenticated;
GRANT SELECT ON public.category_performance TO authenticated;
