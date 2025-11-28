import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { Menu } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

import { OfflineIndicator } from '../ui/OfflineIndicator';

export function Layout({ children }: LayoutProps) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Define public routes where we want the standard header/footer
    const isPublicRoute = ['/login', '/signup', '/'].includes(location.pathname);
    const showSidebar = isAuthenticated && !isPublicRoute;

    if (showSidebar) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <OfflineIndicator />
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="font-bold text-lg text-gray-900">AI Quiz</span>
                        <div className="w-6" /> {/* Spacer for centering */}
                    </div>

                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <OfflineIndicator />
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
