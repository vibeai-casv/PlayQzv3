import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { ActivityLog } from '../../types';
import { Loader2, Search, Filter, Download, Eye, User as UserIcon, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';
import { supabase } from '../../lib/supabase';

export function ActivityLogs() {
    const { fetchActivityLogs, isLoading } = useAdmin();
    const [logs, setLogs] = useState<(ActivityLog & { profiles: { name: string; email: string } | null })[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;

    // Filters
    const [search, setSearch] = useState('');
    const [type, setType] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Modal
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

    const loadLogs = useCallback(async () => {
        try {
            const offset = (page - 1) * limit;
            const { logs: data, total: count } = await fetchActivityLogs({
                search,
                type: type || undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                limit,
                offset
            });
            setLogs(data);
            setTotal(count);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load activity logs');
        }
    }, [fetchActivityLogs, page, search, type, startDate, endDate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadLogs();
        }, 300);
        return () => clearTimeout(timer);
    }, [loadLogs]);

    // Real-time updates
    useEffect(() => {
        const channel = supabase
            .channel('activity-logs-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activity_logs'
                },
                () => {
                    // Only reload if on first page and no complex filters to avoid disrupting view
                    if (page === 1 && !search && !type && !startDate && !endDate) {
                        loadLogs();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadLogs, page, search, type, startDate, endDate]);

    const handleExport = () => {
        const headers = ['Timestamp', 'User', 'Email', 'Activity Type', 'Description', 'IP Address', 'Metadata'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                new Date(log.created_at).toLocaleString(),
                log.profiles?.name || 'Unknown',
                log.profiles?.email || 'N/A',
                log.activity_type,
                `"${log.description.replace(/"/g, '""')}"`,
                log.ip_address || 'N/A',
                `"${JSON.stringify(log.metadata || {}).replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `activity_logs_${new Date().toISOString()}.csv`;
        link.click();
    };

    const activityTypes = [
        'login', 'logout', 'signup', 'profile_updated',
        'quiz_started', 'quiz_completed', 'quiz_abandoned',
        'password_changed', 'email_changed',
        'account_disabled', 'account_enabled',
        'question_created', 'question_updated', 'media_uploaded',
        'achievement_earned', 'settings_changed'
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-8 h-8" /> Activity Logs
                </h1>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 appearance-none"
                        >
                            <option value="">All Activities</option>
                            {activityTypes.map(t => (
                                <option key={t} value={t}>{t.replace(/_/g, ' ').toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Start Date"
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            placeholder="End Date"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Activity</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IP Address</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No activity logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <UserIcon className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {log.profiles?.name || 'Unknown User'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {log.profiles?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cn(
                                                "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                log.activity_type.includes('error') || log.activity_type.includes('failed') ? "bg-red-100 text-red-800" :
                                                    log.activity_type.includes('login') ? "bg-green-100 text-green-800" :
                                                        log.activity_type.includes('quiz') ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                            )}>
                                                {log.activity_type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={log.description}>
                                            {log.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {log.ip_address || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page * limit >= total}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            <Modal
                open={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title="Activity Details"
                className="max-w-2xl"
            >
                {selectedLog && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">User</label>
                                <p className="text-sm font-medium">{selectedLog.profiles?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{selectedLog.profiles?.email}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Timestamp</label>
                                <p className="text-sm">{new Date(selectedLog.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Activity Type</label>
                                <p className="text-sm capitalize">{selectedLog.activity_type.replace(/_/g, ' ')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">IP Address</label>
                                <p className="text-sm">{selectedLog.ip_address || 'N/A'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                            <p className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mt-1">
                                {selectedLog.description}
                            </p>
                        </div>

                        {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Metadata</label>
                                <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mt-1 overflow-x-auto">
                                    {JSON.stringify(selectedLog.metadata, null, 2)}
                                </pre>
                            </div>
                        )}

                        {selectedLog.error_message && (
                            <div>
                                <label className="text-xs font-medium text-red-500 uppercase">Error</label>
                                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-1">
                                    {selectedLog.error_message}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
