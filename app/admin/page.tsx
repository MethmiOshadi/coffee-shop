'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MenuItemType {
  _id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
}

const CATEGORIES = [
  "Hot Coffee",
  "Cold Coffee / Iced Drinks",
  "Tea & Other Drinks",
  "Snacks & Pastries",
  "Special / Seasonal Items",
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
  switch (name) {
    case 'coffee':
      return (
        <svg {...common}>
          <path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z" />
          <path d="M17 10h2a2 2 0 1 1 0 4h-2M8 4c-2 2 2 2 0 4m5-4c-2 2 2 2 0 4" />
        </svg>
      );
    case 'clipboard':
      return (
        <svg {...common}>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: CATEGORIES[0],
    price: '',
    description: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));

    fetchItems();
  }, [router]);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/menu');
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setForm((prev) => ({ ...prev, image: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm({ name: '', category: CATEGORIES[0], price: '', description: '', image: '' });
    setImagePreview(null);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let formattedPrice = form.price.trim();
    if (!formattedPrice.toUpperCase().startsWith('LKR')) {
      formattedPrice = `LKR ${formattedPrice}`;
    }

    const payload = { ...form, price: formattedPrice };

    try {
      if (editingId) {
        const res = await fetch('/api/menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const json = await res.json();
        if (json.success) {
          resetForm();
          fetchItems();
        } else {
          alert('Failed to update item');
        }
      } else {
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          resetForm();
          fetchItems();
        } else {
          alert('Failed to add item');
        }
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MenuItemType) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      image: item.image,
    });
    setImagePreview(item.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/menu?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        fetchItems();
        if (editingId === id) resetForm();
      } else {
        alert('Failed to delete item');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth?action=logout');
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#30251E] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Live Orders Link & Logout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-[#E9E0D5]">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#30251E] text-[#D9BA91] shadow-md">
              <Icon name="coffee" size={24} />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#30251E]">Admin Control Panel</h1>
              <p className="text-xs text-[#77695C] mt-0.5">Manage your digital menu items and coffeehouse offerings.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/admin/orders"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#30251E] hover:bg-[#49372B] text-white text-xs font-bold rounded-xl transition shadow-md"
            >
              <Icon name="clipboard" size={16} /> Live Orders & History
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition"
            >
              <Icon name="logout" size={15} /> Logout
            </button>
          </div>
        </div>

        {/* Add / Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-[#E9E0D5] rounded-[28px] p-6 sm:p-8 mb-12 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#A17B50]">
                {editingId ? 'Modification Mode' : 'Creation Mode'}
              </span>
              <h2 className="text-lg font-bold text-[#30251E]">
                {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-[#77695C] hover:text-[#30251E] underline underline-offset-4"
              >
                Cancel Editing
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#77695C] mb-2">Item Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#E4D9CB] rounded-2xl px-4.5 py-3 text-xs text-[#30251E] outline-none focus:bg-white focus:border-[#A17B50] focus:ring-4 focus:ring-[#A17B50]/10 transition"
                placeholder="e.g. Caramel Macchiato"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#77695C] mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#E4D9CB] rounded-2xl px-4.5 py-3 text-xs text-[#30251E] outline-none focus:bg-white focus:border-[#A17B50] focus:ring-4 focus:ring-[#A17B50]/10 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#77695C] mb-2">Price (LKR)</label>
              <input
                type="text"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#E4D9CB] rounded-2xl px-4.5 py-3 text-xs text-[#30251E] outline-none focus:bg-white focus:border-[#A17B50] focus:ring-4 focus:ring-[#A17B50]/10 transition"
                placeholder="e.g. 450.00 or LKR 450.00"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#77695C] mb-2">Item Image File</label>
              <input
                type="file"
                accept="image/*"
                required={!form.image}
                onChange={handleImageChange}
                className="w-full bg-[#FAF7F2] border border-[#E4D9CB] rounded-2xl px-3 py-2 text-xs text-[#77695C] outline-none file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#30251E] file:text-[#D9BA91] hover:file:bg-[#49372B] transition cursor-pointer"
              />
            </div>
          </div>

          {imagePreview && (
            <div className="mb-5 flex items-center gap-4 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E4D9CB]">
              <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-[#E9E0D5]" />
              <div>
                <p className="text-xs font-bold text-[#30251E]">Image Preview Loaded</p>
                <p className="text-[11px] text-[#77695C]">Ready to upload with item details.</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#77695C] mb-2">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#E4D9CB] rounded-2xl px-4.5 py-3 text-xs text-[#30251E] outline-none focus:bg-white focus:border-[#A17B50] focus:ring-4 focus:ring-[#A17B50]/10 transition resize-none"
              placeholder="Short description of ingredients or preparation..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#30251E] hover:bg-[#49372B] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-300 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : editingId ? 'Update Menu Item' : 'Add Item to Menu'}
          </button>
        </form>

        {/* Existing Items List with Edit/Delete */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#30251E]">Existing Menu Items</h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-[#E9E0D5] text-[#77695C]">
            Total: {items.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-[#E9E0D5] rounded-2xl p-4 flex gap-4 items-center justify-between shadow-sm">
              <div className="flex gap-3.5 items-center overflow-hidden">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0 bg-[#FAF7F2]" />
                <div className="overflow-hidden">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#A17B50]">{item.category}</span>
                  <h3 className="font-bold text-[#30251E] text-xs truncate">{item.name}</h3>
                  <p className="text-[#A17B50] text-xs font-black mt-0.5">{item.price}</p>
                  <p className="text-[#77695C] text-[11px] mt-0.5 line-clamp-1">{item.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#30251E] text-xs font-bold rounded-xl border border-[#E4D9CB] transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id, item.name)}
                  className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}