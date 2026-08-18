import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  Smartphone,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Flow State
  const [pickupLocation, setPickupLocation] = useState<string>('Main Campus Canteen');
  const [paymentOption, setPaymentOption] = useState<'razorpay' | 'upi_qr'>('upi_qr');
  const [initiatingPayment, setInitiatingPayment] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  
  // UPI QR Fallback states
  const [upiTimer, setUpiTimer] = useState<number>(300); // 5 minutes in seconds
  const [mockQRData, setMockQRData] = useState<string>('');
  
  // Final Payment Status States
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const PLATFORM_FEE = 15; // in INR

  useEffect(() => {
    if (!productId) {
      navigate('/marketplace');
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/products/${productId}`);
        setProduct(res.data);
        if (res.data.status !== 'available') {
          setOrderError('This product has already been sold or paused.');
        }
      } catch (err: any) {
        setOrderError(err.response?.data?.message || 'Failed to load checkout listing.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  // UPI Timer effect
  useEffect(() => {
    let interval: any;
    if (createdOrder && paymentOption === 'upi_qr' && upiTimer > 0 && paymentStatus === 'pending') {
      interval = setInterval(() => {
        setUpiTimer((time) => time - 1);
      }, 1000);
    } else if (upiTimer === 0) {
      setPaymentStatus('failed');
    }
    return () => clearInterval(interval);
  }, [createdOrder, paymentOption, upiTimer, paymentStatus]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Launch Checkout Flow
  const handlePayment = async () => {
    setOrderError(null);
    setInitiatingPayment(true);
    
    try {
      const res = await api.post('/api/payments/create-order', {
        productId: product._id,
        pickupLocation
      });

      const { orderId, razorpayOrderId, amount, keyId, mockMode } = res.data;
      setCreatedOrder(res.data);

      if (paymentOption === 'razorpay' && !mockMode) {
        // Load Razorpay JS SDK dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          const options = {
            key: keyId,
            amount: Math.round((amount + PLATFORM_FEE) * 100),
            currency: 'INR',
            name: 'CampusXchange',
            description: `Purchase: ${product.title}`,
            order_id: razorpayOrderId,
            handler: async (response: any) => {
              // Securely verify on backend
              try {
                setInitiatingPayment(true);
                const verifyRes = await api.post('/api/payments/verify', {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });
                if (verifyRes.data.success) {
                  setPaymentStatus('success');
                } else {
                  setPaymentStatus('failed');
                }
              } catch (err) {
                setPaymentStatus('failed');
              } finally {
                setInitiatingPayment(false);
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone
            },
            theme: {
              color: '#8b5cf6'
            }
          };
          
          const rzpWindow = new (window as any).Razorpay(options);
          rzpWindow.on('payment.failed', () => {
            setPaymentStatus('failed');
          });
          rzpWindow.open();
        };
        document.body.appendChild(script);
      } else {
        // Mock Mode or UPI QR Fallback Mode selected
        // Set mock deep-link intent for mobile and QR code payload
        const merchantUpi = '9901535561@ibl';
        const upiUrl = `upi://pay?pa=${merchantUpi}&pn=CampusXchange&am=${amount + PLATFORM_FEE}&cu=INR&tr=${razorpayOrderId}`;
        setMockQRData(upiUrl);
        
        // Dynamically trigger the PhonePe mobile payment gateway app immediately
        const phonepeUrl = `phonepe://pay?pa=${merchantUpi}&pn=CampusXchange&am=${amount + PLATFORM_FEE}&cu=INR&tr=${razorpayOrderId}`;
        window.location.href = phonepeUrl;
      }
    } catch (err: any) {
      setOrderError(err.response?.data?.message || 'Error creating checkout session.');
    } finally {
      setInitiatingPayment(false);
    }
  };

  // Simulate payment verification for mock UPI flow
  const verifyMockPayment = async () => {
    if (!createdOrder) return;
    setInitiatingPayment(true);
    try {
      // Send verify payload with mock parameters
      const verifyRes = await api.post('/api/payments/verify', {
        razorpayOrderId: createdOrder.razorpayOrderId,
        razorpayPaymentId: `pay_mock_${Date.now()}`
      });
      if (verifyRes.data.success) {
        setPaymentStatus('success');
      } else {
        setPaymentStatus('failed');
      }
    } catch (err) {
      setPaymentStatus('failed');
    } finally {
      setInitiatingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 max-w-4xl mx-auto space-y-6 text-left">
        <div className="h-6 w-32 skeleton-loader rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 h-80 skeleton-loader rounded-3xl"></div>
          <div className="md:col-span-4 h-64 skeleton-loader rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (orderError && !createdOrder) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="font-extrabold text-slate-800 text-lg">Checkout Blocked</h3>
        <p className="text-slate-500 text-sm mt-1">{orderError}</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="mt-6 inline-flex bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  // --- RENDER PAYMENT SUCCESS SCREEN ---
  if (paymentStatus === 'success') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6"
        >
          <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Payment Successful!</h2>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
              Your transaction was verified successfully. The seller has been notified to meet you for the handover.
            </p>
          </div>

          {/* Invoice Summary */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left text-xs space-y-2.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Order ID:</span>
              <span className="text-slate-800">#{createdOrder?.orderId?.slice(-8) || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Product:</span>
              <span className="text-slate-800 font-medium">{product.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Charged:</span>
              <span className="text-slate-800 font-bold">₹{product.price + PLATFORM_FEE}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Meeting Point:</span>
              <span className="text-slate-800 font-medium">📍 {pickupLocation}</span>
            </div>
          </div>

          <div className="space-y-3">
             {product?.sellerId?.phone && (
              <a
                href={`https://wa.me/91${product.sellerId.phone}?text=${encodeURIComponent(
                  `Hi! I have just paid ₹${product.price + PLATFORM_FEE} via UPI for your item "${product.title}" on CampusXchange. Let's meet at: ${pickupLocation}!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-[#25d366]/20 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l.545 2.18a1.875 1.875 0 0 1-.585 1.986l-.999.749a22.224 22.224 0 0 0 7.842 7.842l.749-.999a1.875 1.875 0 0 1 1.986-.585l2.18.545c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
                Chat on WhatsApp (+91 {product.sellerId.phone})
              </a>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/messages?partnerId=${product.sellerId?._id || product.sellerId}&productId=${product._id}`)}
                className="flex-1 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-650 font-semibold py-3 px-4 rounded-xl text-xs transition-colors"
              >
                Open Campus Chat
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-colors"
              >
                Track Order
              </button>
            </div>
            
            <button
              onClick={() => navigate('/marketplace')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-xs transition-colors"
            >
              Back to Marketplace
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- RENDER PAYMENT FAILURE SCREEN ---
  if (paymentStatus === 'failed') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6"
        >
          <div className="h-16 w-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">Payment Failed</h2>
            <p className="text-slate-500 text-xs">
              Razorpay could not verify signature coordinates or the session expired.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setPaymentStatus('pending');
                setCreatedOrder(null);
                setUpiTimer(300);
              }}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl text-xs"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs"
            >
              Cancel Checkout
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto text-left">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Cancel Checkout
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Side: Order details & pickup options */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Order Summary Box */}
          <div className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 text-lg">Checkout Order</h2>
            
            <div className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <img
                src={product.images[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200'}
                alt={product.title}
                className="h-16 w-16 rounded-xl object-cover border border-slate-100 shrink-0"
              />
              <div className="text-left flex flex-col justify-center">
                <h3 className="font-bold text-slate-900 text-xs">{product.title}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Seller: {product.sellerId?.name} • Year {product.sellerId?.year || 1}</p>
                <p className="text-brand-600 font-extrabold text-xs mt-1">₹{product.price}</p>
              </div>
            </div>
          </div>

          {/* Pickup location coordinator */}
          <div className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Coordinate Campus Pickup</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              CampusXchange operates locally. You will meet the student directly at a safe, public campus location to receive the product.
            </p>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Pickup Meeting Point
              </label>
              <select
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50/50"
              >
                <option value="Main Campus Canteen">Main Campus Canteen Area</option>
                <option value="Central Library Lobby">Central Library Lobby Tables</option>
                <option value="Boys Hostel Block A Reception">Boys Hostel Block A Reception</option>
                <option value="Girls Hostel Block B Lounge">Girls Hostel Block B Lounge</option>
                <option value="Academic Block-1 Reception Desk">Academic Block-1 Reception Desk</option>
              </select>
            </div>
          </div>

          {/* Payment method selector */}
          <div className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Select Payment Interface</h3>
            
            {!createdOrder ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentOption('razorpay')}
                  className={`p-4 border rounded-2xl flex items-center gap-3 text-left transition-all ${
                    paymentOption === 'razorpay'
                      ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-brand-600" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Razorpay Gateway</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Cards, Netbanking, UPI</p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentOption('upi_qr')}
                  className={`p-4 border rounded-2xl flex items-center gap-3 text-left transition-all ${
                    paymentOption === 'upi_qr'
                      ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="h-5 w-5 text-brand-600" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">UPI QR (Fallback Dev)</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Scan mock code with phone</p>
                  </div>
                </button>
              </div>
            ) : null}

            {/* If order created and UPI QR chosen, render the QR Scanner frame */}
            <AnimatePresence>
              {createdOrder && paymentOption === 'upi_qr' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-slate-100 pt-6 flex flex-col items-center space-y-4 text-center"
                >
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex items-start gap-2 max-w-md text-left text-amber-800 text-[11px] leading-relaxed">
                    <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0 animate-spin" />
                    <div>
                      <p className="font-bold">Scan with UPI Mobile Application</p>
                      <p className="mt-0.5 text-amber-700">
                        Scan the code below using Google Pay, PhonePe, Paytm or BHIM to complete the ₹{product.price + PLATFORM_FEE} transfer.
                      </p>
                    </div>
                  </div>

                  {/* UPI Intent Buttons for Mobile Devices */}
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-sm px-4">
                    <a
                      href={`phonepe://pay?pa=9901535561@ibl&pn=CampusXchange&am=${product.price + PLATFORM_FEE}&cu=INR&tr=${createdOrder.razorpayOrderId}`}
                      className="flex-grow bg-[#5f259f] hover:bg-[#4d1e82] text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-500/15 transition-all active:scale-95"
                    >
                      <Zap className="h-4 w-4 fill-white" />
                      Open PhonePe
                    </a>
                    
                    <a
                      href={mockQRData}
                      className="flex-grow border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <Smartphone className="h-4 w-4" />
                      Open in UPI App
                    </a>
                  </div>

                  {/* QR Image Frame */}
                  <div className="p-3 bg-white qr-frame rounded-2xl inline-block shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(mockQRData)}`}
                      alt="UPI QR Code"
                      className="h-40 w-40"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">TIME REMAINING</p>
                    <p className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 justify-center">
                      <Clock className="h-4.5 w-4.5 text-slate-600" />
                      {formatTimer(upiTimer)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    <button
                      onClick={verifyMockPayment}
                      disabled={initiatingPayment}
                      className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-brand-500/20 disabled:opacity-50"
                    >
                      {initiatingPayment ? 'Verifying signature...' : 'Verify Transfer Success'}
                    </button>
                    {/* Deep link button if on mobile */}
                    <a
                      href={mockQRData}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      Open UPI Application
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Side: Invoice Panel */}
        <div className="md:col-span-4">
          <div className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm sticky top-24 space-y-6">
            <h3 className="font-extrabold text-slate-900 text-sm">Invoice Invoice</h3>
            
            <div className="space-y-3 text-xs border-b border-slate-50 pb-4">
              <div className="flex justify-between text-slate-500">
                <span>Product Price:</span>
                <span className="text-slate-800 font-medium">₹{product.price}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Platform Fee:</span>
                <span className="text-slate-800 font-medium">₹{PLATFORM_FEE}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Grand Total:</span>
              <span className="text-2xl font-black text-slate-950">₹{product.price + PLATFORM_FEE}</span>
            </div>

            {!createdOrder && (
              <button
                onClick={handlePayment}
                disabled={initiatingPayment}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 active:scale-98 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-brand-500/25 text-xs transition-all flex items-center justify-center gap-1.5"
              >
                {initiatingPayment ? (
                  <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5" />
                    Checkout Order
                  </>
                )}
              </button>
            )}

            <p className="text-[10px] text-slate-400 text-center leading-normal">
              Razorpay sandbox transaction. In mock-mode, payments verify instantly without moving actual money.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
