import React from 'react';
import { BrainCircuit } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-zinc-200 dark:border-zinc-800 p-8 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 relative">
                        <img
                            src="/aiqmpm.png"
                            alt="PlayQz Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                <div className="relative">
                    {children}
                </div>
            </div>
        </div>
    );
};
