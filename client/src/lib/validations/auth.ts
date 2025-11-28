import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    rememberMe: z.boolean().optional(),
}).refine((data) => data.email || data.phone, {
    message: "Email or phone number is required",
    path: ["email"],
});

export const signupSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    mobile_number: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
    category: z.enum(['student', 'professional', 'educator', 'hobbyist']),
    district: z.string().min(2, 'District is required'),
    institution_name: z.string().min(2, 'Institution name is required'),
    course_of_study: z.string().min(2, 'Course of study is required'),
    class_level: z.string().min(1, 'Class level is required'),
    terms_accepted: z.boolean().refine(val => val === true, {
        message: 'You must accept the AI disclaimer',
    }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
