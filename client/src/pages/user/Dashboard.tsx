import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserStats } from '../../hooks/useUserStats';
import { Play, TrendingUp, Award, Clock, Calendar, ArrowRight, ChevronRight, User, History, AlertCircle } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '../../lib/utils';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface StatCardProps {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    icon: React.ElementType;
    color: string;
    delay: number;
    isLoading?: boolean;
}

const StatCard = ({ title, value, prefix, suffix, icon: Icon, color, delay, isLoading }: StatCardProps) => (
    <div
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {isLoading ? (
                        <Skeleton className="h-8 w-24" />
                    ) : (
                        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
                    )}
                </h3>
            </div>
            <div className={cn("p-3 rounded-lg", color)}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

function DashboardContent() {
    const { user } = useAuth();
    const { stats, recentAttempts, loading, fetchStats } = useUserStats();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        fetchStats();
    }, [fetchStats]);

    // Derive chart data from recent attempts (last 7 attempts for simplicity)
    const performanceData = useMemo(() => {
        return [...recentAttempts]
            .reverse() // Oldest first for chart
            .filter(a => a.status === 'completed')
            .map(a => ({
                date: new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                score: a.score || 0
            }));
    }, [recentAttempts]);

    if (loading && !stats) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-5 w-96" />
                    </div>
                    <Skeleton className="h-12 w-40 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {greeting}, {user?.name?.split(' ')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Here's what's happening with your learning journey.</p>
                </div>
                <Link
                    to="/quiz-config"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <Play className="w-5 h-5 mr-2" />
                    Start New Quiz
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Quizzes"
                    value={stats?.total_attempts || 0}
                    icon={Award}
                    color="bg-blue-500"
                    delay={0}
                />
                <StatCard
                    title="Average Score"
                    value={Math.round(stats?.average_score || 0)}
                    suffix="%"
                    icon={TrendingUp}
                    color="bg-green-500"
                    delay={100}
                />
                <StatCard
                    title="Completion Rate"
                    value={Math.round(stats?.completion_rate || 0)}
                    suffix="%"
                    icon={Clock}
                    color="bg-purple-500"
                    delay={200}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Performance Trend</h2>
                    </div>
                    <div className="h-80 w-full">
                        {performanceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <TrendingUp className="w-12 h-12 mb-2 opacity-20" />
                                <p>No performance data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity / Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="space-y-4">
                        <Link to="/profile" className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900">Update Profile</p>
                                        <p className="text-xs text-gray-500">Keep your details current</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                            </div>
                        </Link>

                        <Link to="/history" className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-200 transition-colors">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900">Review History</p>
                                        <p className="text-xs text-gray-500">Check past performance</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Recent Quizzes</h2>
                    <Link to="/history" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {recentAttempts.length > 0 ? (
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
                                {recentAttempts.map((quiz) => (
                                    <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {quiz.config?.categories?.join(', ') || 'General Quiz'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {new Date(quiz.created_at).toLocaleDateString()}
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
                                            {quiz.time_spent_seconds ? `${Math.floor(quiz.time_spent_seconds / 60)}m ${quiz.time_spent_seconds % 60}s` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                                quiz.status === 'completed' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
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
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No quizzes taken yet</h3>
                        <p className="text-gray-500 mt-1 max-w-sm">
                            You haven't taken any quizzes yet. Start your first quiz to see your history here!
                        </p>
                        <Link
                            to="/quiz-config"
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Take a Quiz
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export function Dashboard() {
    return (
        <ErrorBoundary>
            <DashboardContent />
        </ErrorBoundary>
    );
}
