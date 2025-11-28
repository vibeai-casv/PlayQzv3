import { create } from 'zustand';
import type { Question, QuizAttempt, QuizResponse, QuizConfig } from '../types';
import { supabase } from '../lib/supabase';

interface QuizState {
    currentAttempt: QuizAttempt | null;
    questions: Question[];
    responses: Map<string, QuizResponse>;
    currentQuestionIndex: number;
    timeRemaining: number;
    isLoading: boolean;

    // Actions
    generateQuiz: (config: QuizConfig) => Promise<void>;
    startAttempt: (quizId: string) => Promise<void>;
    submitAnswer: (questionId: string, answer: string, timeSpent: number) => void;
    nextQuestion: () => void;
    previousQuestion: () => void;
    submitQuiz: () => Promise<void>;
    resetQuiz: () => void;
    setTimeRemaining: (time: number | ((prev: number) => number)) => void;
    setQuiz: (attempt: QuizAttempt, questions: Question[]) => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
    currentAttempt: null,
    questions: [],
    responses: new Map(),
    currentQuestionIndex: 0,
    timeRemaining: 0,
    isLoading: false,

    generateQuiz: async (config) => {
        set({ isLoading: true });
        try {
            // Call the quiz generation API
            const { data, error } = await supabase.rpc('generate_quiz', {
                p_num_questions: config.numQuestions,
                p_difficulty: config.difficulty,
                p_categories: config.categories,
                p_time_limit: config.timeLimit,
            });

            if (error) throw error;

            // Create a new quiz attempt
            const { data: attempt, error: attemptError } = await supabase
                .from('quiz_attempts')
                .insert({
                    config,
                    question_ids: data.question_ids,
                    total_questions: config.numQuestions,
                    status: 'in_progress',
                })
                .select()
                .single();

            if (attemptError) throw attemptError;

            // Fetch questions
            const { data: questions, error: questionsError } = await supabase
                .from('questions')
                .select('*')
                .in('id', data.question_ids);

            if (questionsError) throw questionsError;

            set({
                currentAttempt: attempt as QuizAttempt,
                questions: questions as Question[],
                responses: new Map(),
                currentQuestionIndex: 0,
                timeRemaining: config.timeLimit || 0,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    startAttempt: async (attemptId) => {
        set({ isLoading: true });
        try {
            const { data: attempt, error } = await supabase
                .from('quiz_attempts')
                .select('*')
                .eq('id', attemptId)
                .single();

            if (error) throw error;

            const { data: questions, error: questionsError } = await supabase
                .from('questions')
                .select('*')
                .in('id', (attempt as QuizAttempt).question_ids);

            if (questionsError) throw questionsError;

            set({
                currentAttempt: attempt as QuizAttempt,
                questions: questions as Question[],
                responses: new Map(),
                currentQuestionIndex: 0,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    submitAnswer: (questionId, answer, timeSpent) => {
        const { currentAttempt, questions, responses } = get();
        if (!currentAttempt) return;

        const question = questions.find((q) => q.id === questionId);
        if (!question) return;

        const isCorrect = answer === question.correct_answer;

        const response: QuizResponse = {
            id: crypto.randomUUID(),
            attempt_id: currentAttempt.id,
            question_id: questionId,
            user_id: currentAttempt.user_id,
            user_answer: answer,
            is_correct: isCorrect,
            time_spent_seconds: timeSpent,
            answered_at: new Date().toISOString(),
            points_awarded: isCorrect ? question.points : 0,
            max_points: question.points,
            question_position: get().currentQuestionIndex + 1,
            skipped: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const newResponses = new Map(responses);
        newResponses.set(questionId, response);

        set({ responses: newResponses });
    },

    nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex < questions.length - 1) {
            set({ currentQuestionIndex: currentQuestionIndex + 1 });
        }
    },

    previousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
            set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
    },

    submitQuiz: async () => {
        const { currentAttempt, responses } = get();
        if (!currentAttempt) throw new Error('No active quiz attempt');

        set({ isLoading: true });
        try {
            const responsesArray = Array.from(responses.values());

            // Insert all responses
            const { error: responsesError } = await supabase
                .from('quiz_responses')
                .insert(responsesArray);

            if (responsesError) throw responsesError;

            // Calculate results
            const correctAnswers = responsesArray.filter((r) => r.is_correct).length;
            const totalTimeSpent = responsesArray.reduce(
                (sum, r) => sum + (r.time_spent_seconds || 0),
                0
            );

            // Finalize the attempt
            const { error: finalizeError } = await supabase.rpc(
                'finalize_quiz_attempt',
                {
                    attempt_id: currentAttempt.id,
                    p_correct_answers: correctAnswers,
                    p_time_spent: totalTimeSpent,
                }
            );

            if (finalizeError) throw finalizeError;

            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    resetQuiz: () => {
        set({
            currentAttempt: null,
            questions: [],
            responses: new Map(),
            currentQuestionIndex: 0,
            timeRemaining: 0,
        });
    },

    setTimeRemaining: (time) => set((state) => ({
        timeRemaining: typeof time === 'function' ? time(state.timeRemaining) : time
    })),

    setQuiz: (attempt, questions) => {
        set({
            currentAttempt: attempt,
            questions: questions,
            responses: new Map(),
            currentQuestionIndex: 0,
            timeRemaining: attempt.config.timeLimit || 0,
            isLoading: false,
        });
    },
}));
