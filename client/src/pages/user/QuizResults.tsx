import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowLeft, RefreshCw, Share2, X } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import confetti from 'canvas-confetti';

// Simple modal for share link (placeholder)
function ShareModal({ open, onClose, link }: { open: boolean; onClose: () => void; link: string }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Share Results</h3>
                <input
                    readOnly
                    value={link}
                    className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white mb-4"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(link);
                        toast.success('Copied to clipboard!');
                    }}
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
                >
                    Copy to Clipboard
                </button>
            </div>
        </div>
    );
}

export function QuizResults() {
    const navigate = useNavigate();
    const {
        questions,
        responses,
        currentAttempt,
        isLoading,
        resetQuiz,
    } = useQuizStore();

    const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
    const [showShare, setShowShare] = useState(false);

    // Compute basic stats
    const total = questions.length;
    const correct = Array.from(responses.values()).filter((r) => r.is_correct).length;
    const percentage = total ? Math.round((correct / total) * 100) : 0;

    // Confetti on high score
    useEffect(() => {
        if (percentage > 80) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
            });
        }
    }, [percentage]);

    // Category breakdown data for recharts
    const categoryData = React.useMemo(() => {
        const map: Record<string, { correct: number; total: number }> = {};
        questions.forEach((q) => {
            const cat = (q as any).category || 'Other';
            if (!map[cat]) map[cat] = { correct: 0, total: 0 };
            map[cat].total += 1;
            const resp = responses.get(q.id);
            if (resp?.is_correct) map[cat].correct += 1;
        });
        return Object.entries(map).map(([name, val]) => ({ name, ...val }));
    }, [questions, responses]);

    const filteredQuestions = questions.filter((q) => {
        const resp = responses.get(q.id);
        if (filter === 'correct') return resp?.is_correct;
        if (filter === 'incorrect') return resp && !resp.is_correct;
        return true;
    });

    const handleRetake = async () => {
        resetQuiz();
        navigate('/quiz-config');
    };

    if (isLoading || !currentAttempt) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const completedAt = new Date(currentAttempt.completed_at || Date.now()).toLocaleString();

    // Generate a shareable link (placeholder – you could use a real route with query params)
    const shareLink = `${window.location.origin}/quiz-results/${currentAttempt.id}`;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            {/* Score Header */}
            <section className="text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <h1 className="text-4xl font-bold mb-2">
                    You scored {correct}/{total} ({percentage}%)
                </h1>
                <p className="text-lg">
                    Completed on {completedAt}
                </p>
                {percentage >= 50 ? (
                    <p className="mt-2 flex items-center justify-center gap-2">
                        <CheckCircle className="w-6 h-6" /> Passed
                    </p>
                ) : (
                    <p className="mt-2 flex items-center justify-center gap-2">
                        <XCircle className="w-6 h-6" /> Failed
                    </p>
                )}
            </section>

            {/* Category Breakdown */}
            <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Performance by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                        <XAxis type="number" domain={[0, 'dataMax']} />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" stackId="a" fill="#d1d5db" name="Total" />
                        <Bar dataKey="correct" stackId="a" fill="#4f46e5" name="Correct" />
                    </BarChart>
                </ResponsiveContainer>
            </section>

            {/* Question Review */}
            <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Question Review</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn('px-3 py-1 rounded', filter === 'all' && 'bg-indigo-600 text-white')}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('correct')}
                            className={cn('px-3 py-1 rounded', filter === 'correct' && 'bg-indigo-600 text-white')}
                        >
                            Correct
                        </button>
                        <button
                            onClick={() => setFilter('incorrect')}
                            className={cn('px-3 py-1 rounded', filter === 'incorrect' && 'bg-indigo-600 text-white')}
                        >
                            Incorrect
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    {filteredQuestions.map((q, idx) => {
                        const resp = responses.get(q.id);
                        const isCorrect = resp?.is_correct;
                        return (
                            <details key={q.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                                <summary className="font-medium cursor-pointer flex justify-between items-center">
                                    <span>{idx + 1}. {q.question_text}</span>
                                    <span className={cn('ml-2', isCorrect ? 'text-green-600' : 'text-red-600')}>
                                        {isCorrect ? <CheckCircle className="inline w-4 h-4" /> : <XCircle className="inline w-4 h-4" />}
                                    </span>
                                </summary>
                                {q.image_url && (
                                    <div className="my-2">
                                        <img src={q.image_url} alt="Question" className="max-w-full h-auto rounded" />
                                    </div>
                                )}
                                <div className="mt-2">
                                    <p className="mb-1">
                                        Your answer: <span className={cn(isCorrect ? 'text-green-600' : 'text-red-600')}>{resp?.user_answer || '—'}</span>
                                    </p>
                                    <p className="mb-1">
                                        Correct answer: <span className="font-semibold text-indigo-600">{q.correct_answer}</span>
                                    </p>
                                    <button
                                        className="mt-1 text-sm text-indigo-600 hover:underline"
                                        onClick={() => toast.info('Flagged for review (placeholder)')}
                                    >
                                        Flag for review
                                    </button>
                                </div>
                            </details>
                        );
                    })}
                </div>
            </section>

            {/* Action Buttons */}
            <section className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handleRetake}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded"
                    >
                        <RefreshCw className="w-4 h-4" /> Retake Quiz
                    </button>
                    <button
                        onClick={() => setShowShare(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded"
                    >
                        <Share2 className="w-4 h-4" /> Share Results
                    </button>
                </div>
            </section>

            {/* Share Modal */}
            <ShareModal open={showShare} onClose={() => setShowShare(false)} link={shareLink} />
        </div>
    );
}
