'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CartItemType {
  _id: string;
  name: string;
  price: string;
  quantity: number;
  image: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [customer, setCustomer] = useState<{ name: string; phone: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Order Details State
  const [orderType, setOrderType] = useState<'Drive-Thru' | 'In-Shop QR' | 'Delivery'>('Drive-Thru');
  const [pickupTime, setPickupTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [loading, setLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  useEffect(() => {
    const savedCustomer = localStorage.getItem('brew_customer');
    if (!savedCustomer) {
      window.location.href = '/customer-login';
      return;
    }

    setCustomer(JSON.parse(savedCustomer));
    setLoadingUser(false);

    const savedCart = localStorage.getItem('brew_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

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
      alert('Please specify your estimated Drive-Thru pickup time.');
      return;
    }
    if (orderType === 'Delivery' && !deliveryAddress) {
      alert('Please enter your delivery address.');
      return;
    }

    // Basic Card Validation for Dummy Card Flow
    if (paymentMethod === 'Card') {
      if (!cardNumber || !cardExpiry || !cardCvc) {
        alert('Please fill out all dummy card details.');
        return;
      }
    }

    setLoading(true);

    // Simulate payment processing delay for Card
    if (paymentMethod === 'Card') {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    const orderData = {
      customerName: customer.name,
      customerPhone: customer.phone,
      orderType,
      pickupTime: orderType === 'Drive-Thru' ? pickupTime : undefined,
      deliveryAddress: orderType === 'Delivery' ? deliveryAddress : undefined,
      paymentMethod,
      paymentStatus: paymentMethod === 'Card' ? 'Paid' : 'Pending',
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
      alert('An error occurred while processing your order.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] flex items-center justify-center">
        <p className="text-xs text-[#A39284]">Verifying session...</p>
      </div>
    );
  }

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1C1410] border border-[#2E221B] rounded-2xl p-8 text-center shadow-2xl">
          <div className="text-5xl mb-4">☕🎉</div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Order Confirmed!</h1>
          <p className="text-[#A39284] text-xs leading-relaxed mb-6">
            Thank you, <span className="text-[#D2A072] font-semibold">{customer?.name}</span>! Your order has been placed successfully.
          </p>

          <div className="bg-[#0F0A07] border border-[#2E221B] rounded-xl p-4 text-left text-xs mb-6 space-y-2">
            <p className="text-white font-bold">Fulfillment: <span className="text-[#D2A072]">{orderType}</span></p>
            {pickupTime && <p className="text-[#A39284]">Pickup Time: <span className="text-white">{pickupTime}</span></p>}
            {deliveryAddress && <p className="text-[#A39284]">Address: <span className="text-white">{deliveryAddress}</span></p>}
            <p className="text-[#A39284]">Payment Method: <span className="text-white font-bold">{paymentMethod}</span></p>
            <p className="text-[#A39284]">Payment Status: <span className="text-emerald-400 font-bold">{paymentMethod === 'Card' ? 'Paid (Online)' : 'Pending (Pay on Delivery/Pickup)'}</span></p>
            <p className="text-[#A39284]">Total Amount: <span className="text-[#D2A072] font-bold">LKR {totalAmount.toFixed(2)}</span></p>
          </div>

          <div className="space-y-3">
            <Link
              href="/my-orders"
              className="block w-full py-3.5 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-black rounded-xl text-xs transition text-center shadow-lg"
            >
              📋 Track Live Order Status
            </Link>

            <Link
              href="/"
              className="block w-full py-3 bg-[#1C1410] border border-[#2E221B] hover:border-[#D2A072]/50 text-[#A39284] hover:text-white font-bold rounded-xl text-xs transition text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EADCCF] py-12 px-4 flex justify-center items-start">
      <div className="w-full max-w-xl bg-[#1C1410] border border-[#2E221B] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Header & User Info */}
        <div className="flex justify-between items-center border-b border-[#2E221B] pb-4">
          <div>
            <h1 className="text-xl font-black text-white">☕ Complete Your Order</h1>
            <p className="text-xs text-[#A39284] mt-0.5">
              Customer: <span className="text-[#D2A072] font-bold">{customer?.name}</span> ({customer?.phone})
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('brew_customer');
              window.location.href = '/customer-login';
            }}
            className="text-[11px] text-red-400 hover:underline"
          >
            Switch
          </button>
        </div>

        {/* 1. Select Order Method */}
        <div>
          <label className="block text-xs font-bold text-[#D2A072] uppercase tracking-wider mb-3">
            1. Select Fulfillment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Drive-Thru', label: '🚗 Drive-Thru' },
              { id: 'In-Shop QR', label: '☕ In-Shop QR' },
              { id: 'Delivery', label: '🛵 Delivery' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setOrderType(m.id as any)}
                className={`py-3 px-2 rounded-xl text-xs font-bold transition border ${
                  orderType === m.id
                    ? 'bg-[#D2A072] text-[#120B08] border-[#D2A072] font-extrabold'
                    : 'bg-[#0F0A07] text-[#A39284] border-[#2E221B] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {orderType === 'Drive-Thru' && (
            <div className="mt-3">
              <label className="block text-xs text-[#A39284] mb-1">Estimated Pickup Time</label>
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
            <div className="mt-3">
              <label className="block text-xs text-[#A39284] mb-1">Delivery Address</label>
              <textarea
                rows={2}
                required
                placeholder="House no, street name..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full bg-[#0F0A07] border border-[#2E221B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D2A072]"
              />
            </div>
          )}
        </div>

        {/* 2. Select Payment Method */}
        <div>
          <label className="block text-xs font-bold text-[#D2A072] uppercase tracking-wider mb-3">
            2. Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'Cash', label: '💵 Cash on Pickup/Delivery' },
              { id: 'Card', label: '💳 Card Payment (Demo)' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaymentMethod(p.id as any)}
                className={`py-3 px-2 rounded-xl text-xs font-bold transition border ${
                  paymentMethod === p.id
                    ? 'bg-[#D2A072] text-[#120B08] border-[#D2A072] font-extrabold'
                    : 'bg-[#0F0A07] text-[#A39284] border-[#2E221B] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Dummy Card Inputs */}
          {paymentMethod === 'Card' && (
            <div className="mt-3 bg-[#0F0A07] border border-[#2E221B] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#D2A072] font-bold uppercase tracking-wider">Demo Gateway</span>
                <span className="text-[10px] text-[#A39284]">Enter test card details</span>
              </div>

              <div>
                <label className="block text-[11px] text-[#A39284] mb-1">Card Number</label>
                <input
                  type="text"
                  maxLength={19}
                  placeholder="4242 •••• •••• 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-[#1C1410] border border-[#2E221B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D2A072]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#A39284] mb-1">Expiry Date</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-[#1C1410] border border-[#2E221B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D2A072]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A39284] mb-1">CVC / CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-[#1C1410] border border-[#2E221B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D2A072]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Order Items Summary */}
        <div>
          <label className="block text-xs font-bold text-[#D2A072] uppercase tracking-wider mb-3">
            3. Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)})
          </label>
          
          <div className="bg-[#0F0A07] border border-[#2E221B] rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
            {cart.length === 0 ? (
              <p className="text-xs text-[#A39284] text-center py-4">Your cart is empty.</p>
            ) : (
              cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-xs border-b border-[#2E221B]/40 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-md" />
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-[#A39284] text-[10px]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-[#D2A072] font-semibold">{item.price}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Total & Submit */}
        <div className="border-t border-[#2E221B] pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#A39284] font-medium">Total Amount</span>
            <span className="text-lg font-black text-[#D2A072]">LKR {totalAmount.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || cart.length === 0}
            className="w-full py-3.5 bg-[#D2A072] hover:bg-[#b8895e] text-[#120B08] font-black text-xs rounded-xl transition duration-300 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Processing Order...' : paymentMethod === 'Card' ? 'Pay & Confirm Order' : 'Confirm & Place Order'}
          </button>
        </div>

      </div>
    </div>
  );
}