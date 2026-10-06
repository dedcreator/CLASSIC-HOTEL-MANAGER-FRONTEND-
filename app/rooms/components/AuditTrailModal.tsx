// frontend/app/rooms/components/AuditTrailModal.tsx
'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useAuditLogs } from '@/lib/api/hooks/useRooms';
import { Room } from '@/lib/api/types';

interface AuditTrailModalProps {
  room?: Room | null;
  onClose: () => void;
}

const actionStyles: Record<string, { bg: string; text: string; label: string }> = {
  CHECKIN_CODE_GENERATED: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', label: 'Check-in Key Issued' },
  EMERGENCY_CODE_GENERATED: { bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', label: 'Emergency Key (1h)' },
  CLEANING_CODE_REQUESTED: { bg: 'bg-[#FFF7ED]', text: 'text-[#C2410C]', label: 'Cleaning Key Requested' },
  CLEANING_CODE_APPROVED: { bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', label: 'Cleaning Key Approved' },
  CLEANING_CODE_REJECTED: { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', label: 'Cleaning Key Rejected' },
  ROOM_CLEANED_ACTIVATED: { bg: 'bg-[#ECFDF5]', text: 'text-[#047857]', label: 'Room Activated Available' },
  ROOM_STATUS_CHANGED: { bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]', label: 'Status Changed' },
  ACCESS_CODE_VERIFIED: { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', label: 'Code Verified' },
  ACCESS_CODE_REVOKED: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', label: 'Code Revoked' },
};

export default function AuditTrailModal({ room, onClose }: AuditTrailModalProps) {
  const [search, setSearch] = useState('');
  const { data: logs, isLoading, refetch, isFetching } = useAuditLogs({
    room: room?.id,
    search: search || undefined,
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-[#DDD5C4] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#16302B] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-[#A5D6A7]" />
            <div>
              <h3 className="font-display font-medium text-lg">
                Zero-Trust Security & Access Audit
              </h3>
              <p className="text-xs text-[#B9C4B9]">
                {room ? `Room ${room.room_number} Access & Status Trail` : 'Complete Hotel Access & Status Trail'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg text-[#B9C4B9] hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh logs"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#B9C4B9] hover:text-white hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-[#DDD5C4] bg-[#F7F1E4] flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8377]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by actor, room, code, or action..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DDD5C4] rounded-lg outline-none focus:border-[#16302B]"
            />
          </div>
          <span className="text-xs text-[#5B564B] whitespace-nowrap">
            {logs?.length || 0} events recorded
          </span>
        </div>

        {/* Log table */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-[#8A8377]">Loading audit records...</div>
          ) : !logs || logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#8A8377]">
              No security events found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#FAF6EF] text-[#8A8377] uppercase tracking-wider sticky top-0 border-b border-[#DDD5C4]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-4 font-semibold">Actor / Role</th>
                  <th className="py-2.5 px-4 font-semibold">Event</th>
                  <th className="py-2.5 px-4 font-semibold">Room / Code</th>
                  <th className="py-2.5 px-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {logs.map((log) => {
                  const badge = actionStyles[log.action] || {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    label: log.action_display || log.action,
                  };
                  return (
                    <tr key={log.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-2.5 px-4 whitespace-nowrap text-[#5B564B]">
                        {new Date(log.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-[#2A2622]">{log.actor_username}</span>
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-[#DDD5C4]/60 text-[#5B564B]">
                          {log.actor_role}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap font-mono text-[#2A2622]">
                        {log.room_number ? `Rm ${log.room_number}` : '-'}
                        {log.access_code && (
                          <span className="ml-1 text-[#16302B] font-bold">[{log.access_code}]</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-[#5B564B] max-w-xs truncate" title={log.details}>
                        {log.details || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF6EF] px-5 py-3 border-t border-[#DDD5C4] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-[#16302B] text-white rounded-lg hover:bg-[#1D3B34] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
