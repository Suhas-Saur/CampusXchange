import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  ShoppingBag,
  Clock,
  ArrowRight,
  TrendingUp,
  Inbox,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<'purchases' | 'sales'>('purchases');

  useEffect(() => {
    fetchOrders();
  }, [tab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch orders where student is buyer (purchases) or seller (sales)
      const roleQuery = tab === 'purchases' ? 'buyer' : 'seller';
      const res = await api.get(`/api/orders?role=${roleQuery}`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Activity</h1>
        <p className="text-slate-500 text-sm mt-1">Manage items you are buying or selling on campus.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setTab('purchases')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              tab === 'purchases'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            My Purchases ({tab === 'purchases' ? orders.length : '...'})
          </button>
          
          <button
            onClick={() => setTab('sales')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              tab === 'sales'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            My Sales ({tab === 'sales' ? orders.length : '...'})
          </button>
        </div>
      </div>

      {/* Listing grid */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-slate-100 bg-white skeleton-loader"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center max-w-md mx-auto">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 text-sm">No activity recorded</h3>
          <p className="text-slate-500 text-xs mt-1">
            {tab === 'purchases'
              ? "You haven't bought anything from the marketplace yet."
              : "No students have purchased any of your product listings yet."}
          </p>
          <Link
            to={tab === 'purchases' ? '/marketplace' : '/sell'}
            className="mt-6 inline-flex bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/20"
          >
            {tab === 'purchases' ? 'Browse Marketplace' : 'Sell an Item'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o._id}
              className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex gap-4">
                <img
                  src={o.productId?.images[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200'}
                  alt={o.productId?.title}
                  className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                
                <div className="text-left space-y-1.5 flex flex-col justify-center">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{o.productId?.title || 'Unknown Product'}</h3>
                  <p className="text-[10px] text-slate-400">Order ID: #{o._id}</p>
                  
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(o.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                    <span>
                      {tab === 'purchases' ? `Seller: ${o.sellerId?.name}` : `Buyer: ${o.buyerId?.name}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price details and redirect button */}
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none border-slate-50 pt-3 md:pt-0">
                <div className="text-left md:text-right">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">TOTAL AMOUNT</p>
                  <p className="font-extrabold text-slate-950 text-base">₹{o.amount}</p>
                  
                  {/* Status chip */}
                  <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider mt-1 ${
                    o.orderStatus === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : o.orderStatus === 'ready_for_pickup'
                      ? 'bg-indigo-50 text-indigo-700 animate-pulse'
                      : o.orderStatus === 'cancelled'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {o.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <Link
                  to={`/orders/${o._id}`}
                  className="bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-700 hover:text-brand-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1"
                >
                  Manage Order
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
