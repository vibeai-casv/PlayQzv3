import { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { supabase } from '../../lib/supabase';
import { Question } from '../../types';
import { Modal } from '../../components/ui/Modal';
import {
    Search, Plus, Sparkles, Trash2, CheckCircle, XCircle,
    Edit, Loader2, ChevronLeft, ChevronRight, ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { QuestionEditor } from '../../components/admin/QuestionEditor';
import { AIGenerator } from '../../components/admin/AIGenerator';

export function Questions() {
    const { fetchQuestions, deleteQuestion, updateQuestion, isLoading } = useAdmin();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    // Filters
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [type, setType] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive' | 'draft' | ''>('');
    const [aiGenerated, setAiGenerated] = useState<boolean | undefined>(undefined);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Selection & Modals
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);

    const loadQuestions = useCallback(async () => {
        try {
            const offset = (page - 1) * limit;
            const { questions: data, total: count } = await fetchQuestions({
                search,
                category: category || undefined,
                difficulty: difficulty || undefined,
                type: type || undefined,
                status: status || undefined,
                ai_generated: aiGenerated,
                limit,
                offset,
                sortBy,
                sortOrder
            });
            setQuestions(data);
            setTotal(count);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load questions');
        }
    }, [page, limit, search, category, difficulty, type, status, aiGenerated, sortBy, sortOrder, fetchQuestions]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadQuestions();
        }, 300);
        return () => clearTimeout(timer);
    }, [loadQuestions]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // Real-time updates
    useEffect(() => {
        const channel = supabase
            .channel('questions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'questions'
                },
                () => {
                    loadQuestions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadQuestions]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            await deleteQuestion(id);
            toast.success('Question deleted');
            loadQuestions();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete question');
        }
    };

    const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
        if (selectedIds.size === 0) return;
        if (action === 'delete' && !confirm(`Delete ${selectedIds.size} questions?`)) return;

        try {
            await Promise.all(
                Array.from(selectedIds).map(id => {
                    if (action === 'delete') return deleteQuestion(id);
                    return updateQuestion(id, { status: action === 'activate' ? 'active' : 'inactive' });
                })
            );
            toast.success('Bulk action completed');
            setSelectedIds(new Set());
            loadQuestions();
        } catch (error) {
            console.error(error);
            toast.error('Failed to perform bulk action');
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const selectAll = () => {
        if (selectedIds.size === questions.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(questions.map(q => q.id)));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Question Bank</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsGeneratorOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        <Sparkles className="w-4 h-4" /> AI Generate
                    </button>
                    <button
                        onClick={() => {
                            setEditingQuestion(undefined);
                            setIsEditorOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4" /> Add Question
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">All Types</option>
                        <option value="text_mcq">Multiple Choice</option>
                        <option value="image_identify_logo">Logo ID</option>
                        <option value="image_identify_person">Person ID</option>
                        <option value="true_false">True/False</option>
                    </select>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'draft' | '')}
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                    </select>
                    <select
                        value={aiGenerated === undefined ? '' : aiGenerated.toString()}
                        onChange={(e) => setAiGenerated(e.target.value === '' ? undefined : e.target.value === 'true')}
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">All Sources</option>
                        <option value="true">AI Generated</option>
                        <option value="false">Manual</option>
                    </select>
                </div>

                {selectedIds.size > 0 && (
                    <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                        <button
                            onClick={() => handleBulkAction('activate')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                        >
                            <CheckCircle className="w-4 h-4" /> Activate Selected
                        </button>
                        <button
                            onClick={() => handleBulkAction('deactivate')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
                        >
                            <XCircle className="w-4 h-4" /> Deactivate Selected
                        </button>
                        <button
                            onClick={() => handleBulkAction('delete')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Selected
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="p-4 w-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === questions.length && questions.length > 0}
                                        onChange={selectAll}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('question_text')}>
                                    <div className="flex items-center gap-2">
                                        Question <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('question_type')}>
                                    <div className="flex items-center gap-2">
                                        Type <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('category')}>
                                    <div className="flex items-center gap-2">
                                        Category <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('difficulty')}>
                                    <div className="flex items-center gap-2">
                                        Difficulty <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('status')}>
                                    <div className="flex items-center gap-2">
                                        Status <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('ai_generated')}>
                                    <div className="flex items-center gap-2">
                                        Source <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                                    </td>
                                </tr>
                            ) : questions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">
                                        No questions found
                                    </td>
                                </tr>
                            ) : (
                                questions.map((q) => (
                                    <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(q.id)}
                                                onChange={() => toggleSelection(q.id)}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="p-4 max-w-md truncate" title={q.question_text}>
                                            {q.question_text}
                                        </td>
                                        <td className="p-4 capitalize">{q.question_type.replace(/_/g, ' ')}</td>
                                        <td className="p-4">{q.category}</td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium capitalize",
                                                q.difficulty === 'easy' ? "bg-green-100 text-green-700" :
                                                    q.difficulty === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                                        "bg-red-100 text-red-700"
                                            )}>
                                                {q.difficulty}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium capitalize",
                                                q.status === 'active' ? "bg-green-100 text-green-700" :
                                                    q.status === 'inactive' ? "bg-gray-100 text-gray-700" :
                                                        "bg-yellow-100 text-yellow-700"
                                            )}>
                                                {q.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {q.ai_generated && (
                                                <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full w-fit">
                                                    <Sparkles className="w-3 h-3" /> AI
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingQuestion(q);
                                                        setIsEditorOpen(true);
                                                    }}
                                                    className="p-1 text-gray-500 hover:text-indigo-600"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    className="p-1 text-gray-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} questions
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * limit >= total}
                            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                open={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                title={editingQuestion ? 'Edit Question' : 'Create Question'}
                className="max-w-4xl"
            >
                <QuestionEditor
                    question={editingQuestion}
                    onSave={async () => {
                        setIsEditorOpen(false);
                        loadQuestions();
                    }}
                    onCancel={() => setIsEditorOpen(false)}
                />
            </Modal>

            <Modal
                open={isGeneratorOpen}
                onClose={() => setIsGeneratorOpen(false)}
                title="AI Question Generator"
                className="max-w-2xl"
            >
                <AIGenerator
                    onGenerate={async () => {
                        setIsGeneratorOpen(false);
                        loadQuestions();
                    }}
                    onCancel={() => setIsGeneratorOpen(false)}
                />
            </Modal>
        </div>
    );
}
