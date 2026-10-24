'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CartItemType {
  _id: string;
  name: string;
  price: string;
  quantity: number;
  image: string;
}

interface CustomerType {
  name: string;
  phone: string;
}

interface ConfirmedOrderType {
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  pickupTime?: string;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  totalItems: number;
}

type OrderType = 'Drive-Thru' | 'In-Shop QR' | 'Delivery';
type PaymentMethod = 'Cash' | 'Card';

const money = (amount: number) =>
  new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const priceValue = (price: string) =>
  Number.parseFloat(price.replace(/[^0-9.]/g, '')) || 0;

function Icon({
  name,
  size = 22,
}: {
  name: string;
  size?: number;
}) {
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
    case 'car':
      return (
        <svg {...common}>
          <path d="m5 11 1.5-5h11l1.5 5" />
          <path d="M3 11h18v7H3z" />
          <path d="M5 18v2m14-2v2M3 14h3m12 0h3" />
          <circle cx="6.5" cy="15.5" r="1" />
          <circle cx="17.5" cy="15.5" r="1" />
        </svg>
      );
    case 'store':
      return (
        <svg {...common}>
          <path d="M3 10h18l-2-6H5z" />
          <path d="M5 10v10h14V10M9 20v-6h6v6" />
          <path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 5-2" />
        </svg>
      );
    case 'bike':
      return (
        <svg {...common}>
          <circle cx="6" cy="17" r="4" />
          <circle cx="18" cy="17" r="4" />
          <path d="m6 17 4-7 4 7H6m4-7h4m-1-3h3" />
        </svg>
      );
    case 'card':
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M3 10h18m-14 5h4" />
        </svg>
      );
    case 'cash':
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6 9h.01M18 15h.01" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      );
    case 'coffee':
      return (
        <svg {...common}>
          <path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z" />
          <path d="M17 10h2a2 2 0 1 1 0 4h-2M8 4c-2 2 2 2 0 4m5-4c-2 2 2 2 0 4" />
        </svg>
      );
    default:
      return null;
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#8C7A6B]">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-2xl border border-[#E4D9CB] bg-[#FAF7F2] px-4.5 py-3.5 text-sm text-[#30251E] outline-none transition placeholder:text-[#B3A495] focus:border-[#A17B50] focus:bg-white focus:ring-4 focus:ring-[#A17B50]/10';

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [orderType, setOrderType] = useState<OrderType>('Drive-Thru');
  const [pickupTime, setPickupTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State to store order details specifically for the Confirmation Screen
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderType | null>(null);

  useEffect(() => {
    setConfirmedOrder(null);
    try {
      const savedCustomer = localStorage.getItem('brew_customer');
      if (!savedCustomer) {
        window.location.href = '/customer-login';
        return;
      }
      setCustomer(JSON.parse(savedCustomer) as CustomerType);
      const savedCart = localStorage.getItem('brew_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
      setLoadingUser(false);
    } catch (error) {
      console.error('Unable to load checkout data:', error);
      window.location.href = '/customer-login';
    }
  }, []);

  const totalAmount = cart.reduce(
    (sum, item) => sum + priceValue(item.price) * item.quantity,
    0
  );
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Helper function to auto-format Expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // keep numbers only
    if (input.length > 4) input = input.substring(0, 4);

    if (input.length >= 3) {
      setCardExpiry(`${input.substring(0, 2)}/${input.substring(2)}`);
    } else {
      setCardExpiry(input);
    }
  };

  // Helper function to auto-format Card Number with spaces (0000 0000 0000 0000)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 16) input = input.substring(0, 16);
    const formatted = input.match(/.{1,4}/g)?.join(' ') || input;
    setCardNumber(formatted);
  };

  const handlePlaceOrder = async () => {
    if (!customer || loading) return;
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    if (orderType === 'Drive-Thru' && !pickupTime) {
      alert('Please select your estimated pickup time.');
      return;
    }
    if (orderType === 'Delivery' && !deliveryAddress.trim()) {
      alert('Please enter your delivery address.');
      return;
    }
    if (paymentMethod === 'Card') {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
        alert('Please complete the demo card fields.');
        return;
      }
      if (!/^[\d ]{12,19}$/.test(cardNumber.trim())) {
        alert('Please enter a valid demo card number.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
        alert('Enter the expiry in MM/YY format.');
        return;
      }
      if (!/^\d{3,4}$/.test(cardCvc.trim())) {
        alert('Enter a 3 or 4 digit demo CVC.');
        return;
      }
    }
    setLoading(true);
    try {
      const orderData = {
        customerName: customer.name,
        customerPhone: customer.phone,
        orderType,
        pickupTime: orderType === 'Drive-Thru' ? pickupTime : undefined,
        deliveryAddress: orderType === 'Delivery' ? deliveryAddress.trim() : undefined,
        paymentMethod,
        paymentStatus: 'Pending',
        items: cart.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to place your order.');
      }

      // Preserve snapshot of confirmed order totals BEFORE clearing cart
      setConfirmedOrder({
        customerName: customer.name,
        customerPhone: customer.phone,
        orderType,
        pickupTime: orderType === 'Drive-Thru' ? pickupTime : undefined,
        deliveryAddress: orderType === 'Delivery' ? deliveryAddress.trim() : undefined,
        paymentMethod,
        totalAmount,
        totalItems,
      });

      // Now safely clear shopping cart
      localStorage.removeItem('brew_cart');
      setCart([]);
    } catch (error) {
      console.error('Order submission failed:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Something went wrong while placing your order.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F5EF] px-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#30251E] text-[#D9BA91] shadow-xl">
            <Icon name="coffee" size={30} />
          </div>
          <p className="mt-5 text-sm font-semibold tracking-wide text-[#77695C]">
            Preparing your checkout experience...
          </p>
        </div>
      </main>
    );
  }

  // Confirmation Screen rendered when confirmedOrder is populated
  if (confirmedOrder) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8F5EF] px-4 py-12 text-[#30251E]">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#E5D6C5]/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#D4C4B0]/30 blur-3xl" />
        <section className="relative w-full max-w-lg rounded-[32px] border border-[#E9E0D5] bg-white p-8 text-center shadow-[0_30px_90px_-35px_rgba(48,37,30,0.2)] sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0F7EE] text-[#427A4B] shadow-inner">
            <Icon name="check" size={40} />
          </div>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-[#A17B50]">
            Elephantpath Coffee House
          </p>
          <h1 className="mt-2.5 text-3xl font-bold tracking-tight sm:text-4xl">
            Order confirmed.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#77695C]">
            Thank you, <strong className="text-[#30251E]">{confirmedOrder.customerName}</strong>! Your order has been placed successfully and our kitchen is ready.
          </p>
          <div className="mt-8 rounded-2xl border border-[#EFE7DE] bg-[#FAF8F5] p-5 text-left space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-[#E9E0D5] pb-3 text-xs">
              <span className="text-[#8C7A6B]">Fulfillment Type</span>
              <span className="font-bold text-[#30251E]">
                {confirmedOrder.orderType === 'In-Shop QR' ? 'Dine-In' : confirmedOrder.orderType}
              </span>
            </div>
            {confirmedOrder.orderType === 'Drive-Thru' && (
              <div className="flex justify-between gap-4 border-b border-[#E9E0D5] pb-3 text-xs">
                <span className="text-[#8C7A6B]">Pickup Time</span>
                <span className="font-bold text-[#30251E]">{confirmedOrder.pickupTime}</span>
              </div>
            )}
            {confirmedOrder.orderType === 'Delivery' && (
              <div className="border-b border-[#E9E0D5] pb-3 text-xs">
                <p className="text-[#8C7A6B]">Delivery Address</p>
                <p className="mt-1 break-words font-bold text-[#30251E]">{confirmedOrder.deliveryAddress}</p>
              </div>
            )}
            <div className="flex justify-between gap-4 border-b border-[#E9E0D5] pb-3 text-xs">
              <span className="text-[#8C7A6B]">Payment Method</span>
              <span className="font-bold text-[#30251E]">{confirmedOrder.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1">
              <span className="text-xs font-semibold text-[#8C7A6B]">
                Total Amount ({confirmedOrder.totalItems} {confirmedOrder.totalItems === 1 ? 'item' : 'items'})
              </span>
              <span className="text-xl font-black tracking-tight text-[#A17B50]">
                <span className="mr-1 text-[10px] font-bold">LKR</span>
                {money(confirmedOrder.totalAmount)}
              </span>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <Link
              href="/my-orders"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#30251E] px-5 py-4 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#49372B] shadow-lg"
            >
              Track Live Order Status <Icon name="arrow" size={16} />
            </Link>
            <Link
              href="/"
              className="block w-full rounded-xl border border-[#E4D9CB] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#77695C] transition hover:bg-[#FAF7F2] hover:text-[#30251E]"
            >
              Return to Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const orderMethods: {
    id: OrderType;
    title: string;
    description: string;
    icon: string;
  }[] = [
    {
      id: 'Drive-Thru',
      title: 'Express Drive-Thru',
      description: 'Quick pickup on the go',
      icon: 'car',
    },
    {
      id: 'In-Shop QR',
      title: 'In-Shop Scan',
      description: 'Dine-in or table order',
      icon: 'store',
    },
    {
      id: 'Delivery',
      title: 'Home Delivery',
      description: 'Delivered to your door',
      icon: 'bike',
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8F5EF] text-[#30251E]">
      <header className="border-b border-[#E9E0D5] bg-[#F8F5EF]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
          <Link href="/" className="group flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#30251E] text-[#D9BA91] shadow-md transition-transform group-hover:scale-105">
              <span className="text-xl" aria-hidden="true">🐘</span>
            </span>
            <div>
              <span className="block text-lg font-black tracking-widest text-[#30251E]">
                ELEPHANTPATH
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.25em] text-[#9A846D]">
                Secure Checkout
              </span>
            </div>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#77695C] transition hover:text-[#30251E]"
          >
            ← Return to menu
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E5D6C4] bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#A17B50] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A17B50]" />
            Almost ready to brew
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Complete your order.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#77695C] sm:text-base">
            Select your fulfillment method and preferred payment style to lock in your fresh brew.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)] lg:gap-12">
          <div className="space-y-6">
            
            {/* Customer Details Card */}
            <section className="rounded-[28px] border border-[#E9E0D5] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EEE5] text-[#94704C]">
                    <span className="text-lg">👤</span>
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#A17B50]">
                      Account Session
                    </p>
                    <h2 className="text-base font-bold text-[#30251E]">
                      {customer?.name}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('brew_customer');
                    window.location.href = '/customer-login';
                  }}
                  className="rounded-xl border border-[#E4D9CB] px-3.5 py-2 text-xs font-bold text-[#77695C] transition hover:bg-[#FAF7F2] hover:text-[#30251E]"
                >
                  Switch User
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-[#F0EAE2] flex items-center justify-between text-xs text-[#77695C]">
                <span>Registered Phone: <strong className="text-[#30251E]">{customer?.phone}</strong></span>
              </div>
            </section>

            {/* Step 1: Fulfillment */}
            <section className="rounded-[28px] border border-[#E9E0D5] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3.5 mb-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EEE5] text-[#94704C]">
                  <Icon name="pin" size={20} />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A17B50]">Step 01</span>
                  <h2 className="text-base font-bold text-[#30251E]">Select Fulfillment Method</h2>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {orderMethods.map((method) => {
                  const selected = orderType === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setOrderType(method.id)}
                      className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-[#A17B50] bg-[#FAF3EC] ring-2 ring-[#A17B50]/20 shadow-sm'
                          : 'border-[#E4D9CB] bg-[#FAF7F2]/50 hover:border-[#A17B50]/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${selected ? 'bg-[#30251E] text-[#D9BA91]' : 'bg-[#EFE8DE] text-[#77695C]'}`}>
                          <Icon name={method.icon} size={18} />
                        </span>
                        <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${selected ? 'border-[#A17B50] bg-[#A17B50]' : 'border-[#D4C4B0]'}`}>
                          {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#30251E]">{method.title}</p>
                        <p className="mt-1 text-[11px] text-[#8C7A6B]">{method.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {orderType === 'Drive-Thru' && (
                <div className="mt-5 rounded-2xl border border-[#E4D9CB] bg-[#FAF7F2] p-5">
                  <Field label="Estimated Drive-Thru Pickup Time">
                    <input
                      type="time"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
              )}

              {orderType === 'Delivery' && (
                <div className="mt-5 rounded-2xl border border-[#E4D9CB] bg-[#FAF7F2] p-5">
                  <Field label="Full Delivery Address">
                    <textarea
                      rows={3}
                      required
                      placeholder="House number, street name, landmark..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                </div>
              )}
            </section>

            {/* Step 2: Payment */}
            <section className="rounded-[28px] border border-[#E9E0D5] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3.5 mb-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EEE5] text-[#94704C]">
                  <Icon name="card" size={20} />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A17B50]">Step 02</span>
                  <h2 className="text-base font-bold text-[#30251E]">Choose Payment Option</h2>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    id: 'Cash' as PaymentMethod,
                    title: orderType === 'Delivery' ? 'Pay on Delivery' : 'Pay Upon Pickup',
                    desc: 'Cash settlement at counter or door',
                    icon: 'cash',
                  },
                  {
                    id: 'Card' as PaymentMethod,
                    title: 'Card Payment (Demo)',
                    desc: 'Test sandbox secure gateway',
                    icon: 'card',
                  },
                ].map((method) => {
                  const selected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-[#A17B50] bg-[#FAF3EC] ring-2 ring-[#A17B50]/20 shadow-sm'
                          : 'border-[#E4D9CB] bg-[#FAF7F2]/50 hover:border-[#A17B50]/50 hover:bg-white'
                      }`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-[#30251E] text-[#D9BA91]' : 'bg-[#EFE8DE] text-[#77695C]'}`}>
                        <Icon name={method.icon} size={20} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#30251E]">{method.title}</p>
                        <p className="mt-0.5 text-[11px] text-[#8C7A6B]">{method.desc}</p>
                      </div>
                      <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${selected ? 'border-[#A17B50] bg-[#A17B50]' : 'border-[#D4C4B0]'}`}>
                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === 'Card' && (
                <div className="mt-5 rounded-2xl border border-[#E4D9CB] bg-[#FAF7F2] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#30251E]">Test Card Simulator</span>
                    <span className="rounded-lg bg-[#EAE1D3] px-2 py-0.5 text-[10px] font-bold text-[#77695C]">Sandbox</span>
                  </div>
                  <Field label="Card Number">
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry (MM/YY)">
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="CVC">
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Order Summary */}
          <aside className="lg:sticky lg:top-28">
            <section className="overflow-hidden rounded-[28px] border border-[#E9E0D5] bg-white shadow-xl">
              <div className="bg-[#30251E] px-6 py-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D9BA91]">Order Overview</span>
                <h2 className="mt-1 text-xl font-bold">Your Bag Summary</h2>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-[#D4C5B7]">
                  <span>Total Items</span>
                  <span className="font-bold text-white">{totalItems}</span>
                </div>
              </div>

              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs text-[#8C7A6B]">Your bag is currently empty.</p>
                    <Link
                      href="/"
                      className="mt-4 inline-block rounded-xl bg-[#30251E] px-4 py-2 text-xs font-bold text-white"
                    >
                      Return to Menu
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item._id} className="flex items-center justify-between gap-3 border-b border-[#F0EAE2] pb-3 last:border-b-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover bg-[#F5EEE5]" />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#30251E]">{item.name}</p>
                              <p className="text-[11px] text-[#8C7A6B]">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-[#A17B50] whitespace-nowrap">
                            LKR {money(priceValue(item.price) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 border-t border-[#E9E0D5] pt-4 space-y-2 text-xs">
                      <div className="flex justify-between text-[#77695C]">
                        <span>Subtotal</span>
                        <span className="font-semibold text-[#30251E]">LKR {money(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-[#30251E] pt-2 border-t border-dashed border-[#E9E0D5]">
                        <span>Total</span>
                        <span className="text-[#A17B50]">LKR {money(totalAmount)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={loading || cart.length === 0}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#30251E] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#49372B] disabled:opacity-50"
                    >
                      {loading ? 'Processing Order...' : 'Confirm & Place Order'}
                      <Icon name="arrow" size={16} />
                    </button>
                  </>
                )}
              </div>
            </section>
          </aside>

        </div>
      </div>
    </main>
  );
}