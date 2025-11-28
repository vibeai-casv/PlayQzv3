import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQuizStore } from '../stores/quizStore';
import type { QuizConfig, Question, QuizAttempt } from '../types';
import { toast } from 'sonner';

export function useQuizGeneration() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const setQuiz = useQuizStore((state) => state.setQuiz);

    const generateQuiz = async (config: QuizConfig) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Validate config
            if (config.numQuestions <= 0) throw new Error('Number of questions must be positive');
            if (config.categories.length === 0) throw new Error('At least one category must be selected');

            // 2. Query questions table
            let query = supabase
                .from('questions')
                .select('*')
                .eq('is_active', true)
                .in('category', config.categories);

            if (config.difficulty !== 'mixed') {
                query = query.eq('difficulty', config.difficulty);
            }

            // Fetch extra questions for variety (1.5x)
            // Since we can't easily order by random() via client without RPC, we fetch a larger batch and shuffle.
            // We'll fetch up to 100 questions to ensure good variety if available.
            const limit = Math.max(100, Math.ceil(config.numQuestions * 1.5));
            const { data: questionsData, error: questionsError } = await query.limit(limit);

            if (questionsError) throw questionsError;

            if (!questionsData || questionsData.length < config.numQuestions) {
                const available = questionsData?.length || 0;
                throw new Error(`Not enough questions available. Found ${available}, required ${config.numQuestions}`);
            }

            // 3. Shuffle and slice
            const shuffled = [...questionsData].sort(() => Math.random() - 0.5);
            const selectedQuestions = shuffled.slice(0, config.numQuestions);
            const questionIds = selectedQuestions.map(q => q.id);

            // 4. Create quiz_attempts record
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data: attemptData, error: attemptError } = await supabase
                .from('quiz_attempts')
                .insert({
                    user_id: user.id,
                    config,
                    question_ids: questionIds,
                    total_questions: config.numQuestions,
                    status: 'in_progress',
                    started_at: new Date().toISOString()
                })
                .select()
                .single();

            if (attemptError) throw attemptError;

            const attempt = attemptData as QuizAttempt;
            const questions = selectedQuestions as Question[];

            // 6. Store in Zustand quiz store
            setQuiz(attempt, questions);

            return { attemptId: attempt.id, questions };

        } catch (err: unknown) {
            console.error('Quiz generation error:', err);
            const message = err instanceof Error ? err.message : 'Failed to generate quiz';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { generateQuiz, isLoading, error };
}
