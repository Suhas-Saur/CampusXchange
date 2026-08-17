import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  PlusCircle,
  AlertTriangle,
  Compass,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [greeting, setGreeting] = useState<string>('Good day');
  const [stats, setStats] = useState({
    activeListings: 0,
    totalOrders: 0,
    lostItems: 0,
    foundItems: 0
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentLost, setRecentLost] = useState<any[]>([]);
  const [recentFound, setRecentFound] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Calculate greeting by hours
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good morning');
    else if (hours < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Fetch dashboard aggregate data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Load recent listings, lost items, found items, and student orders in parallel
        const [productsRes, lostRes, foundRes, ordersRes] = await Promise.all([
          api.get('/api/products?limit=4'),
          api.get('/api/lost?limit=3'),
          api.get('/api/found?limit=3'),
          api.get('/api/orders?limit=3')
        ]);

        setRecentProducts(productsRes.data.slice(0, 4));
        setRecentLost(lostRes.data.slice(0, 3));
        setRecentFound(foundRes.data.slice(0, 3));
        
        const orders = ordersRes.data;
        setRecentOrders(orders.slice(0, 3));

        // Deduce stats
        const activeListingsCount = productsRes.data.filter((p: any) => p.sellerId?._id === user?._id).length;
        const totalOrdersCount = orders.length;
        const userLostCount = lostRes.data.filter((i: any) => i.userId?._id === user?._id).length;
        const userFoundCount = foundRes.data.filter((i: any) => i.userId?._id === user?._id).length;

        setStats({
          activeListings: activeListingsCount,
          totalOrders: totalOrdersCount,
          lostItems: userLostCount,
          foundItems: userFoundCount
        });

      } catch (err) {
        console.error('Error fetching dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12 text-left"
    >
      {/* Greetings Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here's what is happening at <span className="font-semibold text-brand-600">LNM Institute of Information Technology</span> today.
          </p>
        </div>

        {/* Quick stat chips */}
        <div className="flex gap-2 flex-wrap">
          <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Active Listings</p>
            <p className="text-base font-bold text-slate-900">{stats.activeListings}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Total Orders</p>
            <p className="text-base font-bold text-slate-900">{stats.totalOrders}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/sell')}
          className="flex flex-col items-start p-5 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 shadow-sm card-hover text-left"
        >
          <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
            <PlusCircle className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Sell an Item</h3>
          <p className="text-slate-500 text-[10px] mt-0.5">List study material for cash</p>
        </button>

        <button
          onClick={() => navigate('/report-lost')}
          className="flex flex-col items-start p-5 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 shadow-sm card-hover text-left"
        >
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Report Lost Item</h3>
          <p className="text-slate-500 text-[10px] mt-0.5">Alert classmates about lost goods</p>
        </button>

        <button
          onClick={() => navigate('/report-found')}
          className="flex flex-col items-start p-5 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 shadow-sm card-hover text-left"
        >
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
            <Compass className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Report Found Item</h3>
          <p className="text-slate-500 text-[10px] mt-0.5">Post an item you picked up</p>
        </button>

        <button
          onClick={() => navigate('/marketplace')}
          className="flex flex-col items-start p-5 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 shadow-sm card-hover text-left"
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Marketplace</h3>
          <p className="text-slate-500 text-[10px] mt-0.5">Browse calculators and tools</p>
        </button>
      </motion.div>

      {/* Main Grid: Marketplace vs. Lost & Found */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Marketplace Section (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-brand-600" />
              Recent Marketplace Listings
            </h2>
            <Link to="/marketplace" className="text-xs text-brand-600 hover:underline flex items-center gap-0.5">
              Browse All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl border border-slate-100 bg-white p-3 space-y-3">
                  <div className="h-36 w-full rounded-xl skeleton-loader"></div>
                  <div className="h-4 w-3/4 rounded skeleton-loader"></div>
                  <div className="h-3 w-1/2 rounded skeleton-loader"></div>
                </div>
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center">
              <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="font-bold text-slate-700 text-sm">No listings found</p>
              <p className="text-xs text-slate-400 mt-1">Be the first to list a necessity in the college!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentProducts.map((p) => (
                <Link
                  key={p._id}
                  to={`/marketplace/${p._id}`}
                  className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between shadow-sm card-hover group"
                >
                  <div>
                    <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 relative">
                      <img
                        src={p.images[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'}
                        alt={p.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                      <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-700 border border-slate-100 uppercase">
                        {p.condition.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-3 line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{p.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 border-t border-slate-50 pt-3">
                    <span className="font-bold text-slate-950 text-base">₹{p.price}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {p.location}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Activity Section */}
          <div className="border-t border-slate-100 pt-8">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-brand-600" />
              My Recent Handovers & Purchases
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl border border-slate-100 bg-white skeleton-loader"></div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center">
                <p className="text-xs text-slate-400">You haven't bought or sold items yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <Link
                    key={o._id}
                    to={`/orders/${o._id}`}
                    className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-brand-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900 text-xs line-clamp-1">{o.productId?.title || 'Unknown Product'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Order ID: #{o._id.slice(-6)} • ₹{o.amount}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      o.orderStatus === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : o.orderStatus === 'ready_for_pickup'
                        ? 'bg-indigo-50 text-indigo-700 animate-pulse'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {o.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Lost & Found */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Lost & Found Alerts
            </h2>
            <Link to="/lost-found" className="text-xs text-brand-600 hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {/* Render Lost Items */}
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl border border-slate-100 bg-white skeleton-loader"></div>
              ))
            ) : [...recentLost, ...recentFound].length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center">
                <p className="text-xs text-slate-400">All quiet! No lost belongings reported.</p>
              </div>
            ) : (
              <>
                {recentLost.map((item) => (
                  <Link
                    key={item._id}
                    to={`/lost-found/lost/${item._id}`}
                    className="block bg-white border border-slate-100 rounded-2xl p-4 shadow-sm card-hover hover:border-rose-100"
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[9px] font-bold uppercase tracking-wider">
                        LOST
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.dateLost).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-2.5 line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">📍 {item.location}</p>
                  </Link>
                ))}

                {recentFound.map((item) => (
                  <Link
                    key={item._id}
                    to={`/lost-found/found/${item._id}`}
                    className="block bg-white border border-slate-100 rounded-2xl p-4 shadow-sm card-hover hover:border-teal-100"
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 text-[9px] font-bold uppercase tracking-wider">
                        FOUND
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.dateFound).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-2.5 line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">📍 {item.location}</p>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};
