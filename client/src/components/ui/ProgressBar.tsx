import { cn } from '../../lib/utils';

interface ProgressBarProps {
    progress: number;
    className?: string;
    showLabel?: boolean;
}

export function ProgressBar({ progress, className, showLabel = false }: ProgressBarProps) {
    // Ensure progress is between 0 and 100
    const normalizedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className={cn("w-full", className)}>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${normalizedProgress}%` }}
                ></div>
            </div>
            {showLabel && (
                <div className="text-xs text-gray-500 text-right mt-1">
                    {Math.round(normalizedProgress)}%
                </div>
            )}
        </div>
    );
}
