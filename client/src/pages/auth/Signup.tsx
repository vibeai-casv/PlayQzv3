import React from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { SignupForm } from '../../components/auth/SignupForm';
import { Link } from 'react-router-dom';

export const Signup: React.FC = () => {
    return (
        <AuthLayout>
            <SignupForm />
            <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-all">
                    Sign in instead
                </Link>
            </div>
        </AuthLayout>
    );
};
