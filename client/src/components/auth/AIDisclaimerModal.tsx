import React, { useState } from 'react';
import { AlertTriangle, Check, Shield } from 'lucide-react';

interface AIDisclaimerModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export const AIDisclaimerModal: React.FC<AIDisclaimerModalProps> = ({
    isOpen,
    onAccept,
    onDecline,
}) => {
    const [isChecked, setIsChecked] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-amber-500/10 p-6 border-b border-amber-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-500">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            AI Content Disclaimer
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        This platform uses advanced Artificial Intelligence to generate quiz content,
                        including questions, images, and explanations.
                    </p>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="flex gap-2">
                            <Shield className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
                            <p>While we strive for accuracy, AI-generated content may occasionally contain errors or inaccuracies.</p>
                        </div>
                        <div className="flex gap-2">
                            <Shield className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
                            <p>Please verify critical information independently. Use this tool as a learning aid, not a definitive source.</p>
                        </div>
                    </div>

                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                        <div className="relative flex items-center mt-0.5">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={isChecked}
                                onChange={(e) => setIsChecked(e.target.checked)}
                            />
                            <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 rounded transition-colors peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-500/20"></div>
                            <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 top-0.5 transition-opacity pointer-events-none" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                            I understand and agree to the terms regarding AI-generated content.
                        </span>
                    </label>
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 flex gap-3">
                    <button
                        onClick={onDecline}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAccept}
                        disabled={!isChecked}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        I Agree & Continue
                    </button>
                </div>
            </div>
        </div>
    );
};
