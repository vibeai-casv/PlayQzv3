import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Verify Admin Authentication
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        // Check if user is admin (you might need a more robust check depending on your schema, 
        // e.g., checking a 'profiles' table or app_metadata)
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            throw new Error('Forbidden: Admin access required')
        }

        // 2. Parse and Validate Input
        const { category, count, difficulty, type } = await req.json()

        if (count > 50) throw new Error('Max 50 questions per request')
        if (!category || !difficulty || !type) throw new Error('Missing required fields')

        const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
        if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

        // 3. Select Prompt Template
        let systemPrompt = `You are an expert quiz creator. Generate ${count} ${difficulty} level questions about "${category}".`

        const formatInstructions = `
        Return ONLY a valid JSON array of objects. No other text.
        Each object must have:
        - question_text: string
        - options: array of 4 strings (for text_mcq) or empty array
        - correct_answer: string (must match one option exactly)
        - explanation: string (brief explanation of why the answer is correct)
        - tags: array of strings (keywords)
        `

        if (type === 'text_mcq') {
            systemPrompt += `
            Type: Multiple Choice
            ${formatInstructions}
            Ensure options are plausible but only one is correct.
            `
        } else if (type === 'true_false') {
            systemPrompt += `
            Type: True/False
            ${formatInstructions}
            options should be empty.
            correct_answer must be "True" or "False".
            `
        } else if (type === 'short_answer') {
            systemPrompt += `
            Type: Short Answer
            ${formatInstructions}
            options should be empty.
            correct_answer should be a concise phrase or word.
            `
        } else {
            // Default/Fallback
            systemPrompt += `
            Type: ${type}
            ${formatInstructions}
            `
        }

        // 4. Call Claude API with Retry Logic
        const callClaude = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'x-api-key': apiKey,
                            'anthropic-version': '2023-06-01',
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: 'claude-sonnet-4-20250514', // Using requested model
                            max_tokens: 4096,
                            system: "You are a helpful assistant that generates high-quality quiz questions in strict JSON format.",
                            messages: [
                                { role: 'user', content: systemPrompt }
                            ],
                        }),
                    })

                    const data = await response.json()
                    if (data.error) throw new Error(data.error.message)
                    return data
                } catch (err) {
                    if (i === retries - 1) throw err
                    await new Promise(r => setTimeout(r, 1000 * (i + 1))) // Exponential backoff
                }
            }
        }

        const aiData = await callClaude()
        const content = aiData.content[0].text

        // 5. Parse and Validate JSON
        let generatedQuestions
        try {
            generatedQuestions = JSON.parse(content)
        } catch (e) {
            const jsonMatch = content.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
                generatedQuestions = JSON.parse(jsonMatch[0])
            } else {
                throw new Error('Failed to parse AI response')
            }
        }

        if (!Array.isArray(generatedQuestions)) throw new Error('AI did not return an array')

        // 6. Insert into Database
        // Use Service Role key for admin write access if needed, or stick to user's client if RLS allows
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const questionsToInsert = generatedQuestions.map((q: any) => ({
            question_text: q.question_text,
            question_type: type,
            category: category,
            difficulty: difficulty,
            points: 10,
            status: 'draft', // is_active=false equivalent
            ai_generated: true,
            options: q.options || [],
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            tags: q.tags || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }))

        const { data, error } = await supabaseAdmin
            .from('questions')
            .insert(questionsToInsert)
            .select()

        if (error) throw error

        return new Response(JSON.stringify({ questions: data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
