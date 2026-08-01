// frontend/app/staff/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useStaffMember, useUpdateStaff } from '@/lib/api/hooks/useStaff';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const { data: staff, isLoading } = useStaffMember(staffId);
  const updateStaff = useUpdateStaff();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'RECEPTIONIST',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (staff) {
      setFormData({
        first_name: staff.first_name || '',
        last_name: staff.last_name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || 'RECEPTIONIST',
      });
    }
  }, [staff]);

  const roles = [
    { value: 'CEO', label: 'CEO' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
    { value: 'BAR_STAFF', label: 'Bar Staff' },
    { value: 'HOUSEKEEPING', label: 'Housekeeping' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      role: formData.role.toUpperCase(),
    };

    try {
      await updateStaff.mutateAsync({
        id: staffId,
        ...submitData,
      });
      router.push(`/staff/${staffId}`);
    } catch (error: any) {
      console.error('Update error:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
        const firstError = Object.values(error.response.data)[0];
        if (firstError) toast.error(String(firstError));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#F7F1E4] rounded w-1/4"></div>
            <div className="bg-white rounded-lg border border-[#DDD5C4] p-6 space-y-4">
              <div className="h-4 bg-[#F7F1E4] rounded w-1/2"></div>
              <div className="h-4 bg-[#F7F1E4] rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!staff) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <p className="font-body text-[#8A8377]">Staff member not found</p>
          <Link href="/staff" className="font-body text-[#16302B] hover:text-[#1D3B34] underline decoration-[#C9A468] underline-offset-4 mt-4 inline-block">
            Back to Staff
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 border-b border-[#DDD5C4] pb-6">
          <Link
            href={`/staff/${staffId}`}
            className="font-body inline-flex items-center text-[#8A8377] hover:text-[#16302B] mb-4 transition-colors group"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Profile
          </Link>

          <div>
            <h1 className="font-display text-2xl font-medium text-[#2A2622] flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-[#C9A468]" />
              Edit Staff Member
            </h1>
            <p className="font-body text-sm text-[#8A8377] mt-1">Update information for {staff.full_name}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] overflow-hidden">
          <div className="bg-[#16302B] px-6 py-4 border-b border-[#DDD5C4]">
            <h2 className="font-display text-lg font-medium text-[#F7F1E4] flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-[#C9A468]" />
              Edit Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name Fields */}
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

            {/* Role */}
            <div>
              <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                Role <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <ShieldCheckIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] appearance-none"
                  required
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD5C4]">
              <Link
                href={`/staff/${staffId}`}
                className="font-body px-6 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updateStaff.isPending}
                className="font-body px-6 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updateStaff.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}