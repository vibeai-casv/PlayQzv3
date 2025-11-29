import { useState } from 'react';
import { seedQuestions } from '../../utils/seeder';
import { toast } from 'sonner';
import { Database, Play, AlertTriangle, Terminal } from 'lucide-react';

export function SystemTools() {
    const [seeding, setSeeding] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleSeed = async () => {
        if (!confirm('This will insert questions from the local JSON files into the database. Continue?')) return;

        setSeeding(true);
        setLogs([]);
        addLog('Starting seed process...');

        try {
            const result = await seedQuestions((msg) => addLog(msg));
            addLog(`Completed! Success: ${result.successCount}, Skipped: ${result.skippedCount}, Failed: ${result.failCount}`);
            toast.success(`Seeding complete! Added ${result.successCount} questions.`);
        } catch (error: any) {
            addLog(`Error: ${error.message}`);
            toast.error('Seeding failed');
        } finally {
            setSeeding(false);
        }
    };

    const rpcSql = `
-- 1. Create generate_quiz RPC
CREATE OR REPLACE FUNCTION public.generate_quiz(
    p_num_questions INTEGER,
    p_difficulty TEXT,
    p_categories TEXT[],
    p_time_limit INTEGER
)
RETURNS TABLE(question_ids UUID[]) AS $$
DECLARE
    v_question_ids UUID[];
BEGIN
    SELECT ARRAY_AGG(id)
    INTO v_question_ids
    FROM (
        SELECT id
        FROM public.questions
        WHERE 
            is_active = true AND
            (p_difficulty = 'Mixed' OR difficulty::TEXT = LOWER(p_difficulty)) AND
            (array_length(p_categories, 1) IS NULL OR category = ANY(p_categories))
        ORDER BY random()
        LIMIT p_num_questions
    ) sub;

    RETURN QUERY SELECT v_question_ids;
END;
$$ LANGUAGE plpgsql;

-- 2. Fix Permissions (Recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply policies...
-- (See full migration file for policies)
`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">System Tools</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Seed Questions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Database className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Seed Question Bank</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Import questions from the local JSON files (`qbank/`) into the Supabase database.
                        Duplicates will be skipped automatically.
                    </p>

                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {seeding ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Start Seeding
                            </>
                        )}
                    </button>

                    {logs.length > 0 && (
                        <div className="mt-6 bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto">
                            {logs.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Database Setup Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Database Setup Required</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Some database functions (RPCs) cannot be created from this dashboard.
                        If "Start Quiz" is failing, please run the following SQL in your Supabase SQL Editor:
                    </p>

                    <div className="relative">
                        <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 overflow-x-auto h-64 border border-gray-200">
                            {rpcSql}
                        </pre>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(rpcSql);
                                toast.success('SQL copied to clipboard');
                            }}
                            className="absolute top-2 right-2 p-2 bg-white rounded shadow hover:bg-gray-50 text-xs font-medium text-gray-600 border border-gray-200"
                        >
                            Copy SQL
                        </button>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                        <Terminal className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>
                            Go to Supabase Dashboard &rarr; SQL Editor &rarr; New Query &rarr; Paste & Run.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
