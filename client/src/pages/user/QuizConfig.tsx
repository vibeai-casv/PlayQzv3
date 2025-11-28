import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    CheckCircle,
    XCircle,
    Loader2,
    Clock,
    BarChart2,
    BookOpen,
    Bot,
    Cpu,
    Brain,
    Users,
    PlayCircle,
    AlertCircle,
    Shield,
} from 'lucide-react';
import { useQuiz } from '../../hooks/useQuiz';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

// ----- Validation Schema -----
const quizConfigSchema = z.object({
    numQuestions: z.enum(['5', '10', '20', '50']),
    difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Mixed']),
    categories: z
        .array(
            z.enum([
                'Latest Developments',
                'AI Safety',
                'Robotics',
                'Quantum Computing',
                'Generative AI',
                'Personalities',
                'Brands',
            ])
        )
        .min(1, { message: 'Select at least one category' }),
});

type QuizConfig = z.infer<typeof quizConfigSchema>;

// ----- Helper Types -----
type CategoryName =
    | 'Latest Developments'
    | 'AI Safety'
    | 'Robotics'
    | 'Quantum Computing'
    | 'Generative AI'
    | 'Personalities'
    | 'Brands';

interface CategoryInfo {
    name: CategoryName;
    icon: React.ReactNode;
    available: number; // number of questions available in DB
}

const CATEGORY_DATA: CategoryInfo[] = [
    { name: 'Latest Developments', icon: <BarChart2 className="w-5 h-5" />, available: 0 },
    { name: 'AI Safety', icon: <Shield className="w-5 h-5" />, available: 0 },
    { name: 'Robotics', icon: <Bot className="w-5 h-5" />, available: 0 },
    { name: 'Quantum Computing', icon: <Cpu className="w-5 h-5" />, available: 0 },
    { name: 'Generative AI', icon: <Brain className="w-5 h-5" />, available: 0 },
    { name: 'Personalities', icon: <Users className="w-5 h-5" />, available: 0 },
    { name: 'Brands', icon: <BookOpen className="w-5 h-5" />, available: 0 },
];

export function QuizConfig() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
        setValue,
    } = useForm<QuizConfig>({
        resolver: zodResolver(quizConfigSchema),
        mode: 'onChange',
        defaultValues: {
            numQuestions: '10',
            difficulty: 'Mixed',
            categories: [],
        },
    });

    const [categoryInfo, setCategoryInfo] = useState<CategoryInfo[]>(CATEGORY_DATA);
    const [loadingCounts, setLoadingCounts] = useState(false);
    const [startLoading, setStartLoading] = useState(false);
    const [startError, setStartError] = useState<string | null>(null);

    const { generateQuiz } = useQuiz();

    // Load available question counts per category on mount
    useEffect(() => {
        const fetchCounts = async () => {
            setLoadingCounts(true);
            try {
                const { data, error } = await supabase
                    .from('questions')
                    .select('category')
                    .neq('category', null);
                if (error) throw error;
                const counts: Record<string, number> = {};
                data?.forEach((row: { category: string }) => {
                    const cat = row.category;
                    counts[cat] = (counts[cat] ?? 0) + 1;
                });
                setCategoryInfo((prev) =>
                    prev.map((c) => ({ ...c, available: counts[c.name] ?? 0 }))
                );
            } catch (e) {
                console.error('Failed to fetch category counts', e);
            } finally {
                setLoadingCounts(false);
            }
        };
        fetchCounts();
    }, []);

    // Load saved config from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('quizConfig');
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as QuizConfig;
                setValue('numQuestions', parsed.numQuestions);
                setValue('difficulty', parsed.difficulty);
                setValue('categories', parsed.categories);
            } catch { }
        }
    }, [setValue]);

    const onSubmit = async (data: QuizConfig) => {
        setStartError(null);
        setStartLoading(true);
        localStorage.setItem('quizConfig', JSON.stringify(data));
        try {
            const config = {
                numQuestions: Number(data.numQuestions),
                difficulty: data.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard' | 'mixed',
                categories: data.categories,
                timeLimit: Number(data.numQuestions) * 30,
                includeExplanations: true,
            };
            await generateQuiz(config);
        } catch (e) {
            setStartError(e instanceof Error ? e.message : 'Failed to generate quiz');
        } finally {
            setStartLoading(false);
        }
    };

    const watched = watch();
    const selectedCategories = watched.categories as CategoryName[];
    const insufficient = selectedCategories.some((cat) => {
        const info = categoryInfo.find((c) => c.name === cat);
        return info && info.available < Number(watched.numQuestions);
    });

    const estimatedTime = Number(watched.numQuestions) * 30; // seconds

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Quiz Configuration</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Number of Questions */}
                <section className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Number of Questions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {['5', '10', '20', '50'].map((val) => (
                            <label
                                key={val}
                                className={cn(
                                    'flex items-center p-3 border rounded-lg cursor-pointer hover:border-primary-500 transition',
                                    watched.numQuestions === val && 'border-primary-600 bg-primary-50'
                                )}
                            >
                                <input
                                    type="radio"
                                    value={val}
                                    {...register('numQuestions')}
                                    className="hidden"
                                />
                                <span className="ml-2 text-gray-700">{val}</span>
                            </label>
                        ))}
                    </div>
                    {errors.numQuestions && (
                        <p className="mt-2 text-sm text-red-600">{errors.numQuestions.message}</p>
                    )}
                </section>

                {/* Difficulty */}
                <section className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Difficulty</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {['Easy', 'Medium', 'Hard', 'Mixed'].map((diff) => (
                            <label
                                key={diff}
                                className={cn(
                                    'flex items-center p-3 border rounded-lg cursor-pointer hover:border-primary-500 transition',
                                    watched.difficulty === diff && 'border-primary-600 bg-primary-50'
                                )}
                            >
                                <input type="radio" value={diff} {...register('difficulty')} className="hidden" />
                                <span className="ml-2 text-gray-700">{diff}</span>
                            </label>
                        ))}
                    </div>
                    {errors.difficulty && (
                        <p className="mt-2 text-sm text-red-600">{errors.difficulty.message}</p>
                    )}
                </section>

                {/* Categories */}
                <section className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryInfo.map((cat) => (
                            <label
                                key={cat.name}
                                className={cn(
                                    'flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition',
                                    selectedCategories.includes(cat.name) && 'border-primary-600 bg-primary-50'
                                )}
                            >
                                <input
                                    type="checkbox"
                                    value={cat.name}
                                    {...register('categories')}
                                    className="hidden"
                                />
                                <div className="mr-3">{cat.icon}</div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{cat.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {loadingCounts ? 'Loading…' : `${cat.available} available`}
                                    </p>
                                </div>
                                {selectedCategories.includes(cat.name) && (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                            </label>
                        ))}
                    </div>
                    {errors.categories && (
                        <p className="mt-2 text-sm text-red-600">{errors.categories.message}</p>
                    )}
                </section>

                {/* Preview & Estimated Time */}
                <section className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Preview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600"><strong>Questions:</strong> {watched.numQuestions}</p>
                            <p className="text-gray-600"><strong>Difficulty:</strong> {watched.difficulty}</p>
                            <p className="text-gray-600"><strong>Categories:</strong> {selectedCategories.length ? selectedCategories.join(', ') : 'None'}</p>
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-6 h-6 mr-2 text-primary-600" />
                            <span className="text-lg font-medium text-gray-800">
                                Estimated time: {Math.round(estimatedTime / 60)} min {estimatedTime % 60}s
                            </span>
                        </div>
                    </div>
                    {insufficient && (
                        <p className="mt-4 text-sm text-red-600 flex items-center">
                            <XCircle className="w-5 h-5 mr-1" />
                            Some selected categories do not have enough questions for the chosen amount.
                        </p>
                    )}
                </section>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!isValid || insufficient || startLoading}
                        className={cn(
                            'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed',
                            startLoading && 'animate-pulse'
                        )}
                    >
                        {startLoading ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <PlayCircle className="w-5 h-5 mr-2" />
                        )}
                        {startLoading ? 'Generating...' : 'Start Quiz'}
                    </button>
                </div>
                {startError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-1" /> {startError}
                    </p>
                )}
            </form>
        </div>
    );
}
