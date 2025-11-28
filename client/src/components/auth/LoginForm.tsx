import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Smartphone, ArrowRight } from 'lucide-react';
import { loginSchema, type LoginFormData } from '../../lib/validations/auth';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm: React.FC = () => {
    const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const { signInWithGoogle } = useAuth();

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: false,
        },
    });

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
        } catch {
            toast.error('Failed to sign in with Google');
            setLoading(false);
        }
    };

    const onSubmit = async (data: LoginFormData) => {
        try {
            setLoading(true);

            if (data.phone) {
                // Phone Login Flow
                const { error } = await supabase.auth.signInWithOtp({
                    phone: `+91${data.phone}`,
                });

                if (error) throw error;

                toast.success('OTP sent to your mobile number');
                setStep('otp');
                setCountdown(60);
            } else if (data.email) {
                // Email/Password Login (if supported) or Magic Link
                // Assuming Magic Link for now as password wasn't explicitly requested but "Login Component" usually implies it.
                // But user request only mentioned "Google Sign In" and "Phone OTP".
                // I'll stick to Phone OTP as the primary alternative to Google.
                // The schema allows email, but I'll focus on Phone for this form based on requirements.
                // If email is entered, I'll send magic link.
                const { error } = await supabase.auth.signInWithOtp({
                    email: data.email,
                });
                if (error) throw error;
                toast.success('Magic link sent to your email');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to sign in';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const onVerifyOtp = async (otp: string) => {
        try {
            setLoading(true);
            const phone = form.getValues('phone');

            const { error } = await supabase.auth.verifyOtp({
                phone: `+91${phone}`,
                token: otp,
                type: 'sms',
            });

            if (error) throw error;
            toast.success('Welcome back!');

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Invalid OTP';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Welcome Back
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Sign in to continue your learning journey
                </p>
            </div>

            {step === 'credentials' ? (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-zinc-400">+91</span>
                            <input
                                {...form.register('phone')}
                                placeholder="Mobile Number"
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        {form.formState.errors.phone && (
                            <p className="text-xs text-red-500 mt-1 ml-1">{form.formState.errors.phone.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                {...form.register('rememberMe')}
                                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Remember me</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Sign In with OTP <ArrowRight className="w-4 h-4" />
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
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 text-center space-y-2">
                        <Smartphone className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-zinc-900 dark:text-white">Verify Mobile Number</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Enter the OTP sent to +91 {form.getValues('phone')}
                        </p>
                    </div>

                    <OTPInput onComplete={onVerifyOtp} loading={loading} />

                    <div className="text-center">
                        {countdown > 0 ? (
                            <p className="text-sm text-zinc-500">Resend OTP in {countdown}s</p>
                        ) : (
                            <button
                                onClick={() => onSubmit(form.getValues())}
                                className="text-sm text-indigo-600 hover:underline font-medium"
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setStep('credentials')}
                        className="w-full text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    >
                        Change Number
                    </button>
                </div>
            )}
        </div>
    );
};

// Reusing helper components (should ideally be shared)
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

const OTPInput = ({ onComplete, loading }: { onComplete: (otp: string) => void, loading: boolean }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        if (element.value !== '') {
            const nextElement = element.nextElementSibling as HTMLInputElement;
            if (nextElement) nextElement.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            const prevElement = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
            if (prevElement) {
                prevElement.focus();
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
            }
        }
    };

    useEffect(() => {
        if (otp.every(d => d !== '')) {
            onComplete(otp.join(''));
        }
    }, [otp]);

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((data, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={data}
                    disabled={loading}
                    onChange={e => handleChange(e.target, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onFocus={e => e.target.select()}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
            ))}
        </div>
    );
};
