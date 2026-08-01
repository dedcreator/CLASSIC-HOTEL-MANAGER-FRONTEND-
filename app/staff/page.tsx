// frontend/app/staff/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  UsersIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useStaff, useStaffSummary } from '@/lib/api/hooks/useStaff';
import Layout from '@/components/layout/Layout';

const roleColors: Record<string, string> = {
  admin: 'bg-[#F3E8FF] text-[#6B21A5] border-[#D8B4FE]',
  manager: 'bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD]',
  receptionist: 'bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7]',
  bar_staff: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]',
  housekeeping: 'bg-[#FCE4EC] text-[#831843] border-[#F9A8D4]',
  ceo: 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  receptionist: 'Receptionist',
  bar_staff: 'Bar Staff',
  housekeeping: 'Housekeeping',
  ceo: 'CEO',
};

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: staff, isLoading } = useStaff({
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    active: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
  });

  const { data: summary } = useStaffSummary();

  const filteredStaff = staff || [];

  return (
    <Layout>
      <div className="space-y-6 pb-20 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DDD5C4] pb-6">
          <div>
            <h1 className="font-display text-2xl font-medium text-[#2A2622] flex items-center gap-2">
              <UsersIcon className="h-6 w-6 text-[#C9A468]" />
              Staff Management
            </h1>
            <p className="font-body text-sm text-[#8A8377] mt-1">Manage your team members and their roles</p>
          </div>
          <Link
            href="/staff/new"
            className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 w-fit"
          >
            <PlusIcon className="h-5 w-5" />
            Add Staff
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 hover:border-[#C9A468] transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="font-body text-sm text-[#8A8377]">Total Staff</p>
              <UsersIcon className="h-5 w-5 text-[#8A8377]" />
            </div>
            <p className="font-display text-2xl font-medium text-[#2A2622]">{summary?.total || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 hover:border-[#C9A468] transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="font-body text-sm text-[#8A8377]">Active</p>
              <CheckCircleIcon className="h-5 w-5 text-[#10B981]" />
            </div>
            <p className="font-display text-2xl font-medium text-[#10B981]">{summary?.active || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 hover:border-[#C9A468] transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="font-body text-sm text-[#8A8377]">Inactive</p>
              <XCircleIcon className="h-5 w-5 text-[#EF4444]" />
            </div>
            <p className="font-display text-2xl font-medium text-[#EF4444]">{summary?.inactive || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 hover:border-[#C9A468] transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="font-body text-sm text-[#8A8377]">Roles</p>
              <ChartBarIcon className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <p className="font-display text-2xl font-medium text-[#3B82F6]">{summary?.roles?.length || 0}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-10 py-2 text-[#2A2622] placeholder:text-[#8A8377] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-[#F7F1E4] border-[#C9A468] text-[#16302B]' : 'border-[#DDD5C4] text-[#8A8377] hover:bg-[#F7F1E4]'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#F7F1E4]">
              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468]"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="bar_staff">Bar Staff</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="ceo">CEO</option>
                </select>
              </div>

              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Staff Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-[#DDD5C4] p-4 animate-pulse">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#F7F1E4] rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-[#F7F1E4] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-[#F7F1E4] rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-[#F7F1E4] rounded w-full"></div>
                  <div className="h-3 bg-[#F7F1E4] rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-12 text-center">
            <UserIcon className="h-12 w-12 mx-auto text-[#DDD5C4] mb-3" />
            <h3 className="font-display text-lg font-medium text-[#2A2622] mb-1">No staff found</h3>
            <p className="font-body text-[#8A8377] mb-4">Try adjusting your search or filters</p>
            <Link
              href="/staff/new"
              className="font-body inline-flex items-center gap-2 text-[#16302B] hover:text-[#1D3B34] font-medium underline decoration-[#C9A468] underline-offset-4"
            >
              <PlusIcon className="h-5 w-5" />
              Add your first staff member
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((member) => (
              <Link
                key={member.id}
                href={`/staff/${member.id}`}
                className="group bg-white rounded-lg border border-[#DDD5C4] p-4 hover:border-[#C9A468] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 bg-[#F7F1E4] rounded-full flex items-center justify-center border-2 border-[#DDD5C4] group-hover:border-[#C9A468] transition-colors">
                        <span className="font-display text-xl font-medium text-[#16302B]">
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </span>
                      </div>
                      {member.is_active ? (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10B981] rounded-full border-2 border-white"></div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-body font-semibold text-[#2A2622] group-hover:text-[#16302B] transition-colors">
                        {member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.username}
                      </h3>
                      <p className="font-body text-sm text-[#8A8377]">@{member.username}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <EnvelopeIcon className="h-4 w-4 text-[#8A8377] flex-shrink-0" />
                    <span className="font-body text-[#5B564B] truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <PhoneIcon className="h-4 w-4 text-[#8A8377] flex-shrink-0" />
                      <span className="font-body text-[#5B564B]">{member.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F7F1E4]">
                  <span className={`font-body px-2.5 py-1 text-xs font-medium rounded-full border ${roleColors[member.role] || 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0]'}`}>
                    {roleLabels[member.role] || member.role}
                  </span>
                  <span className="font-body text-xs text-[#8A8377]">
                    {new Date(member.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}