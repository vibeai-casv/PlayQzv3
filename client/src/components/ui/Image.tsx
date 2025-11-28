import { useState } from 'react';
import { cn } from '../../lib/utils';
import { ImageIcon } from 'lucide-react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

export function Image({ className, src, alt, fallbackSrc, ...props }: ImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    if (hasError) {
        return (
            <div className={cn("flex items-center justify-center bg-gray-100 text-gray-400", className)}>
                <ImageIcon className="w-8 h-8" />
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={handleLoad}
                onError={handleError}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100"
                )}
                {...props}
            />
        </div>
    );
}
