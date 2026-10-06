// frontend/app/rooms/components/EmergencyKeyModal.tsx
'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  ShieldExclamationIcon,
  KeyIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { Room, RoomAccessCode } from '@/lib/api/types';
import { useCreateEmergencyKey } from '@/lib/api/hooks/useRooms';
import toast from 'react-hot-toast';

interface EmergencyKeyModalProps {
  room: Room;
  onClose: () => void;
  onSuccess?: (code: RoomAccessCode) => void;
}

export default function EmergencyKeyModal({ room, onClose, onSuccess }: EmergencyKeyModalProps) {
  const [reason, setReason] = useState('');
  const [generatedKey, setGeneratedKey] = useState<RoomAccessCode | null>(null);
  const [copied, setCopied] = useState(false);

  const createEmergencyKey = useCreateEmergencyKey();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Reason is required to generate an emergency key');
      return;
    }

    try {
      const res = await createEmergencyKey.mutateAsync({
        room_id: room.id,
        reason: reason.trim(),
      });
      setGeneratedKey(res.access_code);
      onSuccess?.(res.access_code);
    } catch {
      // Error handled by mutation hook
    }
  };

  const handleCopy = () => {
    if (generatedKey?.code) {
      navigator.clipboard.writeText(generatedKey.code);
      setCopied(true);
      toast.success('Access key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full border border-[#DDD5C4] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#B91C1C] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldExclamationIcon className="h-5 w-5" />
            <h3 className="font-display font-medium text-lg">Emergency Override Key</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-sm text-[#5B564B]">
            Room <strong className="text-[#2A2622]">{room.room_number}</strong> • Validity: Exactly 1 hour.
          </div>

          {!generatedKey ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8377] mb-1">
                  Reason for Override
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Guest locked out, medical emergency, pipe leak..."
                  rows={3}
                  required
                  className="w-full text-sm border border-[#DDD5C4] rounded-lg p-2.5 focus:ring-1 focus:ring-[#B91C1C] focus:border-[#B91C1C] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-[#5B564B] hover:bg-[#F7F1E4] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEmergencyKey.isPending}
                  className="px-4 py-2 text-sm bg-[#B91C1C] hover:bg-[#991B1B] text-white font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <KeyIcon className="h-4 w-4" />
                  {createEmergencyKey.isPending ? 'Generating...' : 'Issue 1-Hour Key'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-[#991B1B] font-semibold mb-1">
                  Active Emergency Key
                </p>
                <div className="font-mono text-3xl font-bold text-[#B91C1C] tracking-widest my-2 select-all">
                  {generatedKey.code}
                </div>
                <p className="text-xs text-[#7F1D1D]">
                  Expires: {new Date(generatedKey.valid_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (60 mins)
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 py-2.5 bg-[#16302B] hover:bg-[#1D3B34] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <ClipboardDocumentCheckIcon className="h-4 w-4 text-[#A5D6A7]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-4 w-4" />
                      Copy Key
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-[#DDD5C4] hover:bg-[#F7F1E4] text-sm text-[#2A2622] rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
