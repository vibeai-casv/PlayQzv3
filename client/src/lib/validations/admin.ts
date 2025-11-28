import { z } from 'zod';

export const questionSchema = z.object({
    question_text: z.string().min(3, 'Question text must be at least 3 characters'),
    question_type: z.enum(['text_mcq', 'image_identify_logo', 'image_identify_person', 'true_false', 'short_answer']),
    category: z.string().min(1, 'Category is required'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    points: z.number().min(1, 'Points must be at least 1'),
    status: z.enum(['active', 'inactive', 'draft']),
    options: z.array(z.string()).default([]),
    correct_answer: z.string().min(1, 'Correct answer is required'),
    explanation: z.string().optional(),
    image_url: z.string().url().optional().or(z.literal('')),
});

export type QuestionFormData = z.infer<typeof questionSchema>;

export const aiGenerationSchema = z.object({
    topic: z.string().min(3, 'Topic is required'),
    count: z.number().min(1).max(50),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    type: z.enum(['text_mcq', 'image_identify_logo', 'image_identify_person', 'true_false', 'short_answer']),
});

export type AIGenerationFormData = z.infer<typeof aiGenerationSchema>;
