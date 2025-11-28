import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    initialize: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,

    initialize: async () => {
        try {
            set({ isLoading: true });

            // Get initial session
            const { data: { session } } = await supabase.auth.getSession();
            set({ session });

            if (session?.user) {
                await get().refreshProfile();
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (_event, session) => {
                set({ session, isAuthenticated: !!session });

                if (session?.user) {
                    await get().refreshProfile();
                } else {
                    set({ user: null, isAdmin: false });
                }
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) throw error;
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({ user: null, session: null, isAuthenticated: false, isAdmin: false });
    },

    // New logout alias delegating to signOut
    logout: async () => {
        await get().signOut();
    },

    refreshProfile: async () => {
        const { session } = get();
        if (!session?.user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) throw error;

            if (data) {
                set({
                    user: data as User,
                    isAuthenticated: true,
                    isAdmin: data.role === 'admin'
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // If profile doesn't exist but we have a session, we might want to handle that
            // For now, just set user to null or partial user
        }
    },
}));
