import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signupSchema, type SignupFormData } from '../../lib/validations/auth';
import { supabase } from '../../lib/supabase';
import { AIDisclaimerModal } from './AIDisclaimerModal';
import { useAuth } from '../../hooks/useAuth';

export const SignupForm: React.FC = () => {
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [loading, setLoading] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const { signInWithGoogle } = useAuth();

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            category: 'student',
            terms_accepted: undefined, // Must be explicitly true
        },
    });

    // Countdown timer for OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

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

    const onDetailsSubmit = async (data: SignupFormData) => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOtp({
                phone: `+91${data.mobile_number}`,
                options: {
                    shouldCreateUser: true,
                    data: {
                        name: data.full_name,
                        terms_accepted: true,
                        // Store other metadata if needed, but we'll update profile after
                    },
                },
            });

            if (error) throw error;

            toast.success('OTP sent to your mobile number');
            setStep('otp');
            setCountdown(60);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to send OTP';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const onVerifyOtp = async (otp: string) => {
        try {
            setLoading(true);
            const data = form.getValues();

            const { data: { session }, error } = await supabase.auth.verifyOtp({
                phone: `+91${data.mobile_number}`,
                token: otp,
                type: 'sms',
            });

            if (error) throw error;
            if (!session?.user) throw new Error('No session created');

            // Update profile with all details
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    name: data.full_name,
                    category: data.category,
                    district: data.district,
                    institution: data.institution_name,
                    course_of_study: data.course_of_study,
                    class_level: data.class_level,
                    phone: data.mobile_number,
                    terms_accepted: true,
                    terms_accepted_at: new Date().toISOString(),
                })
                .eq('id', session.user.id);

            if (updateError) {
                // If update fails (e.g. RLS), we might need to insert if it's a new user
                // But the trigger should have created the row.
                // Let's try upsert just in case
                const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: session.user.id,
                        name: data.full_name,
                        category: data.category,
                        district: data.district,
                        institution: data.institution_name,
                        course_of_study: data.course_of_study,
                        class_level: data.class_level,
                        phone: data.mobile_number,
                        terms_accepted: true,
                        terms_accepted_at: new Date().toISOString(),
                    });

                if (upsertError) throw upsertError;
            }

            toast.success('Account created successfully!');
            // Redirect or handle success (App will auto-redirect based on session)

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Invalid OTP';
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

                {step === 'details' ? (
                    <form onSubmit={form.handleSubmit(onDetailsSubmit)} className="space-y-4">
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
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 text-center space-y-2">
                            <Smartphone className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
                            <h3 className="font-semibold text-zinc-900 dark:text-white">Verify Mobile Number</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Enter the OTP sent to +91 {form.getValues('mobile_number')}
                            </p>
                        </div>

                        <OTPInput onComplete={onVerifyOtp} loading={loading} />

                        <div className="text-center">
                            {countdown > 0 ? (
                                <p className="text-sm text-zinc-500">Resend OTP in {countdown}s</p>
                            ) : (
                                <button
                                    onClick={() => onDetailsSubmit(form.getValues())}
                                    className="text-sm text-indigo-600 hover:underline font-medium"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setStep('details')}
                            className="w-full text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                        >
                            Change Number
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

// Helper Components
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

        // Focus next input
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
