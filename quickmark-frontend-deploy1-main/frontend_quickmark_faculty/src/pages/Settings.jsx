import React, { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const cardColors = [
  'bg-gradient-to-br from-blue-100 to-blue-50',
  'bg-gradient-to-br from-green-100 to-green-50',
  'bg-gradient-to-br from-yellow-100 to-yellow-50',
];

const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await authAPI.getProfile();
        setProfile(data);
      } catch (err) {
        setError('Failed to load profile info.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setPwSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-text-primary mb-2">Settings</h2>
      <p className="text-text-secondary mb-8">Manage your account settings here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info Card */}
        <div className={`rounded-xl shadow-lg p-8 ${cardColors[0]} flex flex-col items-center`}> 
          <h3 className="text-xl font-semibold mb-4 text-blue-900">Profile Information</h3>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : profile ? (
            <>
              <img
                src={profile.photo_url || 'https://placehold.co/80x80/E2E8F0/4A5568?text=U'}
                alt="Profile"
                className="h-20 w-20 rounded-full border mb-4"
                onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/E2E8F0/4A5568?text=U'; }}
              />
              <div className="space-y-1 text-center">
                <div><span className="font-medium">Name:</span> {profile.name}</div>
                <div><span className="font-medium">Designation:</span> {profile.designation || 'N/A'}</div>
                <div><span className="font-medium">Email:</span> {profile.email}</div>
                <div><span className="font-medium">Department:</span> {profile.department_name || 'N/A'}</div>
              </div>
            </>
          ) : null}
        </div>

        {/* Change Password Card */}
        <div className={`rounded-xl shadow-lg p-8 ${cardColors[1]}`}> 
          <h3 className="text-xl font-semibold mb-4 text-green-900">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block font-medium mb-1">Current Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">New Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {pwError && <div className="text-red-500 text-sm">{pwError}</div>}
            {pwSuccess && <div className="text-green-600 text-sm">{pwSuccess}</div>}
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={pwLoading}
            >
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Help & FAQ Card */}
        <div className={`rounded-xl shadow-lg p-8 ${cardColors[2]} md:col-span-2 flex flex-col items-center`}>
          <h3 className="text-xl font-semibold mb-4 text-yellow-900">Help & FAQ</h3>
          <p className="mb-4 text-center text-yellow-800">Need assistance? Visit our Help Center or contact support for more information.</p>
          <a
            href="https://your-university-help-link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-900 underline font-medium hover:text-yellow-700"
          >
            Visit Help Center
          </a>
        </div>
      </div>
    </div>
  );
};

export default Settings;
