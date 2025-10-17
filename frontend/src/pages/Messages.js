import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const { user, token } = useAuth();

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    to_user_id: selectedUser,
                    content: newMessage,
                }),
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages();
            } else {
                alert('Error sending message');
            }
        } catch (error) {
            alert('Error sending message');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
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
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Send a Message</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        To User ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter user ID"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={selectedUser || ''}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Type your message..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={sendMessage}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="mt-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Message History</h2>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading messages...</p>
                            </div>
                        ) : (
                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul className="divide-y divide-gray-200">
                                    {messages.length === 0 ? (
                                        <li className="px-6 py-4 text-center text-gray-500">
                                            No messages found
                                        </li>
                                    ) : (
                                        messages.map((message) => (
                                            <li key={message.id} className="px-6 py-4">
                                                <div className={`flex ${message.from_user_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.from_user_id === user.id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-900'
                                                        }`}>
                                                        <p className="text-sm">{message.content}</p>
                                                        <p className={`text-xs mt-1 ${message.from_user_id === user.id ? 'text-blue-100' : 'text-gray-500'
                                                            }`}>
                                                            {message.from_user_name} • {new Date(message.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
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
        </div>
    );
};

export default Messages;
