import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aiGenerationSchema, type AIGenerationFormData } from '../../lib/validations/admin';
import { useAdmin } from '../../hooks/useAdmin';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AIGeneratorProps {
    onGenerate: () => Promise<void>;
    onCancel: () => void;
}

export function AIGenerator({ onGenerate, onCancel }: AIGeneratorProps) {
    const { generateQuestions, isLoading } = useAdmin();

    const form = useForm<AIGenerationFormData>({
        resolver: zodResolver(aiGenerationSchema),
        defaultValues: {
            topic: '',
            count: 5,
            difficulty: 'medium',
            type: 'text_mcq',
        }
    });

    const onSubmit = async (data: AIGenerationFormData) => {
        try {
            await generateQuestions(data);
            toast.success('Questions generated successfully! Check the Drafts tab.');
            onGenerate();
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate questions. Please try again.');
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-sm text-purple-800 dark:text-purple-200">
                    <p className="flex items-center gap-2 font-medium">
                        <Sparkles className="w-4 h-4" /> AI Generation
                    </p>
                    <p className="mt-1 opacity-90">
                        Generated questions will be saved as <strong>Drafts</strong>. You can review and activate them later.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Topic / Subject</label>
                    <input
                        {...form.register('topic')}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        placeholder="e.g. Solar System, World War II, Python Programming"
                    />
                    {form.formState.errors.topic && (
                        <p className="text-xs text-red-500">{form.formState.errors.topic.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Number of Questions</label>
                        <input
                            type="number"
                            {...form.register('count', { valueAsNumber: true })}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            min={1}
                            max={50}
                        />
                        {form.formState.errors.count && (
                            <p className="text-xs text-red-500">{form.formState.errors.count.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Difficulty</label>
                        <select
                            {...form.register('difficulty')}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Question Type</label>
                    <select
                        {...form.register('type')}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="text_mcq">Multiple Choice</option>
                        <option value="image_identify_logo">Logo Identification</option>
                        <option value="image_identify_person">Person Identification</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate
                </button>
            </div>
        </form>
    );
}
