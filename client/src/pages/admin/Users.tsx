import { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { User, ActivityLog, QuizAttempt } from '../../types';
import { Modal } from '../../components/ui/Modal';
import {
    Search, Download, Shield, ShieldOff,
    Eye, UserX, UserCheck, Loader2, ChevronLeft, ChevronRight,
    Clock, Calendar, ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface UserActivity {
    logins: ActivityLog[];
    attempts: QuizAttempt[];
    activity: ActivityLog[];
}

export function Users() {
    const { fetchUsers, fetchUserActivity, toggleUserStatus, isLoading } = useAdmin();
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    // Filters
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [district, setDistrict] = useState('');
    const [role, setRole] = useState<'user' | 'admin' | ''>('');
    const [status, setStatus] = useState<'active' | 'disabled' | ''>('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Selection & Modal
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
    const [loadingActivity, setLoadingActivity] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const loadUsers = async () => {
        try {
            const offset = (page - 1) * limit;
            const { users: data, total: count } = await fetchUsers({
                search,
                category: category || undefined,
                district: district || undefined,
                role: role || undefined,
                status: status || undefined,
                limit,
                offset,
                sortBy,
                sortOrder
            });
            setUsers(data);
            setTotal(count);
        } catch (error) {
            toast.error('Failed to load users');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [page, search, category, district, role, status, sortBy, sortOrder]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleViewUser = async (user: User) => {
        setSelectedUser(user);
        setLoadingActivity(true);
        try {
            const activity = await fetchUserActivity(user.id);
            setUserActivity(activity);
        } catch (error) {
            toast.error('Failed to load user activity');
        } finally {
            setLoadingActivity(false);
        }
    };

    const handleToggleStatus = async (user: User) => {
        try {
            await toggleUserStatus(user.id, !user.disabled);
            toast.success(`User ${user.disabled ? 'enabled' : 'disabled'} successfully`);
            loadUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleBulkToggle = async (disable: boolean) => {
        if (selectedIds.size === 0) return;
        try {
            await Promise.all(
                Array.from(selectedIds).map(id => toggleUserStatus(id, disable))
            );
            toast.success(`${selectedIds.size} users ${disable ? 'disabled' : 'enabled'}`);
            setSelectedIds(new Set());
            loadUsers();
        } catch (error) {
            toast.error('Failed to update users');
        }
    };

    const handleExport = () => {
        const headers = ['Name', 'Email', 'Phone', 'Category', 'Institution', 'District', 'Role', 'Status', 'Joined'];
        const csvContent = [
            headers.join(','),
            ...users.map(u => [
                `"${u.name}"`,
                u.email || '',
                u.phone || '',
                u.category || '',
                `"${u.institution || ''}"`,
                u.district || '',
                u.role,
                u.disabled ? 'Disabled' : 'Active',
                new Date(u.created_at).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const selectAll = () => {
        if (selectedIds.size === users.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(users.map(u => u.id)));
    };

    const SortableHeader = ({ field, label }: { field: string, label: string }) => (
        <th
            className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-1">
                {label}
                {sortBy === field ? (
                    sortOrder === 'asc' ? <ChevronLeft className="w-4 h-4 rotate-90" /> : <ChevronLeft className="w-4 h-4 -rotate-90" />
                ) : (
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                )}
            </div>
        </th>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                <div className="flex gap-2">
                    {selectedIds.size > 0 && (
                        <>
                            <button
                                onClick={() => handleBulkToggle(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            >
                                <UserX className="w-4 h-4" /> Disable Selected
                            </button>
                            <button
                                onClick={() => handleBulkToggle(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                            >
                                <UserCheck className="w-4 h-4" /> Enable Selected
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Download className="w-4 h-4" /> Export CSV
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
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by District"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">All Categories</option>
                        <option value="student">Student</option>
                        <option value="professional">Professional</option>
                        <option value="educator">Educator</option>
                    </select>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'user' | 'admin' | '')}
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'active' | 'disabled' | '')}
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>
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
                                        checked={selectedIds.size === users.length && users.length > 0}
                                        onChange={selectAll}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <SortableHeader field="name" label="Name" />
                                <SortableHeader field="email" label="Contact" />
                                <SortableHeader field="category" label="Category" />
                                <SortableHeader field="institution" label="Institution" />
                                <SortableHeader field="district" label="District" />
                                <SortableHeader field="role" label="Role" />
                                <SortableHeader field="disabled" label="Status" />
                                <SortableHeader field="created_at" label="Joined" />
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(user.id)}
                                                onChange={() => toggleSelection(user.id)}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            {user.name}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            <div className="flex flex-col">
                                                <span>{user.email}</span>
                                                <span className="text-xs">{user.phone}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 capitalize">{user.category}</td>
                                        <td className="p-4">{user.institution}</td>
                                        <td className="p-4">{user.district}</td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                user.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                                            )}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                user.disabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                            )}>
                                                {user.disabled ? 'Disabled' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="p-1 text-gray-500 hover:text-indigo-600"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={cn(
                                                        "p-1",
                                                        user.disabled ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"
                                                    )}
                                                    title={user.disabled ? "Enable User" : "Disable User"}
                                                >
                                                    {user.disabled ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
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
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} users
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

            {/* User Details Modal */}
            <Modal
                open={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title="User Details"
                className="max-w-4xl"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        {/* Profile Header */}
                        <div className="flex items-start justify-between pb-6 border-b dark:border-gray-700">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h2>
                                <p className="text-gray-500">{selectedUser.email} • {selectedUser.phone}</p>
                                <div className="mt-2 flex gap-2">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                                        {selectedUser.institution || 'No Institution'}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm capitalize">
                                        {selectedUser.category}
                                    </span>
                                    {selectedUser.district && (
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                                            {selectedUser.district}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Joined</p>
                                <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {loadingActivity ? (
                            <div className="py-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                            </div>
                        ) : userActivity ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Recent Logins */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Recent Logins
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                                        {userActivity.logins.length === 0 ? (
                                            <p className="text-sm text-gray-500">No recent logins</p>
                                        ) : (
                                            userActivity.logins.map((login) => (
                                                <div key={login.id} className="flex justify-between text-sm">
                                                    <span>{new Date(login.created_at).toLocaleString()}</span>
                                                    <span className="text-gray-500">{login.ip_address || 'Unknown IP'}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Quiz History */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Recent Quizzes
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                                        {userActivity.attempts.length === 0 ? (
                                            <p className="text-sm text-gray-500">No quiz attempts</p>
                                        ) : (
                                            userActivity.attempts.map((attempt) => (
                                                <div key={attempt.id} className="flex justify-between text-sm border-b dark:border-gray-600 last:border-0 pb-2 last:pb-0">
                                                    <div>
                                                        <p className="font-medium">Score: {attempt.score || 0}</p>
                                                        <p className="text-xs text-gray-500">{new Date(attempt.started_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-xs h-fit",
                                                        attempt.status === 'completed' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                    )}>
                                                        {attempt.status}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </Modal>
        </div>
    );
}
