// frontend/app/settings/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/api/hooks/useAuth';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, changePassword, logout } = useAuth();
  
  // Profile form state
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Verification state for sensitive changes
  const [verifyPassword, setVerifyPassword] = useState('');
  const [pendingChanges, setPendingChanges] = useState<{
    type: 'profile' | 'email' | 'username';
    data: any;
  } | null>(null);
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // Check if profile has changes
  const hasProfileChanges = () => {
    return (
      firstName !== (user?.first_name || '') ||
      lastName !== (user?.last_name || '') ||
      email !== (user?.email || '') ||
      username !== (user?.username || '')
    );
  };
  
  // Handle profile update with verification
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasProfileChanges()) {
      toast.error('No changes to save');
      return;
    }
    
    // Check if email or username changed (require password verification)
    const emailChanged = email !== (user?.email || '');
    const usernameChanged = username !== (user?.username || '');
    
    if (emailChanged || usernameChanged) {
      // Show password verification modal
      setPendingChanges({
        type: emailChanged ? 'email' : 'username',
        data: { firstName, lastName, email, username }
      });
      return;
    }
    
    // Simple profile update (no password needed)
    await saveProfileChanges();
  };
  
  const saveProfileChanges = async (password?: string) => {
    setLoading(true);
    try {
      const updateData: any = {
        first_name: firstName,
        last_name: lastName,
      };
      
      // Only include email/username if they changed and we have password
      if (email !== (user?.email || '')) {
        updateData.email = email;
        if (password) updateData.password = password;
      }
      
      if (username !== (user?.username || '')) {
        updateData.username = username;
        if (password) updateData.password = password;
      }
      
      await updateProfile(updateData);
      toast.success('Profile updated successfully');
      setPendingChanges(null);
      setVerifyPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Optional: Log out after 3 seconds to force login with new password
      setTimeout(() => {
        toast.success('Please login with your new password');
        logout();
        router.push('/login');
      }, 2000);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark-500">Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserIcon className="inline-block h-5 w-5 mr-2" />
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'password'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <KeyIcon className="inline-block h-5 w-5 mr-2" />
                Change Password
              </button>
            </nav>
          </div>
          
          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input-field"
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input-field"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Enter username"
                    />
                  </div>
                  {username !== user?.username && (
                    <p className="mt-1 text-xs text-amber-600">
                      Changing username will require password verification
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Enter email address"
                    />
                  </div>
                  {email !== user?.email && (
                    <p className="mt-1 text-xs text-amber-600">
                      Changing email will require password verification
                    </p>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading || !hasProfileChanges()}
                    className="btn-primary w-full sm:w-auto px-6"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Password Requirements</p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Cannot be too common or similar to personal info</li>
                        <li>• Cannot be entirely numeric</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                  )}
                  {newPassword && newPassword.length > 0 && newPassword.length < 8 && (
                    <p className="mt-1 text-xs text-red-600">Password must be at least 8 characters</p>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    className="btn-primary w-full sm:w-auto px-6"
                  >
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Danger Zone */}
          <div className="mt-8 bg-red-50 rounded-lg border border-red-200 p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">
              Once you log out, you'll need to log back in to access your account.
            </p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Log Out
            </button>
          </div>
        </div>
        
        {/* Password Verification Modal */}
        {pendingChanges && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center mb-4">
                <ShieldCheckIcon className="h-12 w-12 text-red-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">Verify Your Identity</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Please enter your password to change your {pendingChanges.type === 'email' ? 'email address' : 'username'}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showVerifyPassword ? 'text' : 'password'}
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Enter your password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showVerifyPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPendingChanges(null);
                    setVerifyPassword('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveProfileChanges(verifyPassword)}
                  disabled={!verifyPassword || loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Confirm Changes'}
                </button>
              </div>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                Forgot your password? <button
                  onClick={() => {
                    setPendingChanges(null);
                    router.push('/forgot-password');
                  }}
                  className="text-red-600 hover:underline"
                >
                  Reset it here
                </button>
              </p>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}