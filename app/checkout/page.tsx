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
  const [customer, setCustomer] = useState<{ name: string; phone: string } | null>(null);

  const [orderType, setOrderType] = useState<'Drive-Thru' | 'In-Shop QR' | 'Delivery'>('Drive-Thru');
  const [pickupTime, setPickupTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  useEffect(() => {
    // 1. Check Customer Login Status
    const savedCustomer = localStorage.getItem('brew_customer');
    if (!savedCustomer) {
      router.push('/customer-login');
      return;
    }
    setCustomer(JSON.parse(savedCustomer));

    // 2. Load Cart Items
    const savedCart = localStorage.getItem('brew_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [router]);

  const totalAmount = cart.reduce((sum, item) => {
    const cleanPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    return sum + cleanPrice * item.quantity;
  }, 0);

  const handlePlaceOrder = async () => {
    if (!customer) return;
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    if (orderType === 'Drive-Thru' && !pickupTime) {
      alert('Please specify your estimated pickup time.');
      return;
    }
    if (orderType === 'Delivery' && !deliveryAddress) {
      alert('Please enter your delivery address.');
      return;
    }

    setLoading(true);

    const orderData = {
      customerName: customer.name,
      customerPhone: customer.phone,
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
      alert('An error occurred while sending the order.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1C1410] border border-[#2E221B] rounded-2xl p-8 text-center shadow-xl">
          <div className="text-5xl mb-4">☕🎉</div>
          <h1 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-[#A39284] text-xs leading-relaxed mb-6">
            Thank you, <span className="text-[#D2A072] font-semibold">{customer?.name}</span>! Your order has been dispatched to the coffee bar.
          </p>

          <div className="bg-[#0F0A07] border border-[#2E221B] rounded-xl p-4 text-left text-xs mb-6 space-y-2">
            <p className="text-white font-bold">Fulfillment: <span className="text-[#D2A072]">{orderType}</span></p>
            {pickupTime && <p className="text-[#A39284]">Pickup Time: <span className="text-white">{pickupTime}</span></p>}
            {deliveryAddress && <p className="text-[#A39284]">Address: <span className="text-white">{deliveryAddress}</span></p>}
            <p className="text-[#A39284]">Total Paid: <span className="text-[#D2A072] font-bold">LKR {totalAmount.toFixed(2)}</span></p>
          </div>

          <Link
            href="/"
            className="block w-full py-3 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-bold rounded-xl text-xs transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-[#2E221B] pb-4">
          <div>
            <h1 className="text-2xl font-black text-white">☕ Complete Your Order</h1>
            {customer && (
              <p className="text-xs text-[#A39284] mt-1">
                Ordering as <span className="text-[#D2A072] font-semibold">{customer.name}</span> ({customer.phone})
              </p>
            )}
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('brew_customer');
              router.push('/customer-login');
            }}
            className="text-xs text-red-400 hover:underline"
          >
            Switch Account
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fulfillment Method Selection */}
          <div className="bg-[#1C1410] border border-[#2E221B] rounded-2xl p-6 h-fit">
            <h2 className="text-xs font-bold text-[#D2A072] uppercase tracking-wider mb-4">
              1. Select Fulfillment Method
            </h2>

            <div className="space-y-3 mb-6">
              {[
                { id: 'Drive-Thru', label: '🚗 Drive-Thru', desc: 'Scan banner QR & pick up at your chosen time' },
                { id: 'In-Shop QR', label: '☕ In-Shop QR', desc: 'Ordered in store for quick counter pickup' },
                { id: 'Delivery', label: '🛵 Delivery', desc: 'Fresh coffee delivered directly to your door' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setOrderType(m.id as any)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    orderType === m.id
                      ? 'bg-[#2E221B] border-[#D2A072] text-white'
                      : 'bg-[#0F0A07] border-[#2E221B] text-[#A39284] hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold text-white mb-0.5">{m.label}</p>
                  <p className="text-[10px] text-[#A39284]">{m.desc}</p>
                </button>
              ))}
            </div>

            {orderType === 'Drive-Thru' && (
              <div>
                <label className="block text-xs text-[#A39284] mb-1">Set Drive-Thru Pickup Time</label>
                <input
                  type="time"
                  required
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D2A072]"
                />
              </div>
            )}

            {orderType === 'Delivery' && (
              <div>
                <label className="block text-xs text-[#A39284] mb-1">Delivery Address</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter house address / landmark..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D2A072]"
                />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-[#1C1410] border border-[#2E221B] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#D2A072] uppercase tracking-wider mb-4">
                2. Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} items)
              </h2>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
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
                ))}
              </div>

              <div className="border-t border-[#2E221B] pt-4 mb-6">
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