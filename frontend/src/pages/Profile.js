import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const { user, token } = useAuth();

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    useEffect(() => {
        setProfile(user);
        setFormData(user || {});
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setProfile(updatedUser);
                setEditing(false);
                alert('Profile updated successfully!');
            } else {
                alert('Error updating profile');
            }
        } catch (error) {
            alert('Error updating profile');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSkillsChange = (e) => {
        const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
        setFormData(prev => ({
            ...prev,
            skills
        }));
    };

    const handleExpertiseChange = (e) => {
        const expertise = e.target.value.split(',').map(exp => exp.trim()).filter(exp => exp);
        setFormData(prev => ({
            ...prev,
            expertise
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
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
            <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Profile Information
                                </h3>
                                <button
                                    onClick={() => setEditing(!editing)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    {editing ? 'Cancel' : 'Edit Profile'}
                                </button>
                            </div>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Manage your profile information and preferences.
                            </p>
                        </div>

                        {editing ? (
                            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email || ''}
                                            disabled
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            College
                                        </label>
                                        <input
                                            type="text"
                                            name="college"
                                            value={formData.college || ''}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Role
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.role || ''}
                                            disabled
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Bio
                                        </label>
                                        <textarea
                                            rows={3}
                                            name="bio"
                                            value={formData.bio || ''}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Skills (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.skills?.join(', ') || ''}
                                            onChange={handleSkillsChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    {formData.role === 'mentor' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Expertise (comma-separated)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.expertise?.join(', ') || ''}
                                                    onChange={handleExpertiseChange}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Years of Experience
                                                </label>
                                                <input
                                                    type="number"
                                                    name="years_experience"
                                                    value={formData.years_experience || ''}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(false)}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="px-4 py-5 sm:p-6">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{profile?.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{profile?.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Role</dt>
                                        <dd className="mt-1 text-sm text-gray-900 capitalize">{profile?.role}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">College</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{profile?.college || 'Not specified'}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Bio</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{profile?.bio || 'No bio available'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Skills</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {profile?.skills?.length > 0 ? profile.skills.join(', ') : 'No skills listed'}
                                        </dd>
                                    </div>
                                    {profile?.role === 'mentor' && (
                                        <>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Expertise</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {profile?.expertise?.length > 0 ? profile.expertise.join(', ') : 'No expertise listed'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Years of Experience</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{profile?.years_experience || 'Not specified'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Rating</dt>
                                                <dd className="mt-1 text-sm text-gray-900">⭐ {profile?.rating || 'No rating yet'}</dd>
                                            </div>
                                        </>
                                    )}
                                </dl>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
