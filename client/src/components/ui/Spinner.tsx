import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    return (
        <div role="status" {...props}>
            <Loader2
                className={cn(
                    "animate-spin text-primary-600",
                    sizeClasses[size],
                    className
                )}
            />
            <span className="sr-only">Loading...</span>
        </div>
    );
}
