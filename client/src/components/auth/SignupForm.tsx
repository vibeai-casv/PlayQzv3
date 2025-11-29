import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signupSchema, type SignupFormData } from '../../lib/validations/auth';
import { supabase } from '../../lib/supabase';
import { AIDisclaimerModal } from './AIDisclaimerModal';
import { useAuth } from '../../hooks/useAuth';

export const SignupForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const { signInWithGoogle } = useAuth();

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            category: 'student',
            terms_accepted: undefined,
            mobile_number: '',
            email: '',
            password: '',
        },
    });

    const handleGoogleLogin = async () => {
        try {
            if (!form.getValues('terms_accepted')) {
                setShowDisclaimer(true);
                return;
            }
            setLoading(true);
            await signInWithGoogle();
        } catch (error) {
            toast.error('Failed to sign in with Google');
            setLoading(false);
        }
    };

    const createProfile = async (userId: string, data: SignupFormData) => {
        const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                name: data.full_name,
                category: data.category,
                district: data.district,
                institution: data.institution_name,
                course_of_study: data.course_of_study,
                class_level: data.class_level,
                phone: data.mobile_number,
                email: data.email,
                terms_accepted: true,
                terms_accepted_at: new Date().toISOString(),
            });

        if (updateError) throw updateError;
    };

    const onSubmit = async (data: SignupFormData) => {
        try {
            setLoading(true);

            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.full_name,
                        phone: data.mobile_number,
                        terms_accepted: true,
                    },
                },
            });

            if (error) throw error;

            if (authData.user) {
                await createProfile(authData.user.id, data);
                toast.success('Account created successfully!');

                if (!authData.session) {
                    toast.info('Please check your email to verify your account.');
                }
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to sign up';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AIDisclaimerModal
                isOpen={showDisclaimer}
                onAccept={() => {
                    form.setValue('terms_accepted', true);
                    setShowDisclaimer(false);
                    toast.success('Terms accepted');
                }}
                onDecline={() => setShowDisclaimer(false)}
            />

            <div className="w-full max-w-md mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Create Account
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Join the AI-powered learning revolution
                    </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <input
                                {...form.register('full_name')}
                                placeholder="Full Name"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            {form.formState.errors.full_name && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{form.formState.errors.full_name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <input
                                {...form.register('email')}
                                type="email"
                                placeholder="Email Address"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            {form.formState.errors.email && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        {/* Mobile */}
                        <div>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-zinc-400">+91</span>
                                <input
                                    {...form.register('mobile_number')}
                                    placeholder="Mobile Number"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            {form.formState.errors.mobile_number && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{form.formState.errors.mobile_number.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <input
                                {...form.register('password')}
                                type="password"
                                placeholder="Password (min 6 chars)"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            {form.formState.errors.password && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        {/* Category & District Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <select
                                    {...form.register('category')}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                >
                                    <option value="student">Student</option>
                                    <option value="professional">Professional</option>
                                    <option value="educator">Educator</option>
                                    <option value="hobbyist">Hobbyist</option>
                                </select>
                            </div>
                            <div>
                                <input
                                    {...form.register('district')}
                                    placeholder="District"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                                {form.formState.errors.district && (
                                    <p className="text-xs text-red-500 mt-1 ml-1">{form.formState.errors.district.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Institution */}
                        <div>
                            <input
                                {...form.register('institution_name')}
                                placeholder="Institution Name"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            {form.formState.errors.institution_name && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{form.formState.errors.institution_name.message}</p>
                            )}
                        </div>

                        {/* Course & Class Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    {...form.register('course_of_study')}
                                    placeholder="Course"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                                {form.formState.errors.course_of_study && (
                                    <p className="text-xs text-red-500 mt-1 ml-1">{form.formState.errors.course_of_study.message}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    {...form.register('class_level')}
                                    placeholder="Class/Year"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                                {form.formState.errors.class_level && (
                                    <p className="text-xs text-red-500 mt-1 ml-1">{form.formState.errors.class_level.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3 pt-2">
                            <div className="relative flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    {...form.register('terms_accepted')}
                                    className="peer sr-only"
                                    id="terms"
                                />
                                <div
                                    onClick={() => setShowDisclaimer(true)}
                                    className={`w-5 h-5 border-2 rounded cursor-pointer transition-colors ${form.watch('terms_accepted')
                                        ? 'bg-indigo-600 border-indigo-600'
                                        : 'border-zinc-300 dark:border-zinc-600'
                                        }`}
                                ></div>
                                {form.watch('terms_accepted') && (
                                    <CheckCircle2 className="absolute w-3.5 h-3.5 text-white left-0.5 top-0.5 pointer-events-none" />
                                )}
                            </div>
                            <label htmlFor="terms" className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                                I agree to the <span className="text-indigo-600 hover:underline" onClick={() => setShowDisclaimer(true)}>AI Content Disclaimer</span> and Terms of Service
                            </label>
                        </div>
                        {form.formState.errors.terms_accepted && (
                            <p className="text-xs text-red-500 ml-1">{form.formState.errors.terms_accepted.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Create Account <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-black text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 py-3.5 rounded-xl font-medium transition-all"
                    >
                        <GoogleIcon className="w-5 h-5" />
                        Google
                    </button>
                </form>
            </div>
        </>
    );
};

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
);
