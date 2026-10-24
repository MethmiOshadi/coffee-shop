
'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
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
  'Hot Coffee',
  'Cold Coffee / Iced Drinks',
  'Tea & Other Drinks',
  'Snacks & Pastries',
  'Special / Seasonal Items',
];

const initialForm = {
  name: '',
  category: CATEGORIES[0],
  price: '',
  description: '',
  image: '',
};

function Icon({
  name,
  className = 'h-5 w-5',
}: {
  name: string;
  className?: string;
}) {
  const props = {
    className,
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
        <svg {...props}>
          <path d="M5 9h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V9Z" />
          <path d="M17 11h1a3 3 0 0 1 0 6h-2" />
          <path d="M8 5c-1-1 1-2 0-3M12 5c-1-1 1-2 0-3M4 21h15" />
        </svg>
      );
    case 'plus':
      return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
    case 'search':
      return (
        <svg {...props}>
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case 'edit':
      return (
        <svg {...props}>
          <path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l0 5Z" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...props}>
          <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
        </svg>
      );
    case 'close':
      return <svg {...props}><path d="m18 6-12 12M6 6l12 12" /></svg>;
    case 'image':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...props}>
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminMenuPage() {
  const router = useRouter();

  const [items, setItems] = useState<MenuItemType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  async function fetchItems() {
    setItemsLoading(true);

    try {
      const res = await fetch('/api/menu', { cache: 'no-store' });
      if (!res.ok) throw new Error('Could not load menu');

      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error('Unexpected menu response');
      }

      setItems(json.data);
    } catch (error) {
      console.error(error);
      setNotice({
        type: 'error',
        message: 'Unable to load menu items. Please try again.',
      });
    } finally {
      setItemsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initialise() {
      try {
        const res = await fetch('/api/auth', { cache: 'no-store' });
        const data = await res.json();

        if (!active) return;

        if (!data.authenticated) {
          router.replace('/login');
          return;
        }

        await fetchItems();
      } catch {
        if (active) router.replace('/login');
      } finally {
        if (active) setAuthChecking(false);
      }
    }

    void initialise();

    return () => {
      active = false;
    };
  }, [router]);

  function resetForm() {
    setForm(initialForm);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);

    const input = document.getElementById('item-image') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotice({ type: 'error', message: 'Please select a valid image file.' });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, image: result }));
      setImagePreview(result);
    };

    reader.onerror = () => {
      setNotice({ type: 'error', message: 'Could not read this image.' });
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setNotice(null);

    const price = form.price.trim();
    const formattedPrice = price.toUpperCase().startsWith('LKR')
      ? price
      : `LKR ${price}`;

    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      price: formattedPrice,
    };

    try {
      const res = await fetch('/api/menu', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingId ? { id: editingId, ...payload } : payload
        ),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          editingId ? 'Could not update this item.' : 'Could not add this item.'
        );
      }

      const wasEditing = Boolean(editingId);
      resetForm();
      await fetchItems();

      setNotice({
        type: 'success',
        message: wasEditing
          ? 'Menu item updated successfully.'
          : 'New menu item added successfully.',
      });
    } catch (error) {
      console.error(error);
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(item: MenuItemType) {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      image: item.image,
    });
    setImagePreview(item.image);
    setShowForm(true);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    setDeletingId(id);
    setNotice(null);

    try {
      const res = await fetch(`/api/menu?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error('Could not delete this item.');
      }

      if (editingId === id) resetForm();
      await fetchItems();

      setNotice({
        type: 'success',
        message: `"${name}" was removed from the menu.`,
      });
    } catch (error) {
      console.error(error);
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong.',
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await fetch('/api/auth?action=logout');
    } catch (error) {
      console.error(error);
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (authChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F4F0]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B2A20] text-[#E7C9A9]">
            <Icon name="coffee" className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm text-stone-600">Loading dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F4F0] text-[#302218]">
      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#E9E0D7] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B2A20] text-[#E7C9A9]">
              <Icon name="coffee" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Elephantpath</p>
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-stone-500">
                Coffee Shop · Admin
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/orders"
              className="rounded-xl border border-[#E5DBD0] px-3 py-2.5 text-xs font-semibold text-[#5A4030] transition hover:bg-[#F8F5F1] sm:px-4 sm:text-sm"
            >
              Live orders
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E9E0D7] px-3 py-2.5 text-xs font-semibold text-stone-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60 sm:px-4 sm:text-sm"
            >
              <Icon name="logout" className="h-4 w-4" />
              {loggingOut ? 'Leaving…' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* Heading */}
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A6B52]">
              Café operations
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Menu management
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
              Manage your menu, update prices and keep your café offerings current.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (editingId) resetForm();
              else setShowForm((prev) => !prev);
            }}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#4B3527] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#352419] sm:self-auto"
          >
            <Icon name={showForm && !editingId ? 'close' : 'plus'} className="h-4 w-4" />
            {editingId ? 'Cancel editing' : showForm ? 'Close form' : 'Add menu item'}
          </button>
        </section>

        {/* Feedback */}
        {notice && (
          <div
            role="status"
            className={`mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
              notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            <p>{notice.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice(null)}
              className="shrink-0 rounded-md p-1 hover:bg-black/5"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Overview */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E9E0D7] bg-white p-5">
            <p className="text-xs font-medium text-stone-500">Total menu items</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{items.length}</p>
            <p className="mt-1 text-xs text-stone-500">Currently listed</p>
          </div>

          <div className="rounded-2xl border border-[#E9E0D7] bg-white p-5">
            <p className="text-xs font-medium text-stone-500">Menu categories</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {new Set(items.map((item) => item.category)).size}
            </p>
            <p className="mt-1 text-xs text-stone-500">Categories in use</p>
          </div>

          <div className="rounded-2xl border border-[#E9E0D7] bg-white p-5">
            <p className="text-xs font-medium text-stone-500">Search results</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{filteredItems.length}</p>
            <p className="mt-1 text-xs text-stone-500">Items matching your filters</p>
          </div>
        </section>

        {/* Add / Edit */}
        {showForm && (
          <section className="mb-9 overflow-hidden rounded-2xl border border-[#E9E0D7] bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-[#F0E9E2] px-5 py-5 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A6B52]">
                  Menu details
                </p>
                <h2 className="mt-1.5 text-lg font-semibold">
                  {editingId ? 'Edit menu item' : 'Add a new item'}
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Fill in the details shown to your customers.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                aria-label="Close form"
                className="rounded-lg p-2 text-stone-500 transition hover:bg-[#F6F1EC] hover:text-[#302218]"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <div>
                  <label htmlFor="item-name" className="mb-2 block text-xs font-semibold text-[#4C3A2D]">
                    Item name *
                  </label>
                  <input
                    id="item-name"
                    type="text"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Caramel Macchiato"
                    className="w-full rounded-xl border border-[#E5DBD0] bg-[#FDFCFB] px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-[#8A6B52] focus:ring-2 focus:ring-[#8A6B52]/10"
                  />
                </div>

                <div>
                  <label htmlFor="item-category" className="mb-2 block text-xs font-semibold text-[#4C3A2D]">
                    Category *
                  </label>
                  <select
                    id="item-category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-[#E5DBD0] bg-[#FDFCFB] px-4 py-3 text-sm outline-none transition focus:border-[#8A6B52] focus:ring-2 focus:ring-[#8A6B52]/10"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    {!CATEGORIES.includes(form.category) && (
                      <option value={form.category}>{form.category}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="item-price" className="mb-2 block text-xs font-semibold text-[#4C3A2D]">
                    Price (LKR) *
                  </label>
                  <input
                    id="item-price"
                    type="text"
                    required
                    maxLength={30}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="450.00"
                    className="w-full rounded-xl border border-[#E5DBD0] bg-[#FDFCFB] px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-[#8A6B52] focus:ring-2 focus:ring-[#8A6B52]/10"
                  />
                  <p className="mt-1.5 text-[11px] text-stone-500">
                    You can enter 450.00 or LKR 450.00.
                  </p>
                </div>

                <div>
                  <label htmlFor="item-image" className="mb-2 block text-xs font-semibold text-[#4C3A2D]">
                    Product image {!form.image && '*'}
                  </label>
                  <input
                    id="item-image"
                    type="file"
                    accept="image/*"
                    required={!form.image}
                    onChange={handleImageChange}
                    className="block w-full rounded-xl border border-[#E5DBD0] bg-[#FDFCFB] text-xs text-stone-600 file:mr-3 file:border-0 file:border-r file:border-[#E5DBD0] file:bg-[#F6F1EC] file:px-4 file:py-3 file:text-xs file:font-semibold file:text-[#5A4030] hover:file:bg-[#EEE4D9]"
                  />
                  <p className="mt-1.5 text-[11px] text-stone-500">
                    Choose a photo from your device.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="item-description" className="mb-2 block text-xs font-semibold text-[#4C3A2D]">
                    Description *
                  </label>
                  <textarea
                    id="item-description"
                    required
                    rows={3}
                    maxLength={500}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="A short description of the ingredients, flavour or item…"
                    className="w-full resize-y rounded-xl border border-[#E5DBD0] bg-[#FDFCFB] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-stone-400 focus:border-[#8A6B52] focus:ring-2 focus:ring-[#8A6B52]/10"
                  />
                  <p className="mt-1 text-right text-[11px] text-stone-400">
                    {form.description.length}/500
                  </p>
                </div>

                {imagePreview && (
                  <div className="md:col-span-2">
                    <p className="mb-2 text-xs font-semibold text-[#4C3A2D]">Image preview</p>
                    <div className="flex items-center gap-4 rounded-xl border border-[#E9E0D7] bg-[#FCFAF7] p-3">
                      <img
                        src={imagePreview}
                        alt="Menu item preview"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{form.name || 'Menu item'}</p>
                        <p className="mt-1 text-xs text-stone-500">{form.category}</p>
                        <p className="mt-1 text-xs font-semibold text-[#76553C]">
                          {form.price || 'Price not entered'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#F0E9E2] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="rounded-xl border border-[#E5DBD0] px-5 py-3 text-sm font-semibold text-stone-600 transition hover:bg-[#F8F5F1] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4B3527] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#352419] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Saving…' : editingId ? 'Save changes' : 'Add to menu'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Existing menu */}
        <section>
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A6B52]">
              Your catalogue
            </p>
            <h2 className="mt-1.5 text-xl font-semibold">Existing menu items</h2>
            <p className="mt-1 text-xs text-stone-500">
              Search, update or remove items from your café menu.
            </p>
          </div>

          {/* Search and filters */}
          <div className="mb-4 rounded-2xl border border-[#E9E0D7] bg-white p-3 sm:p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-stone-400">
                  <Icon name="search" className="h-4 w-4" />
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search menu items…"
                  aria-label="Search menu items"
                  className="w-full rounded-xl border border-[#E9E0D7] bg-[#FDFCFB] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-[#8A6B52] focus:ring-2 focus:ring-[#8A6B52]/10"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="rounded-xl border border-[#E9E0D7] bg-[#FDFCFB] px-4 py-3 text-sm outline-none transition focus:border-[#8A6B52] focus:ring-2 focus:ring-[#8A6B52]/10 md:w-64"
              >
                <option value="All">All categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 px-1">
              <p className="text-[11px] text-stone-500">
                Showing <span className="font-semibold text-[#4C3A2D]">{filteredItems.length}</span> of {items.length} items
              </p>
              {(search || categoryFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('All');
                  }}
                  className="text-xs font-semibold text-[#76553C] underline underline-offset-4 hover:text-[#3B2A20]"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {itemsLoading ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex animate-pulse gap-4 rounded-2xl border border-[#E9E0D7] bg-white p-4">
                  <div className="h-24 w-24 shrink-0 rounded-xl bg-stone-200" />
                  <div className="flex-1 py-1">
                    <div className="h-4 w-2/3 rounded bg-stone-200" />
                    <div className="mt-3 h-3 w-1/3 rounded bg-stone-100" />
                    <div className="mt-3 h-3 w-full rounded bg-stone-100" />
                    <div className="mt-4 h-3 w-1/2 rounded bg-stone-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DCCFC2] bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F1EC] text-[#6A4C38]">
                <Icon name={items.length === 0 ? 'coffee' : 'search'} />
              </div>
              <h3 className="mt-4 text-base font-semibold">
                {items.length === 0 ? 'Your menu is empty' : 'No matching items'}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
                {items.length === 0
                  ? 'Add your first drink or snack to start building your menu.'
                  : 'Try a different search or category, or clear the current filters.'}
              </p>
              {items.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4B3527] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#352419]"
                >
                  <Icon name="plus" className="h-4 w-4" />
                  Add first item
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('All');
                  }}
                  className="mt-5 rounded-xl border border-[#E5DBD0] px-5 py-2.5 text-sm font-semibold text-[#5A4030] transition hover:bg-[#F8F5F1]"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredItems.map((item) => (
                <article
                  key={item._id}
                  className="flex min-w-0 gap-4 rounded-2xl border border-[#E9E0D7] bg-white p-4 transition-shadow hover:shadow-[0_6px_22px_rgba(48,32,21,0.055)] sm:p-5"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F6F1EC] sm:h-28 sm:w-28">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone-400">
                        <Icon name="image" className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="break-words text-sm font-semibold leading-5 text-[#302218] sm:text-base">
                      {item.name}
                    </h3>
                    <p className="mt-1.5 text-sm font-bold text-[#76553C]">{item.price}</p>
                    <span className="mt-2.5 w-fit max-w-full rounded-md bg-[#F6F1EC] px-2 py-1 text-[10px] leading-4 text-[#6A4C38]">
                      {item.category}
                    </span>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-500">
                      {item.description}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5DBD0] px-3 py-2 text-xs font-semibold text-[#5A4030] transition hover:bg-[#F8F5F1]"
                      >
                        <Icon name="edit" className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id, item.name)}
                        disabled={deletingId === item._id}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-stone-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                      >
                        <Icon name="trash" className="h-3.5 w-3.5" />
                        {deletingId === item._id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 flex flex-col gap-2 border-t border-[#E7DED5] py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-stone-500">
            <span className="font-semibold text-[#5A4030]">Elephantpath Coffee Shop</span>
            {' '}· Menu administration
          </p>
          <Link href="/" className="text-xs font-medium text-stone-500 transition hover:text-[#5A4030]">
            View customer menu →
          </Link>
        </footer>
      </div>
    </main>
  );
}
