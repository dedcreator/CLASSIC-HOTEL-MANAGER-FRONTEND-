// frontend/app/staff/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { useCreateStaff } from '@/lib/api/hooks/useStaff';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

export default function NewStaffPage() {
  const router = useRouter();
  const createStaff = useCreateStaff();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'RECEPTIONIST',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roles = [
    { value: 'CEO', label: 'CEO', icon: ShieldCheckIcon, bgColor: 'bg-[#FEF2F2]', textColor: 'text-[#991B1B]' },
    { value: 'MANAGER', label: 'Manager', icon: UserIcon, bgColor: 'bg-[#DBEAFE]', textColor: 'text-[#1E40AF]' },
    { value: 'RECEPTIONIST', label: 'Receptionist', icon: UserIcon, bgColor: 'bg-[#D1FAE5]', textColor: 'text-[#065F46]' },
    { value: 'BAR_STAFF', label: 'Bar Staff', icon: UserIcon, bgColor: 'bg-[#FEF3C7]', textColor: 'text-[#92400E]' },
    { value: 'HOUSEKEEPING', label: 'Housekeeping', icon: UserIcon, bgColor: 'bg-[#FCE4EC]', textColor: 'text-[#831843]' },
    { value: 'ADMIN', label: 'Admin', icon: ShieldCheckIcon, bgColor: 'bg-[#F3E8FF]', textColor: 'text-[#6B21A5]' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      setErrors({ password2: 'Passwords do not match' });
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.username) {
      toast.error('Username is required');
      return;
    }

    if (!formData.email) {
      toast.error('Email is required');
      return;
    }

    try {
      console.log('Submitting form data:', formData);
      await createStaff.mutateAsync(formData);
      router.push('/staff');
    } catch (error: any) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 border-b border-[#DDD5C4] pb-6">
          <Link
            href="/staff"
            className="font-body inline-flex items-center text-[#8A8377] hover:text-[#16302B] mb-4 transition-colors group"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Staff
          </Link>

          <div>
            <h1 className="font-display text-2xl font-medium text-[#2A2622] flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-[#C9A468]" />
              Add Staff Member
            </h1>
            <p className="font-body text-sm text-[#8A8377] mt-1">Create a new account for team member</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] overflow-hidden">
          <div className="bg-[#16302B] px-6 py-4 border-b border-[#DDD5C4]">
            <h2 className="font-display text-lg font-medium text-[#F7F1E4] flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-[#C9A468]" />
              Staff Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Username and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Username <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`font-body w-full border-0 border-b ${errors.username ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
                  placeholder="johndoe"
                  required
                />
                {errors.username && (
                  <p className="font-body text-sm text-[#EF4444] mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Role <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Email Address <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`font-body w-full border-0 border-b ${errors.email ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent pl-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
                  placeholder="john@example.com"
                  required
                />
              </div>
              {errors.email && (
                <p className="font-body text-sm text-[#EF4444] mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                  placeholder="+234 123 456 7890"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Password <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <KeyIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`font-body w-full border-0 border-b ${errors.password ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent pl-8 pr-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[#8A8377] hover:text-[#2A2622] transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="font-body text-sm text-[#EF4444] mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                  Confirm Password <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <KeyIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    className={`font-body w-full border-0 border-b ${errors.password2 ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent pl-8 pr-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[#8A8377] hover:text-[#2A2622] transition-colors"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password2 && (
                  <p className="font-body text-sm text-[#EF4444] mt-1">{errors.password2}</p>
                )}
              </div>
            </div>

            {/* Password Hint */}
            <div className="bg-[#F7F1E4] rounded-lg border border-[#DDD5C4] p-3">
              <p className="font-body text-xs text-[#5B564B] flex items-center gap-1.5">
                <KeyIcon className="h-4 w-4 text-[#C9A468]" />
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD5C4]">
              <Link
                href="/staff"
                className="font-body px-6 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createStaff.isPending}
                className="font-body px-6 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createStaff.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Staff Member'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Role Info Card */}
        <div className="mt-6 bg-[#F7F1E4] rounded-lg border border-[#DDD5C4] p-4">
          <h3 className="font-body text-sm font-semibold text-[#2A2622] mb-3 flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-[#C9A468]" />
            Role Permissions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.value} className={`flex items-center gap-2 p-2 rounded ${role.bgColor}`}>
                  <Icon className={`h-4 w-4 ${role.textColor}`} />
                  <span className="font-body text-[#5B564B]">{role.label}</span>
                </div>
              );
            })}
          </div>
          <p className="font-body text-xs text-[#8A8377] mt-3">
            Staff roles determine what sections they can access. Choose appropriately.
          </p>
        </div>
      </div>
    </Layout>
  );
}