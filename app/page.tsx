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

const CATEGORIES = [
  "All",
  "Hot Coffee",
  "Cold Coffee / Iced Drinks",
  "Tea & Other Drinks",
  "Snacks & Pastries",
  "Special / Seasonal Items",
];

export default function HomePage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Customer Authentication State
  const [customer, setCustomer] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    fetchItems();
    
    // Ensure cart drawer is closed on load
    setIsCartOpen(false);
    
    // Check if an order was just placed (clean up cart if needed)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('clearCart') === 'true') {
      localStorage.removeItem('brew_cart');
      setCart([]);
      window.history.replaceState({}, '', '/');
    } else {
      // Load Saved Cart normally
      const savedCart = localStorage.getItem('brew_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    }

    // Load Logged-in Customer Session
    const savedCustomer = localStorage.getItem('brew_customer');
    if (savedCustomer) setCustomer(JSON.parse(savedCustomer));
  }, []);

  const saveCart = (newCart: CartItemType[]) => {
    setCart(newCart);
    localStorage.setItem('brew_cart', JSON.stringify(newCart));
  };

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/menu');
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('brew_customer');
    setCustomer(null);
    window.location.reload();
  };

  const filteredItems = activeCategory === "All"
    ? items
    : items.filter((item) => item.category === activeCategory);

  const addToCart = (item: MenuItemType) => {
    const existing = cart.find((c) => c._id === item._id);
    let updatedCart: CartItemType[];
    if (existing) {
      updatedCart = cart.map((c) => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
    } else {
      updatedCart = [...cart, { ...item, quantity: 1 }];
    }
    saveCart(updatedCart);

    setToastMessage(`Added ${item.name} to cart!`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item._id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItemType[];
    saveCart(updated);
  };

  const totalAmount = cart.reduce((sum, item) => {
    const cleanPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    return sum + cleanPrice * item.quantity;
  }, 0);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] flex flex-col justify-between relative selection:bg-[#D2A072] selection:text-[#120B08]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#D2A072] text-[#120B08] font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div>
        <header className="border-b border-[#2E221B] px-3 sm:px-6 md:px-12 py-3.5 flex justify-between items-center bg-[#120B08]/90 backdrop-blur-md sticky top-0 z-40 gap-2">
          <Link href="/" className="text-base sm:text-xl md:text-2xl font-black tracking-wider text-white flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#2E221B] border border-[#3D2D24] flex items-center justify-center text-xs sm:text-sm shadow-inner">
              ☕
            </span>
            <span className="bg-gradient-to-r from-white via-[#EADCCF] to-[#D2A072] bg-clip-text text-transparent">
              BREW & BEAN
            </span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {customer ? (
              <div className="flex items-center gap-1.5 sm:gap-2.5 bg-[#1C1410] border border-[#2E221B] px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl shadow-lg">
                {/* Real-time Order Notification Bell */}
                <OrderNotificationBell />

                <div className="h-3.5 w-[1px] bg-[#2E221B] hidden lg:block" />

                <span className="text-xs text-[#A39284] hidden lg:inline">
                  Welcome, <span className="text-[#D2A072] font-bold">{customer.name}</span>
                </span>
                
                <Link
                  href="/my-orders"
                  className="bg-[#D2A072]/10 border border-[#D2A072]/30 text-[#D2A072] hover:bg-[#D2A072] hover:text-[#120B08] px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1"
                >
                  📋 <span className="hidden sm:inline">My</span> Orders
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-[11px] sm:text-xs text-red-400 hover:text-red-300 border border-red-900/40 bg-red-950/20 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                href="/customer-login"
                className="bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-bold text-xs px-3 sm:px-4 py-2 rounded-xl transition shadow-lg whitespace-nowrap"
              >
                Sign In
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-[#1C1410] border border-[#2E221B] hover:border-[#D2A072]/50 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition shrink-0"
            >
              🛒 <span className="hidden sm:inline">Cart</span>
              {totalCartCount > 0 && (
                <span className="bg-[#D2A072] text-[#120B08] px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-black">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center py-10 sm:py-12 md:py-16 px-4 sm:px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Crafted Coffee & Cozy Moments
          </h2>
          <p className="text-[#A39284] text-xs sm:text-sm md:text-base leading-relaxed">
            Order online via Drive-Thru, In-Shop QR Scan, or Home Delivery!
          </p>
        </section>

        {/* Category Filter Pills */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8 sm:mb-10 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 justify-start md:justify-center min-w-max pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#D2A072] text-[#120B08] shadow-lg shadow-[#D2A072]/10'
                    : 'bg-[#1C1410] text-[#A39284] hover:text-white border border-[#2E221B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid Section */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
          {loading ? (
            <div className="text-center py-20 text-[#A39284] text-xs">Loading menu items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-[#1C1410] border border-[#2E221B] rounded-2xl max-w-md mx-auto">
              <p className="text-[#A39284] text-xs">No items found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredItems.map((item) => {
                const cartItem = cart.find((c) => c._id === item._id);
                const quantity = cartItem ? cartItem.quantity : 0;

                return (
                  <div
                    key={item._id}
                    className="bg-[#1C1410] border border-[#2E221B] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-[#D2A072]/40 transition duration-300"
                  >
                    <div className="h-44 sm:h-48 overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-3 right-3 bg-[#0F0A07]/80 backdrop-blur-md text-[#D2A072] text-[10px] font-bold px-3 py-1 rounded-full border border-[#2E221B]">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-bold text-white text-base">{item.name}</h3>
                          <span className="text-[#D2A072] font-extrabold text-sm whitespace-nowrap">
                            {item.price}
                          </span>
                        </div>
                        <p className="text-[#A39284] text-xs leading-relaxed mb-4 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Clean, Segmented Cart Controller */}
                      {quantity === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full h-10 bg-[#2E221B] hover:bg-[#D2A072] text-[#D2A072] hover:text-[#120B08] font-bold text-xs rounded-xl transition duration-300 flex items-center justify-center shadow-sm"
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-2 h-10">
                          {/* Quantity Stepper */}
                          <div className="flex-1 flex items-center justify-between bg-[#D2A072] text-[#120B08] h-full rounded-xl px-2 font-black text-xs shadow-md">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-[#120B08]/10 rounded-lg text-sm transition"
                            >
                              −
                            </button>

                            <span className="text-xs font-black tracking-wide">
                              {quantity} in Cart
                            </span>

                            <button
                              onClick={() => addToCart(item)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-[#120B08]/10 rounded-lg text-sm transition"
                            >
                              +
                            </button>
                          </div>

                          {/* Quick Clear Trash Button */}
                          <button
                            onClick={() => {
                              const updated = cart.filter((c) => c._id !== item._id);
                              saveCart(updated);
                            }}
                            title="Remove item"
                            className="w-10 h-10 flex items-center justify-center bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-800/40 rounded-xl transition shrink-0"
                          >
                            🗑️
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
      </div>

      {/* Cart Drawer (Responsive Overlay) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition">
          <div className="w-full sm:max-w-md bg-[#16100D] border-l border-[#2E221B] h-full flex flex-col p-4 sm:p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-[#2E221B]">
              <h2 className="text-lg font-bold text-white">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[#A39284] hover:text-white text-sm font-bold p-1">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-[#A39284] text-xs">Your cart is empty.</div>
              ) : (
                cart.map((cartItem) => (
                  <div key={cartItem._id} className="bg-[#1C1410] border border-[#2E221B] rounded-xl p-3 flex items-center gap-3">
                    <img src={cartItem.image} alt={cartItem.name} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-xs truncate">{cartItem.name}</h4>
                      <p className="text-[#D2A072] text-xs font-semibold">{cartItem.price}</p>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0F0A07] border border-[#2E221B] rounded-lg px-2 py-1 shrink-0">
                      <button onClick={() => updateQuantity(cartItem._id, -1)} className="text-xs text-[#A39284] hover:text-white px-1">-</button>
                      <span className="text-xs font-bold text-white">{cartItem.quantity}</span>
                      <button onClick={() => updateQuantity(cartItem._id, 1)} className="text-xs text-[#A39284] hover:text-white px-1">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-[#2E221B] pt-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#A39284]">Total:</span>
                  <span className="text-[#D2A072] font-extrabold text-base">LKR {totalAmount.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-3.5 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-bold rounded-xl text-xs transition duration-300 shadow-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#2E221B] py-6 sm:py-8 text-center text-xs text-[#A39284] px-4">
        <p>© 2026 Brew & Bean Coffee Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}