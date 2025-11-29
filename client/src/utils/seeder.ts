import { supabase } from '../lib/supabase';
import question2 from '../data/qbank/question2.json';
import question3 from '../data/qbank/question3.json';

// Combine all questions
const allQuestions = [...question2, ...question3];

export const seedQuestions = async (onProgress: (msg: string) => void) => {
    onProgress('Starting seed process...');

    // Get current user to set as creator
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('You must be logged in to seed questions.');
    }

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    onProgress(`Found ${allQuestions.length} questions to process.`);

    for (let i = 0; i < allQuestions.length; i++) {
        const q = allQuestions[i];

        // Check if exists
        const { data: existing } = await supabase
            .from('questions')
            .select('id')
            .eq('question_text', q.question)
            .single();

        if (existing) {
            skippedCount++;
            continue;
        }

        const { error } = await supabase.from('questions').insert({
            question_text: q.question,
            question_type: q.type,
            options: q.options,
            correct_answer: q.correct_answer,
            difficulty: q.difficulty.toLowerCase(),
            category: q.category,
            created_by: user.id,
            is_active: true,
            is_verified: true,
            points: 10,
            time_limit_seconds: 30
        });

        if (error) {
            console.error('Failed to insert:', q.question, error);
            failCount++;
        } else {
            successCount++;
        }

        if (i % 5 === 0) {
            onProgress(`Processed ${i + 1}/${allQuestions.length}...`);
        }
    }

    return { successCount, failCount, skippedCount };
};
