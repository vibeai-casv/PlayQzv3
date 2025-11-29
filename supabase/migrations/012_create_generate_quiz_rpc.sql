-- =====================================================
-- MIGRATION: Create generate_quiz RPC
-- Description: Function to generate a random quiz based on criteria
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_quiz(
    p_num_questions INTEGER,
    p_difficulty TEXT,
    p_categories TEXT[],
    p_time_limit INTEGER
)
RETURNS TABLE(question_ids UUID[]) AS $$
DECLARE
    v_question_ids UUID[];
BEGIN
    -- Select random questions matching criteria
    SELECT ARRAY_AGG(id)
    INTO v_question_ids
    FROM (
        SELECT id
        FROM public.questions
        WHERE 
            is_active = true AND
            (p_difficulty = 'Mixed' OR difficulty::TEXT = LOWER(p_difficulty)) AND
            (array_length(p_categories, 1) IS NULL OR category = ANY(p_categories))
        ORDER BY random()
        LIMIT p_num_questions
    ) sub;

    RETURN QUERY SELECT v_question_ids;
END;
$$ LANGUAGE plpgsql;
