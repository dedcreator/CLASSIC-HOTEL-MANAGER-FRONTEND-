// frontend/app/sales/components/CustomerSearch.tsx
'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, UserPlusIcon, UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
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
    <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-[#DDD5C4] flex justify-between items-center bg-[#F7F1E4] rounded-t-lg">
          <div>
            <h2 className="font-display text-lg font-medium text-[#2A2622]">Select Customer</h2>
            <p className="font-body text-sm text-[#8A8377]">Search or create a new customer</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#8A8377] hover:text-[#2A2622] hover:bg-white/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
              autoFocus
            />
          </div>

          {/* Results */}
          {results && results.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {results.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => onSelect(customer)}
                  className="w-full text-left p-3 bg-[#F7F1E4] rounded-lg hover:bg-[#DDD5C4] transition-colors border border-transparent hover:border-[#C9A468]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#16302B] flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-sm font-medium text-[#F7F1E4]">
                        {customer.first_name?.[0]}{customer.last_name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-[#2A2622]">
                        {customer.first_name} {customer.last_name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#8A8377]">
                        {customer.email && (
                          <span className="font-body text-xs flex items-center gap-1">
                            <EnvelopeIcon className="h-3 w-3" />
                            {customer.email}
                          </span>
                        )}
                        {customer.phone && (
                          <span className="font-body text-xs flex items-center gap-1">
                            <PhoneIcon className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {search && results?.length === 0 && (
            <div className="text-center py-6">
              <p className="font-body text-[#8A8377]">No customers found</p>
              <p className="font-body text-sm text-[#8A8377] mt-1">Try a different search or create a new customer</p>
            </div>
          )}

          {/* New Customer Form */}
          {!showNewForm ? (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full py-2.5 text-[#16302B] hover:text-[#1D3B34] font-medium flex items-center justify-center gap-2 border border-[#DDD5C4] rounded-lg hover:bg-[#F7F1E4] transition-colors"
            >
              <UserPlusIcon className="h-5 w-5" />
              Add New Customer
            </button>
          ) : (
            <div className="border-t border-[#DDD5C4] pt-4 mt-2">
              <h3 className="font-display text-base font-medium text-[#2A2622] mb-3">New Customer</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-body block text-xs font-medium text-[#5B564B] mb-1">
                      First Name <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={newCustomer.first_name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                      className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-1.5 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[6px] placeholder:text-[#8A8377]"
                    />
                  </div>
                  <div>
                    <label className="font-body block text-xs font-medium text-[#5B564B] mb-1">
                      Last Name <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={newCustomer.last_name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                      className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-1.5 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[6px] placeholder:text-[#8A8377]"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-body block text-xs font-medium text-[#5B564B] mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-1.5 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[6px] placeholder:text-[#8A8377]"
                  />
                </div>
                <div>
                  <label className="font-body block text-xs font-medium text-[#5B564B] mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-1.5 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[6px] placeholder:text-[#8A8377]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowNewForm(false)}
                    className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCustomer}
                    disabled={!newCustomer.first_name || !newCustomer.last_name}
                    className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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