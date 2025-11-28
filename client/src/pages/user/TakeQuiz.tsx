import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Clock, AlertCircle, X } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/Skeleton';

// Simple modal component for confirmations and image zoom
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>
                {children}
            </div>
        </div>
    );
}

export function TakeQuiz() {
    const navigate = useNavigate();
    const {
        questions,
        currentQuestionIndex,
        responses,
        nextQuestion,
        previousQuestion,
        submitAnswer,
        submitQuiz,
        timeRemaining,
        setTimeRemaining,
        isLoading,
    } = useQuizStore();

    const [showExitModal, setShowExitModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageSrc, setImageSrc] = useState('');
    const [loadingImage, setLoadingImage] = useState(true);

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    // Timer countdown (if timeRemaining is set)
    useEffect(() => {
        if (timeRemaining <= 0) return;
        const timer = setInterval(() => {
            setTimeRemaining((t) => Math.max(t - 1, 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeRemaining, setTimeRemaining]);

    // Warn before leaving the page (auto‑save is handled by Zustand store)
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, []);

    // Keyboard shortcuts for options (1‑4)
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!currentQuestion) return;
            const key = parseInt(e.key, 10);
            if (key >= 1 && key <= 4) {
                const option = currentQuestion.options[key - 1];
                if (option) {
                    const start = performance.now();
                    submitAnswer(currentQuestion.id, option, Math.round(performance.now() - start) / 1000);
                }
            }
        },
        [currentQuestion, submitAnswer]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Handle answer click
    const onSelectOption = (option: string) => {
        const start = performance.now();
        submitAnswer(currentQuestion.id, option, Math.round(performance.now() - start) / 1000);
    };

    // Image handling
    const onImageLoad = () => setLoadingImage(false);
    const onImageError = () => setLoadingImage(false);

    const openImage = (src: string) => {
        setImageSrc(src);
        setShowImageModal(true);
    };

    // Submit quiz flow
    const handleSubmitQuiz = async () => {
        try {
            await submitQuiz();
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    // Focus management – focus first option when question changes
    const firstOptionRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        firstOptionRef.current?.focus();
    }, [currentQuestionIndex]);

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">No quiz loaded. Please start a quiz from the configuration page.</p>
            </div>
        );
    }

    const selectedAnswer = responses.get(currentQuestion.id)?.user_answer;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                </div>
                <div className="flex-1 text-center">
                    {timeRemaining > 0 && (
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="w-4 h-4" />
                            {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setShowExitModal(true)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800"
                >
                    <XCircle className="w-5 h-5" /> Exit
                </button>
            </header>

            {/* Question Card */}
            <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    {currentQuestion.text}
                </h2>
                {currentQuestion.image_url && (
                    <div className="relative w-full max-h-80 overflow-hidden rounded-lg cursor-pointer" onClick={() => openImage(currentQuestion.image_url!)}>
                        {loadingImage && <Skeleton className="absolute inset-0" />}
                        <img
                            src={currentQuestion.image_url}
                            alt="Question illustration"
                            className="w-full h-auto object-contain"
                            onLoad={onImageLoad}
                            onError={onImageError}
                        />
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((opt, idx) => (
                        <button
                            key={opt}
                            ref={idx === 0 ? firstOptionRef : undefined}
                            onClick={() => onSelectOption(opt)}
                            className={cn(
                                'p-4 border rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
                                selectedAnswer === opt ? 'bg-primary-100 border-primary-600' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                            )}
                        >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                        </button>
                    ))}
                </div>
            </section>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={cn(
                        'px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500'
                    )}
                >
                    Previous
                </button>
                <div className="flex flex-wrap gap-2 justify-center">
                    {questions.map((q, idx) => (
                        <button
                            key={q.id}
                            onClick={() => useQuizStore.setState({ currentQuestionIndex: idx })}
                            className={cn(
                                'w-8 h-8 rounded-full text-sm font-medium',
                                responses.has(q.id) ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700',
                                currentQuestionIndex === idx && 'ring-2 ring-primary-500'
                            )}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
                {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                        onClick={nextQuestion}
                        className={cn(
                            'px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500'
                        )}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className={cn(
                            'px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500'
                        )}
                    >
                        Submit Quiz
                    </button>
                )}
            </div>

            {/* Exit Confirmation Modal */}
            <Modal open={showExitModal} onClose={() => setShowExitModal(false)}>
                <h3 className="text-lg font-medium mb-4">Leave Quiz?</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                    Your progress will be saved, but you will lose the current attempt if you close the tab.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setShowExitModal(false)}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Leave
                    </button>
                </div>
            </Modal>

            {/* Submit Confirmation Modal */}
            <Modal open={showSubmitModal} onClose={() => setShowSubmitModal(false)}>
                <h3 className="text-lg font-medium mb-4">Submit Quiz?</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                    Are you sure you want to submit? You will not be able to change answers after submission.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setShowSubmitModal(false)}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmitQuiz}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 flex items-center"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Confirm Submit
                    </button>
                </div>
            </Modal>

            {/* Image Zoom Modal */}
            <Modal open={showImageModal} onClose={() => setShowImageModal(false)}>
                {imageSrc && (
                    <img src={imageSrc} alt="Zoomed" className="max-w-full max-h-[80vh] object-contain" />
                )}
            </Modal>
        </div>
    );
}
