'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartItemType {
  _id: string;
  name: string;
  price: string;
  quantity: number;
  image: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItemType[]>([]);
  
  // Auth state
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Order Details state
  const [orderType, setOrderType] = useState<'Drive-Thru' | 'In-Shop QR' | 'Delivery'>('Drive-Thru');
  const [pickupTime, setPickupTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('brew_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    // Load existing user login if saved
    const savedUser = localStorage.getItem('brew_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const totalAmount = cart.reduce((sum, item) => {
    const cleanPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    return sum + cleanPrice * item.quantity;
  }, 0);

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !phoneInput) return;
    const userData = { name: nameInput, phone: phoneInput };
    setUser(userData);
    localStorage.setItem('brew_user', JSON.stringify(userData));
  };

  const handleGoogleLoginMock = () => {
    const userData = { name: 'Piyu Oshadi', phone: '+94 77 123 4567' };
    setUser(userData);
    localStorage.setItem('brew_user', JSON.stringify(userData));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please log in or enter your contact details first.');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    if (orderType === 'Drive-Thru' && !pickupTime) {
      alert('Please select an estimated Drive-Thru pickup time.');
      return;
    }
    if (orderType === 'Delivery' && !deliveryAddress) {
      alert('Please provide a delivery address.');
      return;
    }

    setLoading(true);

    const orderData = {
      customerName: user.name,
      customerPhone: user.phone,
      orderType,
      pickupTime: orderType === 'Drive-Thru' ? pickupTime : undefined,
      deliveryAddress: orderType === 'Delivery' ? deliveryAddress : undefined,
      items: cart.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      totalAmount,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const json = await res.json();
      if (json.success) {
        setOrderSubmitted(true);
        localStorage.removeItem('brew_cart');
      } else {
        alert('Failed to place order.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1C1410] border border-[#2E221B] rounded-2xl p-8 text-center shadow-xl">
          <div className="text-5xl mb-4">☕🎉</div>
          <h1 className="text-2xl font-bold text-white mb-2">Order Received!</h1>
          <p className="text-[#A39284] text-xs leading-relaxed mb-6">
            Thank you, <span className="text-[#D2A072] font-semibold">{user?.name}</span>! Your order is sent to our baristas and is being prepared.
          </p>
          <div className="bg-[#0F0A07] border border-[#2E221B] rounded-xl p-4 text-left text-xs mb-6 space-y-2">
            <p className="text-white font-bold">Fulfillment: <span className="text-[#D2A072]">{orderType}</span></p>
            {pickupTime && <p className="text-[#A39284]">Scheduled Time: <span className="text-white">{pickupTime}</span></p>}
            {deliveryAddress && <p className="text-[#A39284]">Delivery To: <span className="text-white">{deliveryAddress}</span></p>}
            <p className="text-[#A39284]">Total: <span className="text-[#D2A072] font-bold">LKR {totalAmount.toFixed(2)}</span></p>
          </div>
          <Link
            href="/"
            className="block w-full py-3 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-bold rounded-xl text-xs transition"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-[#2E221B] pb-4">
          <h1 className="text-2xl font-black text-white">☕ Complete Your Order</h1>
          <Link href="/" className="text-xs text-[#A39284] hover:text-white underline">
            ← Back to Menu
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Auth & Order Options */}
          <div className="space-y-6">
            {/* Step 1: User Login */}
            <div className="bg-[#1C1410] border border-[#2E221B] rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-[#D2A072]">
                1. Customer Details
              </h2>

              {user ? (
                <div className="flex justify-between items-center bg-[#0F0A07] border border-[#2E221B] rounded-xl p-4">
                  <div>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-xs text-[#A39284]">{user.phone}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUser(null);
                      localStorage.removeItem('brew_user');
                    }}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleGoogleLoginMock}
                    className="w-full py-2.5 bg-white text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.37 7.36 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.63 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
                    Sign in with Google
                  </button>

                  <div className="relative text-center my-2">
                    <span className="bg-[#1C1410] px-3 text-[10px] text-[#A39284]">OR REGISTER WITH PHONE</span>
                  </div>

                  <form onSubmit={handleQuickLogin} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D2A072]"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number (e.g. 077 123 4567)"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D2A072]"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#2E221B] hover:bg-[#3D2D24] text-white font-bold rounded-xl text-xs transition"
                    >
                      Save Details
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Step 2: Choose Fulfillment Method */}
            <div className="bg-[#1C1410] border border-[#2E221B] rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-[#D2A072]">
                2. Select Order Method
              </h2>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { id: 'Drive-Thru', label: '🚗 Drive-Thru' },
                  { id: 'In-Shop QR', label: '☕ In-Shop QR' },
                  { id: 'Delivery', label: '🛵 Delivery' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setOrderType(m.id as any)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${
                      orderType === m.id
                        ? 'bg-[#D2A072] text-[#120B08] border-[#D2A072]'
                        : 'bg-[#0F0A07] text-[#A39284] border-[#2E221B] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {orderType === 'Drive-Thru' && (
                <div>
                  <label className="block text-xs text-[#A39284] mb-1">Estimated Pickup Time</label>
                  <input
                    type="time"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D2A072]"
                  />
                  <p className="text-[10px] text-[#A39284] mt-1">Order will be ready when you drive up to the counter!</p>
                </div>
              )}

              {orderType === 'In-Shop QR' && (
                <p className="text-xs text-[#A39284] bg-[#0F0A07] p-3 rounded-xl border border-[#2E221B]">
                  Your order will be prepared immediately for counter pickup.
                </p>
              )}

              {orderType === 'Delivery' && (
                <div>
                  <label className="block text-xs text-[#A39284] mb-1">Delivery Address</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter full address details..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D2A072]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Submit */}
          <div className="bg-[#1C1410] border border-[#2E221B] rounded-2xl p-6 flex flex-col justify-between h-fit">
            <div>
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-[#D2A072]">
                Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} items)
              </h2>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-xs text-[#A39284]">No items in cart.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item._id} className="flex justify-between items-center text-xs border-b border-[#2E221B]/50 pb-2">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <p className="text-white font-bold">{item.name}</p>
                          <p className="text-[#A39284]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-[#D2A072] font-semibold">{item.price}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-[#2E221B] pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-xs text-[#A39284]">
                  <span>Subtotal</span>
                  <span>LKR {totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white">
                  <span>Total Amount</span>
                  <span className="text-[#D2A072]">LKR {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || cart.length === 0}
              className="w-full py-3.5 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-bold text-xs rounded-xl transition duration-300 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Submitting Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}