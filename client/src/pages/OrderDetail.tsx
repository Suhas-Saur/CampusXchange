import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  MessageSquare,
  ChevronLeft,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/orders/${id}`);
      setOrder(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load order coordinates.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      await api.put(`/api/orders/${id}/status`, { orderStatus: newStatus });
      await fetchOrderDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 max-w-4xl mx-auto space-y-6 text-left">
        <div className="h-6 w-24 skeleton-loader rounded"></div>
        <div className="h-96 skeleton-loader rounded-3xl"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="font-extrabold text-slate-800 text-lg">Order Details Error</h3>
        <p className="text-slate-500 text-sm mt-1">{error || 'This order was not found.'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-6 inline-flex bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  const isSeller = order.sellerId?._id === user?._id;
  const partner = isSeller ? order.buyerId : order.sellerId;
  
  // Timeline steps
  const statuses = ['pending', 'processing', 'ready_for_pickup', 'completed'];
  const currentStepIndex = statuses.indexOf(order.orderStatus);

  return (
    <div className="py-6 max-w-4xl mx-auto text-left">
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Activity
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Order details & Status workflow */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Order Details header */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">ORDER CODE</span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">#{order._id}</h2>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">PAYMENT STATE</span>
                <span className={`block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase mt-1 ${
                  order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <img
                src={order.productId?.images[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200'}
                alt={order.productId?.title}
                className="h-16 w-16 rounded-xl object-cover border border-slate-100 shrink-0"
              />
              <div className="text-left flex flex-col justify-center">
                <h3 className="font-bold text-slate-900 text-xs">{order.productId?.title || 'Removed Listing'}</h3>
                <p className="text-[10px] text-slate-500 mt-1">₹{order.amount}</p>
              </div>
            </div>
          </div>

          {/* Handover Timeline */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-sm">Handover Progress Tracker</h3>
            
            <div className="relative flex justify-between items-center max-w-md mx-auto py-4">
              {/* Background line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 -z-10"></div>
              
              {statuses.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center relative">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isPassed
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-white border-slate-200 text-slate-300'
                    }`}>
                      {isPassed ? (
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      ) : (
                        <span className="text-xs font-semibold">{idx + 1}</span>
                      )}
                    </div>
                    
                    <span className={`text-[9px] font-bold uppercase tracking-wider mt-2.5 absolute top-8 whitespace-nowrap ${
                      isCurrent ? 'text-brand-600' : isPassed ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {step.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Status explanation warnings */}
            <div className="bg-brand-50/50 border border-brand-100/50 rounded-2xl p-4 text-xs text-brand-850 mt-4">
              {order.orderStatus === 'pending' && 'Awaiting payment confirmation. Secure webhook captures status dynamically.'}
              {order.orderStatus === 'processing' && 'Payment confirmed! The seller is preparing the item for pickup.'}
              {order.orderStatus === 'ready_for_pickup' && 'The seller is waiting at the coordinated location! Carry your ID to verify.'}
              {order.orderStatus === 'completed' && 'Handover complete! The trade has been archived.'}
              {order.orderStatus === 'cancelled' && 'This order has been cancelled.'}
            </div>
          </div>

        </div>

        {/* Right Side: Partner profile details & Action pane */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Pickup coordinates info */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Pickup Details</h3>
            <div className="space-y-3">
              <div className="flex gap-2.5 items-start text-xs">
                <MapPin className="h-4.5 w-4.5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Meeting Point</p>
                  <p className="text-slate-500 mt-0.5">{order.pickupLocation || 'Not Coordinated'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Partner Info Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {isSeller ? 'Buyer Details' : 'Seller Details'}
            </h3>
            
            <div className="flex items-center gap-3">
              <img
                src={partner?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partner?.name || '')}`}
                alt={partner?.name}
                className="h-10 w-10 rounded-full border border-slate-100"
              />
              <div className="text-left">
                <p className="font-bold text-slate-950 text-xs">{partner?.name}</p>
                <p className="text-[10px] text-slate-400">{partner?.department} • Year {partner?.year || 1}</p>
              </div>
            </div>

            {/* Privacy rule: Expose contact information ONLY if paid! */}
            {order.paymentStatus === 'paid' ? (
              <div className="space-y-2 border-t border-slate-50 pt-3 text-xs text-left">
                <p className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>+91 {partner?.phone}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="break-all">{partner?.email}</span>
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2 text-[10px] text-slate-500 leading-normal">
                <ShieldAlert className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <p>Contact information is hidden until order payment status is Paid.</p>
              </div>
            )}

            <Link
              to={`/messages?partnerId=${partner?._id}&productId=${order.productId?._id}`}
              className="w-full flex items-center justify-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Discuss in Chat
            </Link>
          </div>

          {/* Seller Action Controls */}
          {isSeller && order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Seller Action Panels</h3>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                Update status markers sequentially to inform the buyer of your pickup preparation states.
              </p>

              <div className="flex flex-col gap-2.5">
                {order.orderStatus === 'processing' && (
                  <button
                    onClick={() => updateStatus('ready_for_pickup')}
                    disabled={updating}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-brand-500/20 disabled:opacity-50"
                  >
                    Mark Ready for Pickup
                  </button>
                )}

                {order.orderStatus === 'ready_for_pickup' && (
                  <button
                    onClick={() => updateStatus('completed')}
                    disabled={updating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    Confirm Handover Complete
                  </button>
                )}

                <button
                  onClick={() => updateStatus('cancelled')}
                  disabled={updating}
                  className="w-full bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 font-semibold py-2.5 px-4 rounded-xl text-[11px] disabled:opacity-50"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
