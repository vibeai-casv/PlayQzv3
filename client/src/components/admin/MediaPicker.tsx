import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { MediaFile } from '../../types';
import { Loader2, Upload, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface MediaPickerProps {
    onSelect: (url: string) => void;
    onCancel: () => void;
}

export function MediaPicker({ onSelect, onCancel }: MediaPickerProps) {
    const { fetchMedia, uploadMedia, deleteMedia, isLoading } = useAdmin();
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [type, setType] = useState<'logo' | 'personality' | 'all'>('all');

    const loadMedia = async () => {
        try {
            const { media: data } = await fetchMedia({
                type: type === 'all' ? undefined : type
            });
            setMedia(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load media');
        }
    };

    useEffect(() => {
        loadMedia();
    }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Determine type based on current filter or default to logo
            const uploadType = type === 'all' ? 'logo' : type;
            await uploadMedia(file, uploadType);
            toast.success('File uploaded successfully');
            loadMedia();
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload file');
        } finally {
            setUploading(false);
        }
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

    const filteredMedia = media.filter(m =>
        m.filename.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search media..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'logo' | 'personality' | 'all')}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="all">All Types</option>
                    <option value="logo">Logos</option>
                    <option value="personality">Personalities</option>
                </select>
                <div className="relative">
                    <input
                        type="file"
                        id="modal-file-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <label
                        htmlFor="modal-file-upload"
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer",
                            uploading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-1">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : filteredMedia.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                        No media found
                    </div>
                ) : (
                    filteredMedia.map((item) => (
                        <div
                            key={item.id}
                            className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border hover:border-indigo-500 cursor-pointer"
                            onClick={() => onSelect(item.url)}
                        >
                            <img
                                src={item.url}
                                alt={item.filename}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <span className="text-white font-medium bg-indigo-600 px-3 py-1 rounded-full text-sm">Select</span>
                                <button
                                    onClick={(e) => handleDelete(e, item.id)}
                                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                    title="Delete image"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white truncate">
                                {item.filename}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
