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
    <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Live Orders Link & Logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Coffee Shop Admin Panel</h1>
            <p className="text-[#A39284]">Add, edit, or delete your menu items seamlessly.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="px-4 py-2 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] text-xs font-bold rounded-xl transition shadow-md"
            >
              📋 Live Orders & History
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs font-semibold rounded-xl transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Add / Edit Form */}
        <form onSubmit={handleSubmit} className="bg-[#1C1410] border border-[#2E221B] rounded-2xl p-6 mb-12 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-[#A39284] hover:text-white underline"
              >
                Cancel Editing
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[#A39284] mb-1">Item Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-4 py-2.5 text-white focus:border-[#D2A072] outline-none text-xs"
                placeholder="e.g. Caramel Macchiato"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A39284] mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-4 py-2.5 text-white focus:border-[#D2A072] outline-none text-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#A39284] mb-1">Price (LKR)</label>
              <input
                type="text"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-4 py-2.5 text-white focus:border-[#D2A072] outline-none text-xs"
                placeholder="e.g. 450.00 or LKR 450.00"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A39284] mb-1">Choose Image from Local Device</label>
              <input
                type="file"
                accept="image/*"
                required={!form.image}
                onChange={handleImageChange}
                className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-3 py-2 text-white text-xs focus:border-[#D2A072] outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#D2A072] file:text-[#120B08]"
              />
            </div>
          </div>

          {imagePreview && (
            <div className="mb-4">
              <p className="text-xs text-[#A39284] mb-1">Selected Image Preview:</p>
              <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-[#2E221B]" />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm text-[#A39284] mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-4 py-2.5 text-white focus:border-[#D2A072] outline-none text-xs"
              placeholder="Short description of the item..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-bold text-xs rounded-xl transition duration-300"
          >
            {loading ? 'Saving...' : editingId ? 'Update Menu Item' : 'Add Item to Menu'}
          </button>
        </form>

        {/* Existing Items List with Edit/Delete */}
        <h2 className="text-xl font-semibold text-white mb-4">Existing Menu Items ({items.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item._id} className="bg-[#1C1410] border border-[#2E221B] rounded-xl p-4 flex gap-4 items-center justify-between">
              <div className="flex gap-4 items-center overflow-hidden">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-white text-sm truncate">{item.name}</h3>
                  <p className="text-[#D2A072] text-xs font-bold">{item.price}</p>
                  <p className="text-[#A39284] text-xs mt-1 line-clamp-1">{item.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1 bg-[#2E221B] hover:bg-[#3D2D24] text-[#D2A072] text-xs font-semibold rounded-lg transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id, item.name)}
                  className="px-3 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold rounded-lg border border-red-800/40 transition"
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