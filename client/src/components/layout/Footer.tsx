export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-50 border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">AI Quiz Application</h3>
                        <p className="text-gray-600 text-sm">
                            An intelligent quiz platform powered by AI for enhanced learning and assessment.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/about" className="text-gray-600 hover:text-primary-600 text-sm">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="/help" className="text-gray-600 hover:text-primary-600 text-sm">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="/privacy" className="text-gray-600 hover:text-primary-600 text-sm">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="/terms" className="text-gray-600 hover:text-primary-600 text-sm">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>Email: support@aiquiz.com</li>
                            <li>Phone: +1 (555) 123-4567</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
                    <p>&copy; {currentYear} AI Quiz Application. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
