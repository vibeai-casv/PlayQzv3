import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithPhone: (phone: string) => Promise<void>;
    verifyOtp: (phone: string, otp: string) => Promise<void>;
    signup: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,

            setUser: (user) => set({ user, isAuthenticated: !!user }),

            setToken: (token) => set({ token }),

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (error) throw error;

                    if (data.user) {
                        const { data: profile, error: profileError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', data.user.id)
                            .single();

                        if (profileError) throw profileError;

                        set({
                            user: profile as User,
                            token: data.session?.access_token || null,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            loginWithGoogle: async () => {
                set({ isLoading: true });
                try {
                    const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: `${window.location.origin}/dashboard`,
                        },
                    });
                    if (error) throw error;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            loginWithPhone: async (phone) => {
                set({ isLoading: true });
                try {
                    const { error } = await supabase.auth.signInWithOtp({
                        phone,
                    });
                    if (error) throw error;
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            verifyOtp: async (phone, otp) => {
                set({ isLoading: true });
                try {
                    const { data, error } = await supabase.auth.verifyOtp({
                        phone,
                        token: otp,
                        type: 'sms',
                    });

                    if (error) throw error;

                    if (data.user) {
                        const { data: profile, error: profileError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', data.user.id)
                            .single();

                        if (profileError) throw profileError;

                        set({
                            user: profile as User,
                            token: data.session?.access_token || null,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            signup: async (formData) => {
                set({ isLoading: true });
                try {
                    const { data, error } = await supabase.auth.signUp({
                        email: formData.email,
                        password: formData.password,
                        options: {
                            data: {
                                name: formData.full_name,
                                phone: formData.mobile_number,
                                category: formData.category,
                                district: formData.district,
                                institution: formData.institution_name,
                                course: formData.course_of_study,
                                class_level: formData.class_level,
                                terms_accepted: formData.terms_accepted,
                            },
                        },
                    });

                    if (error) throw error;

                    if (data.user) {
                        // Profile is created by trigger, but we might need to wait or fetch it
                        // For now, just set basic user info or wait for login
                        // Ideally, we should fetch the profile, but it might take a moment

                        // If email confirmation is required, we can't login yet
                        // Assuming email confirmation is OFF for now or handled by UI

                        if (data.session) {
                            const { data: profile, error: profileError } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', data.user.id)
                                .single();

                            if (!profileError && profile) {
                                set({
                                    user: profile as User,
                                    token: data.session.access_token,
                                    isAuthenticated: true,
                                    isLoading: false,
                                });
                            } else {
                                set({ isLoading: false });
                            }
                        } else {
                            set({ isLoading: false });
                        }
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                await supabase.auth.signOut();
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            checkSession: async () => {
                set({ isLoading: true });
                try {
                    const { data: { session } } = await supabase.auth.getSession();

                    if (session?.user) {
                        const { data: profile, error } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();

                        if (error) throw error;

                        set({
                            user: profile as User,
                            token: session.access_token,
                            isAuthenticated: true,
                        });
                    } else {
                        set({ user: null, token: null, isAuthenticated: false });
                    }
                } catch (error) {
                    console.error('Session check failed:', error);
                    set({ user: null, token: null, isAuthenticated: false });
                } finally {
                    set({ isLoading: false });
                }
            },

            updateProfile: async (updates) => {
                const { user } = get();
                if (!user) throw new Error('No user logged in');

                const { data, error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id)
                    .select()
                    .single();

                if (error) throw error;

                set({ user: { ...user, ...data } as User });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
