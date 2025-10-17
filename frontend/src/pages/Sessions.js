import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth();

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/sessions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSessions(data);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSessionStatus = async (sessionId, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                fetchSessions(); // Refresh the list
            } else {
                alert('Error updating session status');
            }
        } catch (error) {
            alert('Error updating session status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Sessions</h1>
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
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading sessions...</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {sessions.length === 0 ? (
                                    <li className="px-6 py-4 text-center text-gray-500">
                                        No sessions found
                                    </li>
                                ) : (
                                    sessions.map((session) => (
                                        <li key={session.id} className="px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {user.role === 'student' ? session.mentor_name : session.student_name}
                                                        </p>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                                                            {session.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {session.date} at {session.time}
                                                    </p>
                                                    {session.notes && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Notes: {session.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                {user.role === 'mentor' && session.status === 'pending' && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => updateSessionStatus(session.id, 'confirmed')}
                                                            className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => updateSessionStatus(session.id, 'cancelled')}
                                                            className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                                {session.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => updateSessionStatus(session.id, 'completed')}
                                                        className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sessions;
