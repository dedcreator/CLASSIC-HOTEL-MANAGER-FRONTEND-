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
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  manager: 'bg-blue-50 text-blue-700 border-blue-200',
  receptionist: 'bg-green-50 text-green-700 border-green-200',
  bar_staff: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  housekeeping: 'bg-pink-50 text-pink-700 border-pink-200',
  ceo: 'bg-red-50 text-red-700 border-red-200',
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

  // Get unique roles for filter
  const roles = ['all', ...new Set(staff?.map(s => s.role) || [])];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <UsersIcon className="h-6 w-6" />
                Staff Management
              </h1>
              <p className="text-red-100 mt-1">Manage your team members and their roles</p>
            </div>
            <Link
              href="/staff/new"
              className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 w-fit"
            >
              <PlusIcon className="h-5 w-5" />
              Add Staff
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Staff</p>
              <UsersIcon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.total || 0}</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active</p>
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{summary?.active || 0}</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Inactive</p>
              <XCircleIcon className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{summary?.inactive || 0}</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Roles</p>
              <ChartBarIcon className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{summary?.roles?.length || 0}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-red-50 border-red-300 text-red-600' : 'hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No staff found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <Link
              href="/staff/new"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
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
                className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all hover:border-red-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center border-2 border-red-200 group-hover:border-red-300 transition-colors">
                        <span className="text-xl font-bold text-red-600">
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </span>
                      </div>
                      {member.is_active ? (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                        {member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.username}
                      </h3>
                      <p className="text-sm text-gray-500">@{member.username}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">{member.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${roleColors[member.role] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {roleLabels[member.role] || member.role}
                  </span>
                  <span className="text-xs text-gray-400">
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