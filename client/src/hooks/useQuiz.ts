import { useQuizStore } from '../stores/quizStore';
import type { QuizConfig } from '../types';

export function useQuiz() {
    const {
        currentAttempt,
        questions,
        responses,
        currentQuestionIndex,
        timeRemaining,
        isLoading,
        generateQuiz,
        startAttempt,
        submitAnswer,
        nextQuestion,
        previousQuestion,
        submitQuiz,
        resetQuiz,
        setTimeRemaining,
    } = useQuizStore();

    const currentQuestion = questions[currentQuestionIndex];
    const currentResponse = currentQuestion
        ? responses.get(currentQuestion.id)
        : undefined;

    const progress = {
        current: currentQuestionIndex + 1,
        total: questions.length,
        percentage: questions.length > 0
            ? ((currentQuestionIndex + 1) / questions.length) * 100
            : 0,
    };

    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const allAnswered = questions.every((q) => responses.has(q.id));

    const handleGenerateQuiz = async (config: QuizConfig) => {
        await generateQuiz(config);
    };

    const handleSubmitAnswer = (answer: string, timeSpent: number) => {
        if (currentQuestion) {
            submitAnswer(currentQuestion.id, answer, timeSpent);
        }
    };

    return {
        // State
        currentAttempt,
        questions,
        currentQuestion,
        currentResponse,
        timeRemaining,
        isLoading,
        progress,
        isFirstQuestion,
        isLastQuestion,
        allAnswered,

        // Actions
        generateQuiz: handleGenerateQuiz,
        startAttempt,
        submitAnswer: handleSubmitAnswer,
        nextQuestion,
        previousQuestion,
        submitQuiz,
        resetQuiz,
        setTimeRemaining,
    };
}
