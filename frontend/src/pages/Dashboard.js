import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Mentor Bridge</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {user?.role}
                            </span>
                            <button
                                onClick={logout}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Quick Actions */}
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
                                                Find Mentors
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                <Link to="/mentors" className="text-blue-600 hover:text-blue-500">
                                                    Browse Directory
                                                </Link>
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
                                            <span className="text-white text-sm font-medium">📅</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Sessions
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                <Link to="/sessions" className="text-blue-600 hover:text-blue-500">
                                                    Manage Sessions
                                                </Link>
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
                                            <span className="text-white text-sm font-medium">💬</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Messages
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                <Link to="/messages" className="text-blue-600 hover:text-blue-500">
                                                    View Messages
                                                </Link>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="mt-8 bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Profile Information
                            </h3>
                            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">{user?.name}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">{user?.email}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Role
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</div>
                                </div>
                                {user?.college && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            College
                                        </label>
                                        <div className="mt-1 text-sm text-gray-900">{user?.college}</div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-5">
                                <Link
                                    to="/profile"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Edit Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
