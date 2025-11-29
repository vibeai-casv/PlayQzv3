import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface UserStats {
    total_attempts: number;
    completed_attempts: number;
    average_score: number;
    best_score: number;
    total_time_spent: number;
    completion_rate: number;
}

export interface QuizAttempt {
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

export function useUserStats() {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch aggregate stats
            const { data: statsData, error: statsError } = await supabase
                .rpc('get_user_quiz_stats', { p_user_id: user.id });

            if (statsError) throw statsError;
            if (statsData && statsData.length > 0) {
                setStats(statsData[0]);
            }

            // Fetch recent attempts
            const { data: attemptsData, error: attemptsError } = await supabase
                .from('quiz_attempts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (attemptsError) throw attemptsError;
            setRecentAttempts(attemptsData || []);

        } catch (err: any) {
            console.error('Error fetching user stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    return {
        stats,
        recentAttempts,
        loading,
        error,
        fetchStats
    };
}
