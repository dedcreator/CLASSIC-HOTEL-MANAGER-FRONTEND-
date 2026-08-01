// frontend/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  CameraIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  HomeIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/api/hooks/useAuth';
import { useSales } from '@/lib/api/hooks/useSales';
import { useBookings } from '@/lib/api/hooks/useBookings';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    phone: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  // Stats
  const { data: sales } = useSales({});
  const { data: bookings } = useBookings({});
  const [stats, setStats] = useState({
    totalSales: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
  });

  // Check if user is CEO/Admin
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'CEO';
  const isManager = user?.role === 'MANAGER';

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    // Calculate stats from sales and bookings
    if (sales) {
      const totalRevenue = sales.reduce((sum: number, sale: any) => sum + (sale.total_amount || 0), 0);
      setStats(prev => ({
        ...prev,
        totalSales: sales.length,
        totalRevenue: totalRevenue,
      }));
    }
    if (bookings) {
      const activeBookings = bookings.filter((b: any) => b.status === 'checked_in').length;
      setStats(prev => ({
        ...prev,
        totalBookings: bookings.length,
        activeBookings: activeBookings,
      }));
    }
  }, [sales, bookings]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Only send fields that are allowed for the user's role
      const updateData: any = {};
      
      // Everyone can update these fields
      updateData.first_name = formData.first_name;
      updateData.last_name = formData.last_name;
      updateData.phone = formData.phone;
      
      // Only Admin/CEO can update email and username
      if (isAdmin) {
        updateData.email = formData.email;
        updateData.username = formData.username;
      }
      
      await updateProfile(updateData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setIsChangingPassword(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      ADMIN: 'bg-[#C62828] text-white',
      CEO: 'bg-[#C62828] text-white',
      BAR_STAFF: 'bg-[#C9A468] text-[#F7F1E4]',
      RECEPTIONIST: 'bg-[#16302B] text-[#F7F1E4]',
      MANAGER: 'bg-[#2E7D32] text-white',
      STAFF: 'bg-[#5B564B] text-[#F7F1E4]',
    };
    
    const roleLabels: Record<string, string> = {
      ADMIN: 'Administrator',
      CEO: 'CEO',
      BAR_STAFF: 'Bar Staff',
      RECEPTIONIST: 'Receptionist',
      MANAGER: 'Manager',
      STAFF: 'Staff',
    };

    return (
      <span className={`font-body px-3 py-1 rounded-full text-xs font-medium ${roleColors[role] || 'bg-gray-500 text-white'}`}>
        {roleLabels[role] || role}
      </span>
    );
  };

  // Get editable fields based on role
  const getEditableFields = () => {
    const fields = [
      { key: 'first_name', label: 'First Name', required: true, editable: true },
      { key: 'last_name', label: 'Last Name', required: true, editable: true },
      { key: 'phone', label: 'Phone Number', required: false, editable: true },
    ];
    
    // Admin/CEO can edit email and username
    if (isAdmin) {
      fields.push(
        { key: 'email', label: 'Email', required: true, editable: true },
        { key: 'username', label: 'Username', required: true, editable: true }
      );
    }
    
    return fields;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF6EF]">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 bg-white border border-[#DDD5C4] rounded-lg hover:bg-[#F7F1E4] transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-[#2A2622]" />
              </button>
              <div>
                <h1 className="font-display text-2xl font-medium text-[#2A2622]">Profile</h1>
                <p className="font-body text-sm text-[#8A8377]">Manage your account settings</p>
              </div>
            </div>
            {!isEditing && !isChangingPassword && (
              <button
                onClick={() => setIsEditing(true)}
                className="font-body inline-flex items-center gap-2 px-4 py-2 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377]">Total Sales</p>
              <p className="font-display text-2xl font-medium text-[#2A2622]">{stats.totalSales}</p>
            </div>
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377]">Total Bookings</p>
              <p className="font-display text-2xl font-medium text-[#2A2622]">{stats.totalBookings}</p>
            </div>
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377]">Active Bookings</p>
              <p className="font-display text-2xl font-medium text-[#16302B]">{stats.activeBookings}</p>
            </div>
            <div className="bg-white border border-[#DDD5C4] rounded-xl p-4">
              <p className="font-body text-sm text-[#8A8377]">Total Revenue</p>
              <p className="font-display text-2xl font-medium text-[#C9A468]">₦{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white border border-[#DDD5C4] rounded-xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#16302B] to-[#1D3B34] px-6 py-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#C9A468] flex items-center justify-center text-3xl font-display text-[#F7F1E4]">
                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                  </div>
                  {isAdmin && (
                    <button className="absolute bottom-0 right-0 p-1.5 bg-[#F7F1E4] rounded-full border-2 border-[#16302B] hover:bg-[#DDD5C4] transition-colors">
                      <CameraIcon className="h-3.5 w-3.5 text-[#16302B]" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-medium text-[#F7F1E4]">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    {isAdmin && (
                      <ShieldCheckIcon className="h-5 w-5 text-[#C9A468]" title="Administrator" />
                    )}
                  </div>
                  <p className="font-body text-sm text-[#B9C4B9]">@{user?.username}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {user?.role && getRoleBadge(user.role)}
                    {isAdmin && (
                      <span className="font-body text-xs text-[#C9A468]">(Full Access)</span>
                    )}
                    {!isAdmin && (
                      <span className="font-body text-xs text-[#B9C4B9]">(Limited Access)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              {isEditing ? (
                // Edit Profile Form
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getEditableFields().map((field) => (
                      <div key={field.key} className={field.key === 'phone' ? 'md:col-span-2' : ''}>
                        <label className="font-body text-sm font-medium text-[#5B564B] block mb-1">
                          {field.label} {field.required && <span className="text-[#C62828]">*</span>}
                          {!field.editable && <span className="text-[#8A8377] text-xs ml-1">(read-only)</span>}
                        </label>
                        <input
                          type={field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : 'text'}
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className={`font-body w-full px-4 py-2 border rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] ${
                            !field.editable ? 'border-[#DDD5C4] opacity-70 cursor-not-allowed' : 'border-[#DDD5C4]'
                          }`}
                          required={field.required}
                          disabled={!field.editable}
                          readOnly={!field.editable}
                        />
                        {!field.editable && (
                          <p className="font-body text-xs text-[#8A8377] mt-1">
                            Contact admin to change this field
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Info banner for non-admin users */}
                  {!isAdmin && (
                    <div className="bg-[#DBEAFE] rounded-lg p-3 border border-[#93C5FD]">
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-5 w-5 text-[#1E40AF]" />
                        <div>
                          <p className="font-body text-sm font-medium text-[#1E40AF]">
                            Limited Profile Editing
                          </p>
                          <p className="font-body text-xs text-[#1E40AF]">
                            You can only update your first name, last name, and phone number. 
                            Contact an administrator to change your email or username.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          first_name: user?.first_name || '',
                          last_name: user?.last_name || '',
                          email: user?.email || '',
                          username: user?.username || '',
                          phone: user?.phone || '',
                        });
                      }}
                      className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#5B564B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#16302B] rounded-lg hover:bg-[#1D3B34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : isChangingPassword ? (
                // Change Password Form
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="font-body text-sm font-medium text-[#5B564B] block mb-1">
                      Current Password <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm font-medium text-[#5B564B] block mb-1">
                      New Password <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                      required
                      minLength={8}
                    />
                    <p className="font-body text-xs text-[#8A8377] mt-1">Minimum 8 characters</p>
                  </div>
                  <div>
                    <label className="font-body text-sm font-medium text-[#5B564B] block mb-1">
                      Confirm New Password <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          current_password: '',
                          new_password: '',
                          confirm_password: '',
                        });
                      }}
                      className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#5B564B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#16302B] rounded-lg hover:bg-[#1D3B34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <KeyIcon className="h-5 w-5" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // Display Profile
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-5 w-5 text-[#8A8377] mt-0.5" />
                      <div>
                        <p className="font-body text-xs text-[#8A8377] uppercase tracking-wider">Full Name</p>
                        <p className="font-body text-[#2A2622]">{user?.first_name} {user?.last_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-[#8A8377] mt-0.5" />
                      <div>
                        <p className="font-body text-xs text-[#8A8377] uppercase tracking-wider">Email</p>
                        <p className="font-body text-[#2A2622]">{user?.email}</p>
                        {!isAdmin && (
                          <p className="font-body text-xs text-[#8A8377]">Contact admin to change</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <PhoneIcon className="h-5 w-5 text-[#8A8377] mt-0.5" />
                      <div>
                        <p className="font-body text-xs text-[#8A8377] uppercase tracking-wider">Phone</p>
                        <p className="font-body text-[#2A2622]">{user?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BuildingOfficeIcon className="h-5 w-5 text-[#8A8377] mt-0.5" />
                      <div>
                        <p className="font-body text-xs text-[#8A8377] uppercase tracking-wider">Role</p>
                        <p className="font-body text-[#2A2622]">{user?.role}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-5 w-5 text-[#8A8377] mt-0.5" />
                      <div>
                        <p className="font-body text-xs text-[#8A8377] uppercase tracking-wider">Joined</p>
                        <p className="font-body text-[#2A2622]">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-5 w-5 text-[#8A8377] mt-0.5" />
                      <div>
                        <p className="font-body text-xs text-[#8A8377] uppercase tracking-wider">Last Updated</p>
                        <p className="font-body text-[#2A2622]">
                          {user?.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#DDD5C4] flex flex-wrap gap-4">
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="font-body inline-flex items-center gap-2 text-[#16302B] hover:text-[#1D3B34] transition-colors"
                    >
                      <KeyIcon className="h-5 w-5" />
                      Change Password
                    </button>
                    
                    {isAdmin && (
                      <button
                        onClick={() => router.push('/admin/users')}
                        className="font-body inline-flex items-center gap-2 text-[#C9A468] hover:text-[#B8924F] transition-colors"
                      >
                        <ShieldCheckIcon className="h-5 w-5" />
                        Manage Users
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-[#DDD5C4] rounded-xl overflow-hidden">
            <div className="bg-[#F7F1E4] px-6 py-4 border-b border-[#DDD5C4]">
              <h3 className="font-display font-medium text-[#2A2622]">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {sales && sales.slice(0, 5).map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between border-b border-[#F7F1E4] pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F7F1E4] rounded-lg flex items-center justify-center">
                        <ShoppingBagIcon className="h-5 w-5 text-[#C9A468]" />
                      </div>
                      <div>
                        <p className="font-body font-medium text-[#2A2622]">Sale #{sale.transaction_number || sale.id.slice(0, 8)}</p>
                        <p className="font-body text-sm text-[#8A8377]">
                          {new Date(sale.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-medium text-[#16302B]">₦{sale.total_amount?.toLocaleString()}</p>
                      <p className="font-body text-xs text-[#8A8377] capitalize">{sale.payment_method}</p>
                    </div>
                  </div>
                ))}
                {(!sales || sales.length === 0) && (
                  <p className="font-body text-[#8A8377] text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Permissions Info */}
          <div className="bg-white border border-[#DDD5C4] rounded-xl overflow-hidden">
            <div className="bg-[#F7F1E4] px-6 py-4 border-b border-[#DDD5C4]">
              <h3 className="font-display font-medium text-[#2A2622]">Account Permissions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[#F7F1E4]">
                  <div>
                    <p className="font-body font-medium text-[#2A2622]">Edit Profile</p>
                    <p className="font-body text-sm text-[#8A8377]">Update your personal information</p>
                  </div>
                  <span className={`font-body text-sm font-medium ${isAdmin ? 'text-[#2E7D32]' : 'text-[#C9A468]'}`}>
                    {isAdmin ? 'Full Access' : 'Limited (Name & Phone only)'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F7F1E4]">
                  <div>
                    <p className="font-body font-medium text-[#2A2622]">Change Password</p>
                    <p className="font-body text-sm text-[#8A8377]">Update your account password</p>
                  </div>
                  <span className="font-body text-sm font-medium text-[#2E7D32]">Available</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F7F1E4]">
                  <div>
                    <p className="font-body font-medium text-[#2A2622]">View Sales</p>
                    <p className="font-body text-sm text-[#8A8377]">Access sales history and reports</p>
                  </div>
                  <span className="font-body text-sm font-medium text-[#2E7D32]">Available</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-body font-medium text-[#2A2622]">Manage Users</p>
                    <p className="font-body text-sm text-[#8A8377]">Create and manage user accounts</p>
                  </div>
                  <span className={`font-body text-sm font-medium ${isAdmin ? 'text-[#2E7D32]' : 'text-[#8A8377]'}`}>
                    {isAdmin ? 'Available' : 'Restricted'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}