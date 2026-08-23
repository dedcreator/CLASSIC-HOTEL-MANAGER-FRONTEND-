// frontend/app/menu/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  XMarkIcon,
  QueueListIcon,
  CheckCircleIcon,
  XCircleIcon,
  FolderPlusIcon,
  CakeIcon,
} from '@heroicons/react/24/outline';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from '@/lib/api/hooks/useMenu';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  category_name?: string;
  is_available: boolean;
  is_popular: boolean;
  is_new: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_vegan: boolean;
  preparation_time: number;
  dietary_tags: string[];
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  is_active: boolean;
  item_count?: number;
}

export default function MenuManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  
  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // Queries
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: menuItems, isLoading: itemsLoading } = useMenuItems(
    selectedCategory !== 'all' ? { category: selectedCategory } : {}
  );

  // Mutations
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Item form state
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    preparation_time: '15',
    is_available: true,
    is_popular: false,
    is_new: false,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    dietary_tags_input: '',
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '🍽️',
    is_active: true,
  });

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      price: '',
      category: categories && categories.length > 0 ? categories[0].id : '',
      preparation_time: '15',
      is_available: true,
      is_popular: false,
      is_new: false,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      dietary_tags_input: '',
    });
    setShowItemModal(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      category: item.category,
      preparation_time: String(item.preparation_time || 15),
      is_available: item.is_available,
      is_popular: item.is_popular,
      is_new: item.is_new,
      is_vegetarian: item.is_vegetarian,
      is_vegan: item.is_vegan,
      is_gluten_free: item.is_gluten_free,
      dietary_tags_input: (item.dietary_tags || []).join(', '),
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemForm.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!itemForm.price || Number(itemForm.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!itemForm.category) {
      toast.error('Please select a category');
      return;
    }

    const dietary_tags = itemForm.dietary_tags_input
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    const payload = {
      name: itemForm.name.trim(),
      description: itemForm.description.trim(),
      price: Number(itemForm.price),
      category: itemForm.category,
      preparation_time: Number(itemForm.preparation_time) || 15,
      is_available: itemForm.is_available,
      is_popular: itemForm.is_popular,
      is_new: itemForm.is_new,
      is_vegetarian: itemForm.is_vegetarian,
      is_vegan: itemForm.is_vegan,
      is_gluten_free: itemForm.is_gluten_free,
      dietary_tags,
    };

    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, data: payload });
        toast.success('Menu item updated successfully');
      } else {
        await createItem.mutateAsync(payload);
        toast.success('Menu item created successfully');
      }
      setShowItemModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save menu item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateItem.mutateAsync({
        id: item.id,
        data: { is_available: !item.is_available },
      });
      toast.success(`${item.name} marked as ${!item.is_available ? 'Available' : 'Unavailable'}`);
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem.mutateAsync(itemToDelete.id);
      toast.success(`${itemToDelete.name} deleted`);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error('Failed to delete item');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          data: categoryForm,
        });
        toast.success('Category updated');
      } else {
        await createCategory.mutateAsync(categoryForm);
        toast.success('Category created');
      }
      setEditingCategory(null);
      setCategoryForm({ name: '', icon: '🍽️', is_active: true });
    } catch (err: any) {
      toast.error('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete this category? Items in this category will need reassignment.')) {
      try {
        await deleteCategory.mutateAsync(id);
        toast.success('Category deleted');
      } catch (err: any) {
        toast.error('Failed to delete category');
      }
    }
  };

  // Filter items
  const filteredItems = (menuItems || []).filter((item: MenuItem) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAvailability =
      availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && item.is_available) ||
      (availabilityFilter === 'unavailable' && !item.is_available);
    return matchesSearch && matchesAvailability;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF6EF]">
        <div className="max-w-7xl mx-auto space-y-6 px-4 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-medium text-[#2A2622]">Menu Management</h1>
              <p className="font-body text-sm text-[#8A8377]">
                Manage restaurant & bar menu items, categories, and availability
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/menu/orders"
                className="font-body px-4 py-2.5 bg-[#F7F1E4] text-[#16302B] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors text-sm font-medium flex items-center gap-2"
              >
                <QueueListIcon className="h-4 w-4 text-[#C9A468]" />
                Live Orders
              </Link>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="font-body px-4 py-2.5 bg-[#F7F1E4] text-[#16302B] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors text-sm font-medium flex items-center gap-2"
              >
                <FolderPlusIcon className="h-4 w-4 text-[#16302B]" />
                Categories
              </button>
              <button
                onClick={openAddItemModal}
                className="font-body px-4 py-2.5 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                <PlusIcon className="h-4 w-4" />
                Add Menu Item
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-[#DDD5C4] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                <input
                  type="text"
                  placeholder="Search dishes, drinks, ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="font-body w-full pl-10 pr-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] placeholder:text-[#8A8377] text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                  className="font-body border border-[#DDD5C4] rounded-lg px-3 py-2 bg-[#FAF6EF] text-[#2A2622] text-sm focus:outline-none focus:border-[#C9A468]"
                >
                  <option value="all">All Availability</option>
                  <option value="available">Available Only</option>
                  <option value="unavailable">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`font-body px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-[#16302B] text-[#F7F1E4] shadow-sm'
                    : 'bg-[#F7F1E4] text-[#5B564B] hover:bg-[#DDD5C4]'
                }`}
              >
                All Items ({menuItems?.length || 0})
              </button>
              {categories?.map((cat: Category) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`font-body px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-[#16302B] text-[#F7F1E4] shadow-sm'
                      : 'bg-[#F7F1E4] text-[#5B564B] hover:bg-[#DDD5C4]'
                  }`}
                >
                  <span>{cat.icon || '🍽️'}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          {itemsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-[#DDD5C4] rounded-xl p-5 animate-pulse space-y-3">
                  <div className="h-5 bg-[#F7F1E4] rounded w-1/2"></div>
                  <div className="h-4 bg-[#F7F1E4] rounded w-3/4"></div>
                  <div className="h-6 bg-[#F7F1E4] rounded w-1/3 mt-4"></div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#DDD5C4] rounded-xl">
              <CakeIcon className="h-16 w-16 mx-auto text-[#DDD5C4] mb-3" />
              <p className="font-display text-lg text-[#2A2622]">No menu items found</p>
              <p className="font-body text-sm text-[#8A8377] mt-1">
                {searchTerm ? 'Try a different search term' : 'Click "Add Menu Item" to add your first dish or beverage'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item: MenuItem) => (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                    item.is_available ? 'border-[#DDD5C4]' : 'border-gray-200 bg-gray-50/70 opacity-80'
                  }`}
                >
                  <div className="p-5">
                    {/* Top badges */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap gap-1">
                        {item.category_name && (
                          <span className="font-body text-[11px] bg-[#F7F1E4] text-[#16302B] px-2 py-0.5 rounded-full font-medium">
                            {item.category_name}
                          </span>
                        )}
                        {item.is_popular && (
                          <span className="font-body text-[11px] bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                            <FireIcon className="h-3 w-3" /> Popular
                          </span>
                        )}
                        {item.is_new && (
                          <span className="font-body text-[11px] bg-[#DBEAFE] text-[#1E40AF] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                            <SparklesIcon className="h-3 w-3" /> New
                          </span>
                        )}
                      </div>

                      {/* Availability toggle */}
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        title={item.is_available ? 'Click to mark Out of Stock' : 'Click to mark Available'}
                        className={`font-body text-xs px-2 py-0.5 rounded-full font-medium transition-colors flex items-center gap-1 ${
                          item.is_available
                            ? 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]'
                            : 'bg-[#FCE4EC] text-[#C62828] hover:bg-[#F8BBD0]'
                        }`}
                      >
                        {item.is_available ? (
                          <>
                            <CheckCircleIcon className="h-3.5 w-3.5" /> In Stock
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-3.5 w-3.5" /> Unavailable
                          </>
                        )}
                      </button>
                    </div>

                    <h3 className="font-display font-medium text-lg text-[#2A2622]">{item.name}</h3>
                    <p className="font-body text-xs text-[#8A8377] mt-1 line-clamp-2">
                      {item.description || 'No description provided'}
                    </p>

                    {item.dietary_tags && item.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {item.dietary_tags.map((tag) => (
                          <span key={tag} className="font-body text-[10px] bg-[#FAF6EF] text-[#5B564B] px-2 py-0.5 rounded border border-[#DDD5C4]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-[#FAF6EF]/60 border-t border-[#F7F1E4] flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg font-medium text-[#16302B]">
                        ₦{item.price.toLocaleString()}
                      </p>
                      {item.preparation_time > 0 && (
                        <p className="font-body text-[11px] text-[#8A8377] flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" /> {item.preparation_time} mins
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditItemModal(item)}
                        className="p-1.5 text-[#5B564B] hover:text-[#16302B] hover:bg-[#F7F1E4] rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 text-[#8A8377] hover:text-[#C62828] hover:bg-[#FCE4EC] rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Menu Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl border border-[#DDD5C4]">
            <div className="p-4 border-b border-[#DDD5C4] flex justify-between items-center bg-[#16302B] text-[#F7F1E4] rounded-t-xl sticky top-0 z-10">
              <h2 className="font-display text-lg font-medium">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 hover:bg-[#1D3B34] rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div>
                <label className="font-body text-xs font-medium text-[#2A2622] block mb-1">
                  Item Name <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jollof Rice & Grilled Chicken"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="font-body w-full px-3 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none text-sm focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs font-medium text-[#2A2622] block mb-1">
                    Category <span className="text-[#C62828]">*</span>
                  </label>
                  <select
                    required
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="font-body w-full px-3 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] text-sm focus:outline-none focus:border-[#C9A468]"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat: Category) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-body text-xs font-medium text-[#2A2622] block mb-1">
                    Price (₦) <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    placeholder="e.g. 4500"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="font-body w-full px-3 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none text-sm focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-xs font-medium text-[#2A2622] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe ingredients, flavor, portion size..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="font-body w-full px-3 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none text-sm focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs font-medium text-[#2A2622] block mb-1">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="15"
                    value={itemForm.preparation_time}
                    onChange={(e) => setItemForm({ ...itemForm, preparation_time: e.target.value })}
                    className="font-body w-full px-3 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none text-sm focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                  />
                </div>

                <div>
                  <label className="font-body text-xs font-medium text-[#2A2622] block mb-1">
                    Dietary Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Spicy, Nut-free, Chef Special"
                    value={itemForm.dietary_tags_input}
                    onChange={(e) => setItemForm({ ...itemForm, dietary_tags_input: e.target.value })}
                    className="font-body w-full px-3 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none text-sm focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                  />
                </div>
              </div>

              {/* Checkbox options */}
              <div className="pt-2 border-t border-[#F7F1E4] grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_available}
                    onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                    className="rounded text-[#16302B] focus:ring-[#C9A468]"
                  />
                  <span className="font-body text-xs text-[#2A2622]">In Stock (Available)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_popular}
                    onChange={(e) => setItemForm({ ...itemForm, is_popular: e.target.checked })}
                    className="rounded text-[#16302B] focus:ring-[#C9A468]"
                  />
                  <span className="font-body text-xs text-[#2A2622]">🔥 Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_new}
                    onChange={(e) => setItemForm({ ...itemForm, is_new: e.target.checked })}
                    className="rounded text-[#16302B] focus:ring-[#C9A468]"
                  />
                  <span className="font-body text-xs text-[#2A2622]">✨ New Item</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_vegetarian}
                    onChange={(e) => setItemForm({ ...itemForm, is_vegetarian: e.target.checked })}
                    className="rounded text-[#16302B] focus:ring-[#C9A468]"
                  />
                  <span className="font-body text-xs text-[#2A2622]">🥬 Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_vegan}
                    onChange={(e) => setItemForm({ ...itemForm, is_vegan: e.target.checked })}
                    className="rounded text-[#16302B] focus:ring-[#C9A468]"
                  />
                  <span className="font-body text-xs text-[#2A2622]">🌱 Vegan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_gluten_free}
                    onChange={(e) => setItemForm({ ...itemForm, is_gluten_free: e.target.checked })}
                    className="rounded text-[#16302B] focus:ring-[#C9A468]"
                  />
                  <span className="font-body text-xs text-[#2A2622]">🌾 Gluten-Free</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#DDD5C4]">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#5B564B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createItem.isPending || updateItem.isPending}
                  className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#16302B] rounded-lg hover:bg-[#1D3B34] transition-colors disabled:opacity-50"
                >
                  {createItem.isPending || updateItem.isPending ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl border border-[#DDD5C4]">
            <div className="p-4 border-b border-[#DDD5C4] flex justify-between items-center bg-[#16302B] text-[#F7F1E4] rounded-t-xl">
              <h2 className="font-display text-lg font-medium">Manage Categories</h2>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="p-1 hover:bg-[#1D3B34] rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Form */}
              <form onSubmit={handleSaveCategory} className="bg-[#FAF6EF] p-4 rounded-xl border border-[#DDD5C4] space-y-3">
                <h3 className="font-body text-sm font-semibold text-[#16302B]">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Icon (e.g. 🍲)"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="w-16 px-2 py-2 text-center border border-[#DDD5C4] rounded-lg bg-white text-sm"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Category Name (e.g. Traditional Soups)"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="flex-1 px-3 py-2 border border-[#DDD5C4] rounded-lg bg-white text-sm outline-none focus:border-[#C9A468]"
                  />
                  <button
                    type="submit"
                    disabled={createCategory.isPending || updateCategory.isPending}
                    className="px-4 py-2 bg-[#16302B] text-[#F7F1E4] rounded-lg text-sm font-medium hover:bg-[#1D3B34] transition-colors disabled:opacity-50"
                  >
                    {editingCategory ? 'Update' : 'Add'}
                  </button>
                </div>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ name: '', icon: '🍽️', is_active: true });
                    }}
                    className="text-xs text-[#8A8377] underline"
                  >
                    Cancel Editing
                  </button>
                )}
              </form>

              {/* Category List */}
              <div className="space-y-2">
                <h4 className="font-body text-xs font-semibold uppercase text-[#8A8377]">
                  Existing Categories ({categories?.length || 0})
                </h4>
                <div className="divide-y divide-[#F7F1E4] border border-[#DDD5C4] rounded-xl overflow-hidden bg-white">
                  {categories?.map((cat: Category) => (
                    <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-[#FAF6EF]/60 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{cat.icon || '🍽️'}</span>
                        <span className="font-body text-sm font-medium text-[#2A2622]">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryForm({
                              name: cat.name,
                              icon: cat.icon || '🍽️',
                              is_active: cat.is_active,
                            });
                          }}
                          className="p-1 text-[#5B564B] hover:text-[#16302B] rounded transition-colors"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1 text-[#8A8377] hover:text-[#C62828] rounded transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border border-[#DDD5C4]">
            <h3 className="font-display text-lg font-medium text-[#2A2622] mb-2">Delete Menu Item</h3>
            <p className="font-body text-sm text-[#5B564B] mb-4">
              Are you sure you want to delete <span className="font-semibold text-[#16302B]">{itemToDelete.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#5B564B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#C62828] rounded-lg hover:bg-[#B71C1C] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}