// frontend/app/sales/components/CustomerSearch.tsx
'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useSearchCustomers, useCreateCustomer } from '@/lib/api/hooks/useSales';

interface Props {
  onSelect: (customer: any) => void;
  onClose: () => void;
}

export default function CustomerSearch({ onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const { data: results } = useSearchCustomers(search);
  const createCustomer = useCreateCustomer();

  const handleCreateCustomer = async () => {
    const customer = await createCustomer.mutateAsync(newCustomer);
    onSelect(customer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Select Customer</h2>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {/* Results */}
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {results?.map((customer) => (
              <button
                key={customer.id}
                onClick={() => onSelect(customer)}
                className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                <p className="text-sm text-gray-600">{customer.email} • {customer.phone}</p>
              </button>
            ))}
          </div>

          {/* New Customer Form */}
          {!showNewForm ? (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full py-2 text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-2"
            >
              <UserPlusIcon className="h-5 w-5" />
              Add New Customer
            </button>
          ) : (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">New Customer</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newCustomer.first_name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newCustomer.last_name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNewForm(false)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCustomer}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
                  >
                    Save Customer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}