import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/analytics/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                                Back to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Platform Statistics</h2>
                        <p className="mt-2 text-gray-600">Overview of the Mentor Bridge platform</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading statistics...</p>
                        </div>
                    ) : stats ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">👥</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Total Users
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {stats.total_users}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">🎓</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Students
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {stats.total_students}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">👨‍🏫</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Mentors
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {stats.total_mentors}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">📅</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Total Sessions
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {stats.total_sessions}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Unable to load statistics</p>
                        </div>
                    )}

                    {/* Additional Admin Actions */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                                    View All Users
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                                    Manage Sessions
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                                    System Settings
                                </button>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Health</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Database</span>
                                    <span className="text-sm text-green-600">✓ Connected</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">API</span>
                                    <span className="text-sm text-green-600">✓ Running</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Frontend</span>
                                    <span className="text-sm text-green-600">✓ Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
