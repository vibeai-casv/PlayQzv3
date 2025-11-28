import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema, type QuestionFormData } from '../../lib/validations/admin';
import { Question } from '../../types';
import { useAdmin } from '../../hooks/useAdmin';
import { Loader2, Plus, Trash2, Save, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { MediaPicker } from './MediaPicker';

interface QuestionEditorProps {
    question?: Question;
    onSave: () => Promise<void>;
    onCancel: () => void;
}

export function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
    const { createQuestion, updateQuestion, isLoading } = useAdmin();
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const form = useForm<QuestionFormData>({
        resolver: zodResolver(questionSchema) as any,
        defaultValues: {
            question_text: '',
            question_type: 'text_mcq',
            category: 'General',
            difficulty: 'medium',
            points: 10,
            status: 'draft',
            options: ['', '', '', ''],
            correct_answer: '',
            explanation: '',
            image_url: '',
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control as any,
        name: "options"
    });

    useEffect(() => {
        if (question) {
            form.reset({
                question_text: question.question_text,
                question_type: question.question_type,
                category: question.category,
                difficulty: question.difficulty,
                points: question.points,
                status: question.status,
                options: question.options || [],
                correct_answer: question.correct_answer,
                explanation: question.explanation || '',
                image_url: question.image_url || '',
            });
        }
    }, [question, form]);

    const onSubmit = async (data: QuestionFormData) => {
        try {
            if (question) {
                await updateQuestion(question.id, data);
                toast.success('Question updated successfully');
            } else {
                await createQuestion(data);
                toast.success('Question created successfully');
            }
            onSave();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save question');
        }
    };

    const questionType = form.watch('question_type');

    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Question Type</label>
                    <select
                        {...form.register('question_type')}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="text_mcq">Multiple Choice</option>
                        <option value="image_identify_logo">Logo Identification</option>
                        <option value="image_identify_person">Person Identification</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <input
                        {...form.register('category')}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        placeholder="e.g. Science, History"
                    />
                    {form.formState.errors.category && (
                        <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>
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

                <div className="space-y-2">
                    <label className="text-sm font-medium">Points</label>
                    <input
                        type="number"
                        {...form.register('points', { valueAsNumber: true })}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                        {...form.register('status')}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Question Text</label>
                <textarea
                    {...form.register('question_text')}
                    rows={3}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter the question here..."
                />
                {form.formState.errors.question_text && (
                    <p className="text-xs text-red-500">{form.formState.errors.question_text.message}</p>
                )}
            </div>

            {(questionType === 'image_identify_logo' || questionType === 'image_identify_person') && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Image</label>
                    <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <div className="flex gap-2">
                                <input
                                    {...form.register('image_url')}
                                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="https://... or select from library"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowMediaPicker(true)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                            </div>
                            {form.watch('image_url') && (
                                <div className="mt-2 relative w-fit group">
                                    <img
                                        src={form.watch('image_url') || ''}
                                        alt="Preview"
                                        className="h-32 object-contain rounded border bg-gray-50 dark:bg-gray-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => form.setValue('image_url', '')}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Modal
                open={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                title="Select Media"
                className="max-w-3xl"
            >
                <MediaPicker
                    onSelect={(url) => {
                        form.setValue('image_url', url);
                        setShowMediaPicker(false);
                    }}
                    onCancel={() => setShowMediaPicker(false)}
                />
            </Modal>

            {(questionType === 'text_mcq' || questionType === 'image_identify_logo' || questionType === 'image_identify_person') && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Options</label>
                        <button
                            type="button"
                            onClick={() => append('')}
                            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add Option
                        </button>
                    </div>
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <input
                                    {...form.register(`options.${index}` as const)}
                                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder={`Option ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium">Correct Answer</label>
                {questionType === 'true_false' ? (
                    <select
                        {...form.register('correct_answer')}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">Select Answer</option>
                        <option value="True">True</option>
                        <option value="False">False</option>
                    </select>
                ) : (questionType === 'text_mcq' || questionType === 'image_identify_logo' || questionType === 'image_identify_person') ? (
                    <select
                        {...form.register('correct_answer')}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">Select Correct Option</option>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {form.watch('options')?.map((opt: any, i: number) => (
                            opt && <option key={i} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        {...form.register('correct_answer')}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Enter correct answer"
                    />
                )}
                {form.formState.errors.correct_answer && (
                    <p className="text-xs text-red-500">{form.formState.errors.correct_answer.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Explanation (Optional)</label>
                <textarea
                    {...form.register('explanation')}
                    rows={2}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Explain why this is the correct answer..."
                />
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
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Question
                </button>
            </div>
        </form>
    );
}
