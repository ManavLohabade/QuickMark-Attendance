import React, { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { Camera, Lock, User, Mail, Building2, AlertCircle, CheckCircle2, Eye, EyeOff, Circle, AlertTriangle, Loader2 } from 'lucide-react';

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const getColor = () => {
    switch (strength) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getMessage = () => {
    switch (strength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  return (
    <div className="mt-1">
      <div className="flex gap-1 mb-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-1 w-full rounded-full ${i < strength ? getColor() : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs ${getColor().replace('bg-', 'text-')}`}>
        {getMessage()}
      </p>
    </div>
  );
};

const PasswordRequirements = ({ password, className = '' }) => {
    const requirements = [
        { test: /.{8,}/, text: 'At least 8 characters' },
        { test: /[A-Z]/, text: 'One uppercase letter' },
        { test: /[a-z]/, text: 'One lowercase letter' },
        { test: /[0-9]/, text: 'One number' },
        { test: /[!@#$%^&*]/, text: 'One special character (!@#$%^&*)' }
    ];

    return (
        <div className={`space-y-2 ${className}`}>
            <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
            <ul className="space-y-1">
                {requirements.map((req, index) => (
                    <li 
                        key={index}
                        className={`text-sm flex items-center ${
                            req.test.test(password)
                                ? 'text-green-600'
                                : 'text-gray-500'
                        }`}
                    >
                        {req.test.test(password) ? (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                        ) : (
                            <Circle className="w-4 h-4 mr-2" />
                        )}
                        {req.text}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile update state
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    designation: ''
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Password expiry state
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkPasswordStatus();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getProfile();
      setProfile(data);
      setProfileForm({
        name: data.name || '',
        email: data.email || '',
        designation: data.designation || ''
      });
    } catch (err) {
      setError('Failed to load profile info.');
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStatus = async () => {
      try {
          const status = await authAPI.checkPasswordStatus();
          setPasswordStatus(status);
      } catch (error) {
          console.error('Error checking password status:', error);
      }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    setImageError('');
    
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file.');
      return;
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be less than 5MB.');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    setImageError('');

    try {
      const formData = new FormData();
      formData.append('photo', selectedImage);

      const response = await authAPI.uploadProfilePhoto(formData);
      
      // Update profile photo in state
      setProfile(prev => ({ ...prev, photo_url: response.photo_url }));
      
      // Reset states
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      setImageError(error.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authAPI.updateProfile(profileForm);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      fetchProfile(); // Refresh profile data
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    // Basic validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPwError('All password fields are required.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPwError('New password must be different from current password.');
      return;
    }

    setPwLoading(true);
    try {
      const response = await authAPI.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setPwSuccess('Password changed successfully! Next password change required in 90 days.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Update password status
      await checkPasswordStatus();
    } catch (err) {
      if (err.response?.data?.errors) {
        // Handle validation errors
        setPwError(err.response.data.errors.join('\n'));
      } else {
        setPwError(err.message || 'Failed to change password.');
      }
    } finally {
      setPwLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const BACKEND_BASE_URL = 'http://localhost:3700';

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Settings</h2>
      <p className="text-gray-600 mb-8">Manage your account settings and preferences</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </h3>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <img
                src={imagePreview || (profile?.photo_url ? (profile.photo_url.startsWith('http') ? profile.photo_url : `${BACKEND_BASE_URL}${profile.photo_url}`) : 'https://placehold.co/200x200/e5e7eb/a1a1aa?text=Profile')}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handleImageSelect}
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* Upload Controls */}
            {selectedImage && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={isUploading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Uploading...
                    </>
                  ) : (
                    'Save Photo'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    setImageError('');
                  }}
                  disabled={isUploading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Error Message */}
            {imageError && (
              <div className="text-red-600 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {imageError}
              </div>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                disabled={!editMode}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                disabled={!editMode}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Building2 className="w-4 h-4 inline mr-1" />
                Designation
              </label>
              <input
                type="text"
                value={profileForm.designation}
                onChange={(e) => setProfileForm(prev => ({ ...prev, designation: e.target.value }))}
                disabled={!editMode}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {editMode && (
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setProfileForm({
                      name: profile?.name || '',
                      email: profile?.email || '',
                      designation: profile?.designation || ''
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center text-red-600 text-sm mt-2">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center text-green-600 text-sm mt-2">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {success}
              </div>
            )}
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Change Password
          </h3>

          {/* Password Expiry Warning */}
          {passwordStatus?.password_expired && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                  Your password has expired. Please change it to continue using the system.
              </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg pr-10"
                  disabled={pwLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({
                    ...prev,
                    current: !prev.current
                  }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  disabled={pwLoading}
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg pr-10"
                  disabled={pwLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({
                    ...prev,
                    new: !prev.new
                  }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  disabled={pwLoading}
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordRequirements 
                password={passwordForm.newPassword}
                className="mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg pr-10 ${
                    passwordForm.confirmPassword &&
                    passwordForm.newPassword !== passwordForm.confirmPassword
                        ? 'border-red-500'
                        : ''
                  }`}
                  disabled={pwLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({
                    ...prev,
                    confirm: !prev.confirm
                  }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  disabled={pwLoading}
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordForm.confirmPassword &&
                  passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                          Passwords do not match
                      </p>
                  )}
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {pwLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </button>

            {pwError && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                <pre className="whitespace-pre-wrap font-sans">{pwError}</pre>
              </div>
            )}
            {pwSuccess && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {pwSuccess}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
