'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    fetchItems();
    const savedCart = localStorage.getItem('brew_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
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

  const filteredItems = activeCategory === "All"
    ? items
    : items.filter((item) => item.category === activeCategory);

  // Add Item without auto-navigating
  const addToCart = (item: MenuItemType) => {
    const existing = cart.find((c) => c._id === item._id);
    let updatedCart: CartItemType[];
    if (existing) {
      updatedCart = cart.map((c) => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
    } else {
      updatedCart = [...cart, { ...item, quantity: 1 }];
    }
    saveCart(updatedCart);

    // Show temporary toast notification
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
    <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] flex flex-col justify-between relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#D2A072] text-[#120B08] font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <header className="border-b border-[#2E221B] px-6 py-6 md:px-12 flex justify-between items-center bg-[#120B08]/60 backdrop-blur-md sticky top-0 z-40">
          <h1 className="text-xl md:text-2xl font-black tracking-wider text-white">☕ BREW & BEAN</h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-[#1C1410] border border-[#2E221B] hover:border-[#D2A072]/50 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition"
            >
              🛒 Cart
              {totalCartCount > 0 && (
                <span className="bg-[#D2A072] text-[#120B08] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                  {totalCartCount}
                </span>
              )}
            </button>

            <Link
              href="/admin"
              className="text-xs text-[#A39284] hover:text-[#D2A072] border border-[#2E221B] hover:border-[#D2A072]/50 px-3 py-2 rounded-xl transition"
            >
              Admin Portal
            </Link>
          </div>
        </header>

        <section className="text-center py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Crafted Coffee & Cozy Moments
          </h2>
          <p className="text-[#A39284] text-sm md:text-base leading-relaxed">
            Order online via Drive-Thru, In-Shop QR Scan, or Home Delivery!
          </p>
        </section>

        {/* Category Filter Pills */}
        <div className="max-w-6xl mx-auto px-6 mb-10 overflow-x-auto">
          <div className="flex gap-2 justify-start md:justify-center min-w-max pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition duration-300 ${
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
        <main className="max-w-6xl mx-auto px-6 mb-20">
          {loading ? (
            <div className="text-center py-20 text-[#A39284]">Loading menu items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-[#1C1410] border border-[#2E221B] rounded-2xl max-w-md mx-auto">
              <p className="text-[#A39284] text-sm">No items found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-[#1C1410] border border-[#2E221B] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-[#D2A072]/40 transition duration-300"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 right-3 bg-[#0F0A07]/80 backdrop-blur-md text-[#D2A072] text-[10px] font-bold px-3 py-1 rounded-full border border-[#2E221B]">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-white text-base">{item.name}</h3>
                        <span className="text-[#D2A072] font-extrabold text-sm whitespace-nowrap">
                          {item.price}
                        </span>
                      </div>
                      <p className="text-[#A39284] text-xs leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    <button
                      onClick={() => addToCart(item)}
                      className="w-full py-2.5 bg-[#2E221B] hover:bg-[#D2A072] text-[#D2A072] hover:text-[#120B08] font-bold text-xs rounded-xl transition duration-300"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition">
          <div className="w-full max-w-md bg-[#16100D] border-l border-[#2E221B] h-full flex flex-col p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-[#2E221B]">
              <h2 className="text-lg font-bold text-white">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[#A39284] hover:text-white text-sm font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-[#A39284] text-xs">Your cart is empty.</div>
              ) : (
                cart.map((cartItem) => (
                  <div key={cartItem._id} className="bg-[#1C1410] border border-[#2E221B] rounded-xl p-3 flex items-center gap-3">
                    <img src={cartItem.image} alt={cartItem.name} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-xs">{cartItem.name}</h4>
                      <p className="text-[#D2A072] text-xs font-semibold">{cartItem.price}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#0F0A07] border border-[#2E221B] rounded-lg px-2 py-1">
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
                  className="w-full py-3 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-bold rounded-xl text-xs transition duration-300"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="border-t border-[#2E221B] py-8 text-center text-xs text-[#A39284]">
        <p>© 2026 Brew & Bean Coffee Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}