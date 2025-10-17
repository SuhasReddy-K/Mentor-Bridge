import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MentorDirectory = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expertiseFilter, setExpertiseFilter] = useState('');
    const { token } = useAuth();

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchMentors();
    }, [searchTerm, expertiseFilter]);

    const fetchMentors = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (expertiseFilter) params.append('expertise', expertiseFilter);

            const response = await fetch(`${API_BASE_URL}/api/mentors?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMentors(data);
            }
        } catch (error) {
            console.error('Error fetching mentors:', error);
        } finally {
            setLoading(false);
        }
    };

    const bookSession = async (mentorId) => {
        const date = prompt('Enter session date (YYYY-MM-DD):');
        const time = prompt('Enter session time (HH:MM):');
        const notes = prompt('Enter session notes (optional):');

        if (!date || !time) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    mentor_id: mentorId,
                    date,
                    time,
                    notes: notes || null,
                }),
            });

            if (response.ok) {
                alert('Session booked successfully!');
            } else {
                const error = await response.json();
                alert(`Error: ${error.detail}`);
            }
        } catch (error) {
            alert('Error booking session');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Mentor Directory</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                                Back to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Filters */}
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search Mentors
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search by name or expertise..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Filter by Expertise
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={expertiseFilter}
                                    onChange={(e) => setExpertiseFilter(e.target.value)}
                                >
                                    <option value="">All Expertise</option>
                                    <option value="AI">AI</option>
                                    <option value="ML">ML</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Strategy">Strategy</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Cloud">Cloud</option>
                                    <option value="Software Engineering">Software Engineering</option>
                                    <option value="Cybersecurity">Cybersecurity</option>
                                    <option value="Full Stack Dev">Full Stack Dev</option>
                                    <option value="Web Technologies">Web Technologies</option>
                                    <option value="Databases">Databases</option>
                                    <option value="Embedded Systems">Embedded Systems</option>
                                    <option value="Project Management">Project Management</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Mentors Grid */}
                    <div className="mt-8">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading mentors...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mentors.map((mentor) => (
                                    <div key={mentor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-center mb-4">
                                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {mentor.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                                                    <p className="text-sm text-gray-600">{mentor.college}</p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm text-gray-700 mb-2">{mentor.bio}</p>
                                                <div className="flex items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                                                    <span className="ml-2 text-sm text-yellow-600">⭐ {mentor.rating}</span>
                                                </div>
                                                <div className="flex items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Experience:</span>
                                                    <span className="ml-2 text-sm text-gray-600">{mentor.years_experience} years</span>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <span className="text-sm font-medium text-gray-700">Expertise:</span>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {mentor.expertise?.map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => bookSession(mentor.id)}
                                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >
                                                Book Session
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDirectory;
