import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/Skeleton';

interface QuizAttempt {
    id: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    time_spent_seconds: number;
    created_at: string;
    status: 'in_progress' | 'completed' | 'abandoned' | 'expired';
    config: {
        categories: string[];
        difficulty: string;
    };
}

export function History() {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('quiz_attempts')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setAttempts(data || []);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Quiz History</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {attempts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Topic</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Score</th>
                                    <th className="px-6 py-4 font-semibold">Time</th>
                                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {attempts.map((quiz) => (
                                    <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {quiz.config?.categories?.join(', ') || 'General Quiz'}
                                            <div className="text-xs text-gray-400 font-normal mt-0.5 capitalize">
                                                {quiz.config?.difficulty} Difficulty
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {new Date(quiz.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5 ml-6">
                                                {new Date(quiz.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {quiz.status === 'completed' ? (
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                    (quiz.score || 0) >= 80 ? "bg-green-100 text-green-800" :
                                                        (quiz.score || 0) >= 60 ? "bg-yellow-100 text-yellow-800" :
                                                            "bg-red-100 text-red-800"
                                                )}>
                                                    {quiz.score}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {quiz.time_spent_seconds ? (
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                    {Math.floor(quiz.time_spent_seconds / 60)}m {quiz.time_spent_seconds % 60}s
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                                quiz.status === 'completed' ? "bg-blue-100 text-blue-800" :
                                                    quiz.status === 'in_progress' ? "bg-yellow-100 text-yellow-800" :
                                                        "bg-gray-100 text-gray-800"
                                            )}>
                                                {quiz.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No quizzes taken yet</h3>
                        <p className="text-gray-500 mt-2 max-w-sm">
                            You haven't taken any quizzes yet. Start your first quiz to see your history here!
                        </p>
                        <Link
                            to="/quiz-config"
                            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-all"
                        >
                            Start New Quiz
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
