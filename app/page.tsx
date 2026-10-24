'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OrderNotificationBell from '../components/OrderNotificationBell';

interface MenuItemType {
  _id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
}

interface CartItemType extends MenuItemType {
  quantity: number;
}

interface CustomerType {
  name: string;
  phone: string;
}

const CATEGORIES = [
  'All',
  'Hot Coffee',
  'Cold Coffee / Iced Drinks',
  'Tea & Other Drinks',
  'Snacks & Pastries',
  'Special / Seasonal Items',
];

const parsePrice = (price: string) =>
  Number.parseFloat(price.replace(/[^0-9.]/g, '')) || 0;

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

function Icon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.65,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
  switch (name) {
    case 'coffee':
      return (
        <svg {...props}>
          <path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z" />
          <path d="M17 10h2a2 2 0 0 1 0 4h-2M8 3c-2 2 2 3 0 5m5-5c-2 2 2 3 0 5" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...props}>
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'minus':
      return (
        <svg {...props}>
          <path d="M5 12h14" />
        </svg>
      );
    case 'close':
      return (
        <svg {...props}>
          <path d="m18 6-12 12M6 6l12 12" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...props}>
          <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...props}>
          <path d="M10 17l5-5-5-5m5 5H3" />
          <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case 'bag':
      return (
        <svg {...props}>
          <path d="M5 8h14l1 13H4L5 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      );
    default:
      return null;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [menuError, setMenuError] = useState(false);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  // Safe client-side date initialization to eliminate hydration errors
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    let mounted = true;
    async function initialise() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('clearCart') === 'true') {
          localStorage.removeItem('brew_cart');
          window.history.replaceState({}, '', '/');
        } else {
          const savedCart = localStorage.getItem('brew_cart');
          if (savedCart) {
            const parsed: unknown = JSON.parse(savedCart);
            if (Array.isArray(parsed)) {
              setCart(parsed as CartItemType[]);
            }
          }
        }
        const savedCustomer = localStorage.getItem('brew_customer');
        if (savedCustomer) {
          setCustomer(JSON.parse(savedCustomer) as CustomerType);
        }
      } catch (error) {
        console.error('Unable to restore saved session:', error);
      }
      try {
        const res = await fetch('/api/menu');
        if (!res.ok) throw new Error('Could not load menu');
        const json = await res.json();
        if (!mounted) return;
        if (json.success && Array.isArray(json.data)) {
          setItems(json.data);
          setMenuError(false);
        } else {
          setMenuError(true);
        }
      } catch (error) {
        console.error('Menu loading failed:', error);
        if (mounted) setMenuError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    initialise();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!isCartOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen]);

  const saveCart = (newCart: CartItemType[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('brew_cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Unable to save cart:', error);
      setToastMessage('Unable to save your cart. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('brew_customer');
    setCustomer(null);
    setMobileMenuOpen(false);
    window.location.reload();
  };

  const addToCart = (item: MenuItemType) => {
    const existing = cart.find((entry) => entry._id === item._id);
    const updated = existing
      ? cart.map((entry) =>
          entry._id === item._id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        )
      : [...cart, { ...item, quantity: 1 }];
    saveCart(updated);
    setToastMessage(`${item.name} added to your bag`);
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item._id !== id) return item;
        const quantity = item.quantity + delta;
        return quantity > 0 ? { ...item, quantity } : null;
      })
      .filter((item): item is CartItemType => item !== null);
    saveCart(updated);
  };

  const removeFromCart = (id: string) => {
    saveCart(cart.filter((item) => item._id !== id));
    setToastMessage('Item removed from your bag');
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0
  );

  const totalCartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const filteredItems =
    activeCategory === 'All'
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAF7F2] text-[#2C221E] selection:bg-[#D4A373] selection:text-[#2C221E] font-sans antialiased scroll-smooth">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-6 z-[90] flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#D4A373]/30 bg-[#2C221E] px-6 py-3.5 text-xs font-semibold text-[#FAF7F2] shadow-2xl backdrop-blur-md animate-fade-in"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D4A373] text-[#2C221E]">
            <Icon name="check" size={12} />
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-[#EADFCF] bg-[#FAF7F2]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link
            href="/"
            className="flex items-center gap-3.5 group"
            aria-label="Elephantpath Coffee"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2C221E] text-[#D4A373] shadow-md transition-transform duration-300 group-hover:scale-105">
              <span className="text-xl" aria-hidden="true">🐘</span>
            </span>
            <div>
              <span className="block text-lg font-black tracking-widest text-[#2C221E]">
                ELEPHANTPATH
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.25em] text-[#8C7A6B]">
                Crafted Coffee Rituals
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#home"
              className="text-xs font-bold uppercase tracking-wider text-[#66564A] transition hover:text-[#D4A373]"
            >
              Home
            </a>
            <a
              href="#menu"
              className="text-xs font-bold uppercase tracking-wider text-[#66564A] transition hover:text-[#D4A373]"
            >
              Our Menu
            </a>
            <a
              href="#story"
              className="text-xs font-bold uppercase tracking-wider text-[#66564A] transition hover:text-[#D4A373]"
            >
              Story & Art
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {customer ? (
              <>
                <div className="hidden items-center gap-3 lg:flex">
                  <OrderNotificationBell />
                  <span className="h-5 w-px bg-[#EADFCF]" />
                  <span className="text-xs text-[#66564A]">
                    Welcome, <strong className="text-[#2C221E]">{customer.name}</strong>
                  </span>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    href="/my-orders"
                    className="rounded-xl border border-[#EADFCF] px-4 py-2 text-xs font-bold transition hover:border-[#D4A373] hover:bg-white"
                  >
                    My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Log out"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#EADFCF] text-[#8C7A6B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="logout" size={16} />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/customer-login"
                className="hidden rounded-xl border border-[#EADFCF] px-4 py-2.5 text-xs font-bold transition hover:bg-white sm:block"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-11 items-center gap-2.5 rounded-xl bg-[#2C221E] px-4 text-xs font-bold text-white transition hover:bg-[#3D302A] shadow-md"
              aria-label={`Open shopping cart, ${totalCartCount} items`}
            >
              <Icon name="bag" size={18} />
              <span className="hidden sm:inline">Bag</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4A373] px-1 text-[10px] font-black text-[#2C221E]">
                {totalCartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EADFCF] md:hidden"
            >
              <span className="text-lg">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#EADFCF] bg-[#FAF7F2] px-6 py-5 md:hidden space-y-3">
            <nav className="flex flex-col gap-2 text-sm font-semibold">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="py-2">Home</a>
              <a href="#menu" onClick={() => setMobileMenuOpen(false)} className="py-2">Our Menu</a>
              <a href="#story" onClick={() => setMobileMenuOpen(false)} className="py-2">Story & Art</a>
              {customer ? (
                <>
                  <Link href="/my-orders" onClick={() => setMobileMenuOpen(false)} className="py-2">My Orders</Link>
                  <button onClick={handleLogout} className="text-left py-2 text-red-600">Log out</button>
                </>
              ) : (
                <Link href="/customer-login" onClick={() => setMobileMenuOpen(false)} className="py-2">Sign in</Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-[#2C221E] py-20 text-white lg:py-28">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-[#D4A373]/10 blur-3xl pointer-events-none" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-12">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#D4A373]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#EADFCF]">
                Artisanal Coffee & Express Service
              </span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Slow crafted, <br />
              <span className="font-serif italic font-normal text-[#D4A373]">
                swiftly served.
              </span>
            </h1>

            <p className="max-w-lg text-sm sm:text-base leading-relaxed text-[#C2B2A3]">
              Every batch at Elephantpath is micro-roasted to capture authentic flavors. Pick up seamlessly via Drive-Thru Express, table QR, or home delivery.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#menu"
                className="inline-flex items-center gap-3 rounded-xl bg-[#D4A373] px-7 py-4 text-xs font-black uppercase tracking-wider text-[#2C221E] transition hover:bg-[#c29263] shadow-lg"
              >
                Explore Menu
                <Icon name="arrow" size={16} />
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=85"
                alt="Elephantpath Espresso Crafting"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="font-serif text-2xl italic text-white">The Daily Cup</span>
                <p className="text-xs text-[#C2B2A3] mt-1">Made fresh for your journey ahead.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Menu Section */}
      <main id="menu" className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-24 scroll-mt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4A373]">
              Handcrafted Menu
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#2C221E] mt-1">
              Find Your <span className="font-serif italic font-normal text-[#D4A373]">Flavor.</span>
            </h2>
          </div>
          <span className="text-xs font-bold text-[#8C7A6B]">
            Showing {filteredItems.length} curated options
          </span>
        </div>

        {/* Categories */}
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-4 mb-8">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#2C221E] text-white shadow-md'
                    : 'bg-white border border-[#EADFCF] text-[#66564A] hover:border-[#D4A373]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : menuError ? (
          <div className="py-16 text-center text-sm text-[#8C7A6B]">
            Unable to load menu at this moment. Please refresh your browser.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => {
              const inCart = cart.find((c) => c._id === item._id);
              const qty = inCart?.quantity ?? 0;

              return (
                <div
                  key={item._id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EADFCF] bg-white p-4 transition duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#FAF7F2]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#8C7A6B]">
                          <Icon name="coffee" size={32} />
                        </div>
                      )}
                      {qty > 0 && (
                        <span className="absolute top-3 right-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#D4A373] px-2 text-xs font-extrabold text-[#2C221E]">
                          {qty}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[#2C221E] text-sm">{item.name}</h3>
                      <span className="text-xs font-black text-[#D4A373] whitespace-nowrap">{item.price}</span>
                    </div>

                    <p className="mt-1 text-xs text-[#8C7A6B] line-clamp-2 leading-relaxed">
                      {item.description || 'Artisanal recipe crafted fresh daily.'}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-[#FAF7F2] pt-3">
                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="w-full py-2.5 rounded-xl border border-[#EADFCF] text-xs font-bold text-[#2C221E] transition hover:bg-[#2C221E] hover:text-white flex items-center justify-center gap-2"
                      >
                        <Icon name="plus" size={14} /> Add to Bag
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-[#FAF7F2] rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, -1)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white text-[#2C221E]"
                        >
                          <Icon name="minus" size={14} />
                        </button>
                        <span className="text-xs font-bold">{qty}</span>
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white text-[#2C221E]"
                        >
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Story & Art / Philosophy Section */}
      <section id="story" className="scroll-mt-20 border-y border-[#EADFCF] bg-[#F2ECE1] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4A373]">
              Story & Art
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#2C221E]">
              Crafted with passion, <br />
              <span className="font-serif italic font-normal text-[#D4A373]">
                inspired by tradition.
              </span>
            </h2>
            <p className="text-sm leading-relaxed text-[#66564A]">
              Elephantpath is more than just coffee. It is a daily ritual blending rich heritage with modern speed. Every blend tells a story of careful micro-roasting, sustainable sourcing, and genuine care for your everyday moments.
            </p>
            <div className="pt-2">
              <a
                href="#menu"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2C221E] px-6 py-3.5 text-xs font-extrabold text-white transition hover:bg-[#3D302A]"
              >
                Experience Our Brews <Icon name="arrow" size={16} />
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#EADFCF] shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80"
              alt="Coffee Art and Philosophy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EADFCF] bg-[#2C221E] py-12 text-white">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-12">
          <div className="flex items-center gap-3">
            <span className="text-xl">🐘</span>
            <span className="text-xs font-black tracking-widest uppercase">ELEPHANTPATH COFFEE</span>
          </div>

          <p className="text-[11px] text-[#C2B2A3]">
            © {currentYear ?? 2026} Elephantpath Coffee Shop. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCartOpen(false);
          }}
        >
          <aside className="w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between border-b border-[#EADFCF] pb-4">
                <div className="flex items-center gap-2">
                  <Icon name="bag" size={20} />
                  <h2 className="font-extrabold text-[#2C221E]">Your Shopping Bag</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-[#8C7A6B] hover:text-[#2C221E]"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-xs text-[#8C7A6B] text-center py-12">Your bag is currently empty.</p>
                ) : (
                  cart.map((c) => (
                    <div key={c._id} className="flex items-center justify-between border-b border-[#EADFCF]/60 pb-3">
                      <div className="flex items-center gap-3">
                        <img src={c.image} alt={c.name} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <p className="text-xs font-bold text-[#2C221E]">{c.name}</p>
                          <p className="text-[10px] text-[#8C7A6B]">Qty: {c.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-[#D4A373]">
                          LKR {formatPrice(parsePrice(c.price) * c.quantity)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(c._id)}
                          className="text-[10px] text-red-500 hover:underline mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-[#EADFCF] pt-4 space-y-4">
              <div className="flex justify-between text-sm font-extrabold text-[#2C221E]">
                <span>Total Amount</span>
                <span className="text-[#D4A373]">LKR {formatPrice(totalAmount)}</span>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/checkout');
                }}
                className="w-full py-4 bg-[#2C221E] hover:bg-[#3D302A] text-white font-extrabold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
              >
                Proceed to Checkout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}