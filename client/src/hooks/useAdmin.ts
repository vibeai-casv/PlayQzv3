import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Question, MediaFile, AnalyticsData } from '../types';

export function useAdmin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // User Management
    const fetchUsers = async (filters?: {
        status?: 'active' | 'disabled';
        category?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }) => {
        setIsLoading(true);
        setError(null);
        try {
            let query = supabase.from('profiles').select('*', { count: 'exact' });

            if (filters?.status) {
                query = query.eq('disabled', filters.status === 'disabled');
            }
            if (filters?.category) {
                query = query.eq('category', filters.category);
            }
            if (filters?.search) {
                query = query.or(
                    `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,institution.ilike.%${filters.search}%`
                );
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }
            if (filters?.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
            }

            const { data, error, count } = await query;
            if (error) throw error;

            return { users: data as User[], total: count || 0 };
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUserStatus = async (userId: string, disabled: boolean, reason?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ disabled, disabled_reason: reason })
                .eq('id', userId);

            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Question Management
    const fetchQuestions = async (filters?: {
        category?: string;
        difficulty?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }) => {
        setIsLoading(true);
        setError(null);
        try {
            let query = supabase.from('questions').select('*', { count: 'exact' });

            if (filters?.category) {
                query = query.eq('category', filters.category);
            }
            if (filters?.difficulty) {
                query = query.eq('difficulty', filters.difficulty);
            }
            if (filters?.search) {
                query = query.or(`question_text.ilike.%${filters.search}%,explanation.ilike.%${filters.search}%`);
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }
            if (filters?.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
            }

            const { data, error, count } = await query;
            if (error) throw error;

            return { questions: data as Question[], total: count || 0 };
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const createQuestion = async (question: Partial<Question>) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('questions')
                .insert(question)
                .select()
                .single();

            if (error) throw error;
            return data as Question;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuestion = async (id: string, updates: Partial<Question>) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('questions')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Question;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteQuestion = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await supabase.from('questions').delete().eq('id', id);
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Media Management
    const fetchMedia = async (filters?: {
        type?: string;
        limit?: number;
        offset?: number;
    }) => {
        setIsLoading(true);
        setError(null);
        try {
            let query = supabase.from('media_library').select('*', { count: 'exact' });

            if (filters?.type) {
                query = query.eq('type', filters.type);
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }
            if (filters?.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
            }

            const { data, error, count } = await query.order('created_at', { ascending: false });
            if (error) throw error;

            return { media: data as MediaFile[], total: count || 0 };
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const uploadMedia = async (file: File, type: string, description?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const folder = type === 'logo' ? 'logos' : 'personalities';
            const fileName = `${folder}/${Date.now()}-${file.name}`;

            // Upload to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('quiz-media')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('quiz-media')
                .getPublicUrl(fileName);

            // Register in database
            const { data, error } = await supabase.rpc('register_media_upload', {
                p_filename: fileName,
                p_original_filename: file.name,
                p_url: urlData.publicUrl,
                p_type: type,
                p_mime_type: file.type,
                p_size_bytes: file.size,
                p_folder: folder,
                p_storage_object_id: uploadData.id,
                p_description: description,
            });

            if (error) throw error;
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteMedia = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await supabase.from('media_library').delete().eq('id', id);
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Analytics
    const fetchAnalytics = async (startDate?: Date, endDate?: Date) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.rpc('get_admin_dashboard_analytics', {
                p_start_date: startDate?.toISOString(),
                p_end_date: endDate?.toISOString(),
            });

            if (error) throw error;
            return data as AnalyticsData;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDailyStats = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('daily_quiz_stats')
                .select('*')
                .order('date', { ascending: true })
                .limit(30);
            if (error) throw error;
            return data;
        } catch (err: any) {
            console.error('Error fetching daily stats:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategoryStats = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('category_performance')
                .select('*');
            if (error) throw error;
            return data;
        } catch (err: any) {
            console.error('Error fetching category stats:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRegistrationStats = async () => {
        setIsLoading(true);
        try {
            // Fetch profiles created in the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data, error } = await supabase
                .from('profiles')
                .select('created_at')
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Aggregate by day
            const stats: Record<string, number> = {};
            data?.forEach((user) => {
                const date = new Date(user.created_at).toISOString().split('T')[0];
                stats[date] = (stats[date] || 0) + 1;
            });

            return Object.entries(stats).map(([date, count]) => ({ date, count }));
        } catch (err: any) {
            console.error('Error fetching registration stats:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,

        // User Management
        fetchUsers,
        toggleUserStatus,

        // Question Management
        fetchQuestions,
        createQuestion,
        updateQuestion,
        deleteQuestion,

        // Media Management
        fetchMedia,
        uploadMedia,
        deleteMedia,

        // Analytics
        fetchAnalytics,
        fetchDailyStats,
        fetchCategoryStats,
        fetchRegistrationStats,
    };
}
