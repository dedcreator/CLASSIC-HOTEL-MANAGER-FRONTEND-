// frontend/app/tables/page.tsx
'use client';

import { useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  QrCodeIcon,
  ClipboardIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useTables, useCreateTable, useUpdateTable, useDeleteTable, useGenerateQR } from '@/lib/api/hooks/useTables';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

export default function TablesManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [formData, setFormData] = useState({
    table_number: '',
    name: '',
    capacity: 2,
    status: 'available',
    section: '',
    floor: '',
  });
  const [loading, setLoading] = useState(false);

  const { data: tables, isLoading, refetch } = useTables();
  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const deleteTable = useDeleteTable();
  const generateQR = useGenerateQR();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTable) {
        await updateTable.mutateAsync({ id: editingTable.id, data: formData });
        toast.success('Table updated successfully');
      } else {
        await createTable.mutateAsync(formData);
        toast.success('Table created successfully');
      }
      setShowModal(false);
      setEditingTable(null);
      setFormData({
        table_number: '',
        name: '',
        capacity: 2,
        status: 'available',
        section: '',
        floor: '',
      });
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save table');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await deleteTable.mutateAsync(id);
      toast.success('Table deleted');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete table');
    }
  };

  const handleGenerateQR = async (table: any) => {
    try {
      const result = await generateQR.mutateAsync(table.id);
      if (result.success) {
        toast.success('QR code generated!');
        refetch();
      }
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const copyQR = (qrCode: string) => {
    navigator.clipboard.writeText(qrCode);
    toast.success('QR code copied!');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-[#E8F5E9] text-[#2E7D32]',
      occupied: 'bg-[#FCE4EC] text-[#C62828]',
      reserved: 'bg-[#FFF3E0] text-[#E65100]',
      cleaning: 'bg-[#DBEAFE] text-[#0D47A1]',
      maintenance: 'bg-[#FCE4EC] text-[#C62828]',
    };
    return colors[status] || 'bg-[#F7F1E4] text-[#5B564B]';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF6EF]">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display text-2xl font-medium text-[#2A2622]">Table Management</h1>
              <p className="font-body text-sm text-[#8A8377]">Manage restaurant tables and QR codes</p>
            </div>
            <button
              onClick={() => {
                setEditingTable(null);
                setFormData({
                  table_number: '',
                  name: '',
                  capacity: 2,
                  status: 'available',
                  section: '',
                  floor: '',
                });
                setShowModal(true);
              }}
              className="font-body inline-flex items-center gap-2 px-4 py-2 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Add Table
            </button>
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-[#DDD5C4] rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-[#F7F1E4] rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[#F7F1E4] rounded w-1/2"></div>
                </div>
              ))
            ) : tables?.map((table: any) => (
              <div key={table.id} className="bg-white border border-[#DDD5C4] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-medium text-[#2A2622]">Table {table.table_number}</h3>
                      <p className="font-body text-sm text-[#8A8377]">{table.name}</p>
                      <p className="font-body text-sm text-[#8A8377]">Capacity: {table.capacity}</p>
                      {table.section && (
                        <p className="font-body text-sm text-[#8A8377]">Section: {table.section}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                      {table.status}
                    </span>
                  </div>

                  {/* QR Code */}
                  <div className="mt-4 pt-4 border-t border-[#F7F1E4]">
                    {table.qr_code ? (
                      <div className="flex items-center gap-4">
                        <img src={table.qr_code} alt={`QR Code for Table ${table.table_number}`} className="w-16 h-16" />
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-xs text-[#8A8377] truncate">/{table.slug}</p>
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => handleGenerateQR(table)}
                              className="font-body text-xs bg-[#16302B] text-[#F7F1E4] px-2 py-1 rounded hover:bg-[#1D3B34] transition-colors"
                            >
                              Regenerate
                            </button>
                            <button
                              onClick={() => copyQR(table.qr_code)}
                              className="font-body text-xs bg-[#F7F1E4] text-[#5B564B] px-2 py-1 rounded hover:bg-[#DDD5C4] transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerateQR(table)}
                        className="font-body text-sm text-[#C9A468] hover:text-[#B8924F] transition-colors flex items-center gap-2"
                      >
                        <QrCodeIcon className="h-4 w-4" />
                        Generate QR Code
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#F7F1E4]">
                    <button
                      onClick={() => {
                        setEditingTable(table);
                        setFormData({
                          table_number: table.table_number,
                          name: table.name || '',
                          capacity: table.capacity,
                          status: table.status,
                          section: table.section || '',
                          floor: table.floor || '',
                        });
                        setShowModal(true);
                      }}
                      className="p-1.5 text-[#8A8377] hover:text-[#16302B] transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(table.id)}
                      className="p-1.5 text-[#8A8377] hover:text-[#C62828] transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && tables?.length === 0 && (
            <div className="text-center py-12 bg-white border border-[#DDD5C4] rounded-xl">
              <QrCodeIcon className="h-16 w-16 mx-auto text-[#DDD5C4] mb-4" />
              <p className="font-body text-[#8A8377]">No tables yet</p>
              <button
                onClick={() => {
                  setEditingTable(null);
                  setFormData({
                    table_number: '',
                    name: '',
                    capacity: 2,
                    status: 'available',
                    section: '',
                    floor: '',
                  });
                  setShowModal(true);
                }}
                className="font-body mt-4 px-6 py-2 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors"
              >
                Add Your First Table
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4 border-b border-[#DDD5C4] flex justify-between items-center bg-[#16302B] text-[#F7F1E4] rounded-t-xl">
              <h2 className="font-display text-lg font-medium">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingTable(null); }} className="p-1 hover:bg-[#1D3B34] rounded-lg transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-[#5B564B] block mb-1">
                  Table Number <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.table_number}
                  onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                  placeholder="e.g., 5, A3"
                  required
                />
              </div>

              <div>
                <label className="font-body text-sm font-medium text-[#5B564B] block mb-1">
                  Table Name <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                  placeholder="e.g., Garden View"
                  required
                />
              </div>

              <div>
                <label className="font-body text-sm font-medium text-[#5B564B] block mb-1">
                  Capacity <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                  required
                />
              </div>

              <div>
                <label className="font-body text-sm font-medium text-[#5B564B] block mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-[#5B564B] block mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                    placeholder="e.g., Indoor"
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-[#5B564B] block mb-1">
                    Floor
                  </label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                    placeholder="e.g., Ground"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingTable(null); }}
                  className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#5B564B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#16302B] rounded-lg hover:bg-[#1D3B34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}