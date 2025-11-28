// Database Types
export interface User {
    id: string;
    email?: string;
    phone?: string;
    name: string;
    institution?: string;
    category?: 'student' | 'professional' | 'educator' | 'hobbyist';
    role: 'user' | 'admin';
    bio?: string;
    avatar?: string;
    preferences?: UserPreferences;
    stats?: UserStats;
    disabled: boolean;
    created_at: string;
    updated_at: string;
    last_login_at?: string;
    district?: string;
    course_of_study?: string;
    class_level?: string;
    terms_accepted?: boolean;
}

export interface UserPreferences {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
}

export interface UserStats {
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    totalTimeSpent: number;
}

export interface Question {
    id: string;
    question_text: string;
    question_type: 'text_mcq' | 'image_identify_logo' | 'image_identify_person' | 'true_false' | 'short_answer';
    options?: string[];
    correct_answer: string;
    image_url?: string;
    media_id?: string;
    explanation?: string;
    hint?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    subcategory?: string;
    tags?: string[];
    points: number;
    status: 'active' | 'inactive' | 'draft';
    ai_generated: boolean;
    created_at: string;
    updated_at: string;
}

export interface QuizAttempt {
    id: string;
    user_id: string;
    config: QuizConfig;
    quiz_hash?: string;
    question_ids: string[];
    status: 'in_progress' | 'completed' | 'abandoned' | 'expired';
    score?: number;
    correct_answers: number;
    total_questions: number;
    time_spent_seconds?: number;
    started_at: string;
    completed_at?: string;
    expires_at?: string;
    accuracy_rate?: number;
    average_time_per_question?: number;
    created_at: string;
    updated_at: string;
}

export interface QuizConfig {
    numQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    categories: string[];
    timeLimit?: number;
    includeExplanations: boolean;
}

export interface QuizResponse {
    id: string;
    attempt_id: string;
    question_id: string;
    user_id: string;
    user_answer: string;
    is_correct: boolean;
    time_spent_seconds?: number;
    answered_at: string;
    points_awarded: number;
    max_points?: number;
    question_position?: number;
    skipped: boolean;
    created_at: string;
    updated_at: string;
}

export interface MediaFile {
    id: string;
    filename: string;
    original_filename: string;
    url: string;
    type: 'logo' | 'personality' | 'question_image' | 'avatar';
    mime_type: string;
    size_bytes: number;
    description?: string;
    folder?: 'logos' | 'personalities';
    storage_object_id?: string;
    uploaded_by: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ActivityLog {
    id: string;
    user_id?: string;
    activity_type: 'login' | 'logout' | 'signup' | 'profile_updated' | 'quiz_started' | 'quiz_completed' | 'quiz_abandoned' | 'password_changed' | 'email_changed' | 'account_disabled' | 'account_enabled' | 'question_created' | 'question_updated' | 'media_uploaded' | 'achievement_earned' | 'settings_changed';
    description: string;
    related_entity_type?: string;
    related_entity_id?: string;
    metadata?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    success: boolean;
    error_message?: string;
    created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Array<{
        field: string;
        message: string;
    }>;
    timestamp: string;
}

// Auth Types
export interface LoginCredentials {
    provider?: 'google';
    token?: string;
    phone?: string;
    email?: string;
    password?: string;
}

export interface SignupData {
    email?: string;
    phone?: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
    requiresOtp?: boolean;
}

// Form Types
export interface QuizGenerateForm {
    numQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    categories: string[];
    timeLimit?: number;
    includeExplanations: boolean;
}

export interface QuestionForm {
    question_text: string;
    question_type: 'text_mcq' | 'image_identify_logo' | 'image_identify_person' | 'true_false' | 'short_answer';
    options?: string[];
    correct_answer: string;
    image_url?: string;
    explanation?: string;
    hint?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    subcategory?: string;
    tags?: string[];
    points: number;
    time_limit_seconds?: number;
}

export interface ProfileUpdateForm {
    name?: string;
    institution?: string;
    category?: 'student' | 'professional' | 'educator' | 'hobbyist';
    bio?: string;
    avatar?: string;
    preferences?: UserPreferences;
}

// Dashboard Types
export interface AnalyticsData {
    totalUsers: number;
    activeUsers: number;
    totalQuizzes: number;
    totalAttempts: number;
    completedAttempts?: number;
    averageScore: number;
    categoryStats?: CategoryStat[];
    difficultyStats?: DifficultyStat[];
    userGrowth?: GrowthData[];
    topPerformers?: TopPerformer[];
}

export interface CategoryStat {
    category: string;
    totalQuestions?: number;
    attempts: number;
    accuracyRate: number;
    averageScore?: number;
}

export interface DifficultyStat {
    difficulty: 'easy' | 'medium' | 'hard';
    category?: string;
    count: number;
    avgAccuracy: number;
    attempts?: number;
    averageScore?: number;
}

export interface GrowthData {
    date: string;
    count: number;
}

export interface TopPerformer {
    userId: string;
    name: string;
    averageScore: number;
    totalQuizzes: number;
}

// Component Prop Types
export interface QuizCardProps {
    attempt: QuizAttempt;
    onResume?: () => void;
    onView?: () => void;
}

export interface QuestionCardProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    selectedAnswer?: string;
    onAnswerSelect: (answer: string) => void;
    timeRemaining?: number;
    showExplanation?: boolean;
}

export interface ResultsCardProps {
    attempt: QuizAttempt;
    responses: QuizResponse[];
    questions: Question[];
    onRetry?: () => void;
    onReview?: () => void;
}
