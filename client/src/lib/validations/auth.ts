import { z } from 'zod';

export const loginSchema = z.object({
    identifier: z.string().min(1, "Email or Mobile Number is required"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
});

export const signupSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    mobile_number: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
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
