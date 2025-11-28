import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">Q</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">AI Quiz</span>
                    </Link>

                    {/* Navigation */}
                    {isAuthenticated && (
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link
                                to="/dashboard"
                                className="text-gray-700 hover:text-primary-600 transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/take-quiz"
                                className="text-gray-700 hover:text-primary-600 transition-colors"
                            >
                                Take Quiz
                            </Link>
                            <Link
                                to="/history"
                                className="text-gray-700 hover:text-primary-600 transition-colors"
                            >
                                History
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    Admin
                                </Link>
                            )}
                        </nav>
                    )}

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                                >
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                        <span className="text-primary-600 font-medium text-sm">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden md:block">{user?.name}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
