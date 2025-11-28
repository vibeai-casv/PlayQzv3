import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { MediaFile, Question } from '../../types';
import { Loader2, Upload, Search, Trash2, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';

export function Media() {
    const { fetchMedia, uploadMedia, deleteMedia, fetchQuestions, updateQuestion, isLoading } = useAdmin();
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    // Filters
    const [search, setSearch] = useState('');
    const [type, setType] = useState<'logo' | 'personality' | 'all'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

    // Assignment Modal State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
    const [questionSearch, setQuestionSearch] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const loadMedia = useCallback(async () => {
        try {
            const { media: data } = await fetchMedia({
                type: type === 'all' ? undefined : type
            });
            setMedia(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load media');
        }
    }, [fetchMedia, type]);

    useEffect(() => {
        loadMedia();
    }, [loadMedia]);

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const fileArray = Array.from(files);

        // Validate files
        const validFiles = fileArray.filter(file => {
            const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

            if (!isValidType) toast.error(`${file.name}: Invalid file type. Use JPG, PNG, or WebP.`);
            if (!isValidSize) toast.error(`${file.name}: File too large. Max 5MB.`);

            return isValidType && isValidSize;
        });

        if (validFiles.length === 0) {
            setIsUploading(false);
            return;
        }

        try {
            await Promise.all(validFiles.map(async (file) => {
                setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
                // Simulate progress (since supabase storage upload doesn't provide progress callback easily here)
                const interval = setInterval(() => {
                    setUploadProgress(prev => ({
                        ...prev,
                        [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
                    }));
                }, 200);

                const uploadType = type === 'all' ? 'logo' : type;
                await uploadMedia(file, uploadType);

                clearInterval(interval);
                setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
            }));

            toast.success(`${validFiles.length} file(s) uploaded successfully`);
            loadMedia();
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload some files');
        } finally {
            setIsUploading(false);
            setUploadProgress({});
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        handleFileUpload(e.dataTransfer.files);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await deleteMedia(id);
            toast.success('Image deleted successfully');
            loadMedia();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete image');
        }
    };

    // Assignment Flow
    const openAssignModal = (mediaItem: MediaFile) => {
        setSelectedMedia(mediaItem);
        setAssignModalOpen(true);
        setQuestionSearch('');
        setQuestions([]);
        setSelectedQuestion(null);
    };

    const searchQuestions = async (query: string) => {
        setQuestionSearch(query);
        if (query.length < 2) return;

        setLoadingQuestions(true);
        try {
            const { questions: data } = await fetchQuestions({
                search: query,
                limit: 10
            });
            setQuestions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedMedia || !selectedQuestion) return;

        try {
            await updateQuestion(selectedQuestion.id, {
                image_url: selectedMedia.url
            });
            toast.success('Image assigned to question successfully');
            setAssignModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to assign image');
        }
    };

    const filteredMedia = media
        .filter(m => m.filename.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return a.filename.localeCompare(b.filename);
        });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-8 h-8" /> Media Library
                </h1>
            </div>

            {/* Upload Area */}
            <div
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                    isUploading ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-300 dark:border-gray-700 hover:border-indigo-400"
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                        <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                            Drag & drop files here, or click to select
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            JPG, PNG, WebP up to 5MB
                        </p>
                    </div>
                    <input
                        type="file"
                        id="media-upload"
                        className="hidden"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={isUploading}
                    />
                    <label
                        htmlFor="media-upload"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                    >
                        Select Files
                    </label>
                </div>

                {/* Progress Bars */}
                {Object.entries(uploadProgress).length > 0 && (
                    <div className="mt-6 space-y-2 max-w-md mx-auto">
                        {Object.entries(uploadProgress).map(([name, progress]) => (
                            <div key={name} className="text-left">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="truncate max-w-[200px]">{name}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search media..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as 'logo' | 'personality' | 'all')}
                            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="all">All Types</option>
                            <option value="logo">Logos</option>
                            <option value="personality">Personalities</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="date">Newest First</option>
                            <option value="name">Name A-Z</option>
                        </select>
                    </div>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {isLoading && !isUploading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No media found
                        </div>
                    ) : (
                        filteredMedia.map((item) => (
                            <div
                                key={item.id}
                                className="group relative aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border hover:border-indigo-500 transition-colors"
                            >
                                <img
                                    src={item.url}
                                    alt={item.filename}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                    <button
                                        onClick={() => openAssignModal(item)}
                                        className="w-full py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 flex items-center justify-center gap-1"
                                    >
                                        <LinkIcon className="w-3 h-3" /> Assign
                                    </button>
                                    <button
                                        onClick={() => window.open(item.url, '_blank')}
                                        className="w-full py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 flex items-center justify-center gap-1"
                                    >
                                        <ImageIcon className="w-3 h-3" /> View
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        className="w-full py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                    <p className="text-xs text-white truncate">{item.filename.split('/').pop()}</p>
                                    <p className="text-[10px] text-gray-300 uppercase">{item.type}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Assignment Modal */}
            <Modal
                open={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                title="Assign Image to Question"
                className="max-w-2xl"
            >
                <div className="space-y-6">
                    <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                            {selectedMedia && (
                                <img
                                    src={selectedMedia.url}
                                    alt="Selected"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Selected Image</h4>
                            <p className="text-sm text-gray-500 break-all">{selectedMedia?.filename}</p>
                            <p className="text-xs text-gray-400 mt-1 uppercase">{selectedMedia?.type}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Search Question
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by question text..."
                                value={questionSearch}
                                onChange={(e) => searchQuestions(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto border rounded-lg dark:border-gray-700 divide-y dark:divide-gray-700">
                        {loadingQuestions ? (
                            <div className="p-8 text-center">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                {questionSearch ? 'No questions found' : 'Start typing to search questions'}
                            </div>
                        ) : (
                            questions.map((q) => (
                                <div
                                    key={q.id}
                                    onClick={() => setSelectedQuestion(q)}
                                    className={cn(
                                        "p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                                        selectedQuestion?.id === q.id && "bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600"
                                    )}
                                >
                                    <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                        {q.question_text}
                                    </p>
                                    <div className="flex gap-2 mt-1 text-xs text-gray-500">
                                        <span className="uppercase">{q.question_type}</span>
                                        <span>•</span>
                                        <span>{q.category}</span>
                                        {q.image_url && (
                                            <span className="text-amber-600 flex items-center gap-1">
                                                • Has Image
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                        <button
                            onClick={() => setAssignModalOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={!selectedQuestion}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Confirm Assignment
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
