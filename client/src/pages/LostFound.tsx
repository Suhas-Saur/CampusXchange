import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  AlertTriangle,
  Compass,
  Inbox,
  Clock,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LostFound: React.FC = () => {
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  
  // Lists
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('All');

  const categories = [
    'All',
    'Electronics',
    'ID Cards',
    'Books',
    'Bags',
    'Wallets',
    'Keys',
    'Clothing',
    'Accessories',
    'Other'
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, activeTab]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Endpoint is /api/lost or /api/found depending on active tab
      const endpoint = `/api/${activeTab}`;
      let url = `${endpoint}?status=${activeTab}`;
      if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Top Banner and Quick CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lost & Found Portal</h1>
          <p className="text-slate-500 text-sm mt-1">
            Search for lost items or report something you picked up on campus.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => navigate('/report-lost')}
            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            Report Lost
          </button>
          
          <button
            onClick={() => navigate('/report-found')}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            Report Found
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('lost')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'lost'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <AlertTriangle className="h-4.5 w-4.5" />
          Lost Reports ({activeTab === 'lost' ? items.length : '...'})
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'found'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Compass className="h-4.5 w-4.5" />
          Found Reports ({activeTab === 'found' ? items.length : '...'})
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Filter Sidebar */}
        <aside className="w-full lg:w-60 shrink-0 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-fit space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Search Items</h3>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search wallets, IDs..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    category === cat
                      ? activeTab === 'lost'
                        ? 'bg-rose-50 text-rose-700 font-semibold'
                        : 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Side: Items Grid */}
        <div className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-3xl border border-slate-100 bg-white p-4 space-y-4">
                  <div className="h-36 w-full rounded-xl skeleton-loader"></div>
                  <div className="h-5 w-3/4 rounded skeleton-loader"></div>
                  <div className="h-4 w-1/2 rounded skeleton-loader"></div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl py-20 text-center max-w-lg mx-auto shadow-sm">
              <Inbox className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-extrabold text-slate-800 text-base">No reports matches found</h3>
              <p className="text-slate-500 text-xs mt-1.5 px-6 leading-relaxed">
                We couldn't find active {activeTab} posts matching category "{category}" or query "{search}". Report an item to broadcast it to the campus!
              </p>
              <button
                onClick={() => {
                  setCategory('All');
                  setSearch('');
                }}
                className="mt-6 inline-flex bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-5 py-2.5 rounded-xl transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item) => (
                <Link
                  key={item._id}
                  to={`/lost-found/${activeTab}/${item._id}`}
                  className={`bg-white border rounded-3xl p-3 shadow-sm card-hover flex flex-col justify-between group ${
                    activeTab === 'lost' ? 'hover:border-rose-100 border-slate-100' : 'hover:border-teal-100 border-slate-100'
                  }`}
                >
                  <div>
                    <div className="h-40 w-full rounded-2xl overflow-hidden bg-slate-100 relative">
                      <img
                        src={item.images[0] || 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400'}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-102 transition-all duration-300"
                      />
                      
                      <span className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                        activeTab === 'lost' ? 'bg-rose-600 text-white' : 'bg-teal-600 text-white'
                      }`}>
                        {activeTab}
                      </span>
                    </div>

                    <div className="px-1 mt-3 space-y-1.5">
                      <span className="inline-block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        {item.category}
                      </span>
                      <h3 className={`font-bold text-slate-900 text-sm line-clamp-1 transition-colors ${
                        activeTab === 'lost' ? 'group-hover:text-rose-600' : 'group-hover:text-teal-600'
                      }`}>
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-1 mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(activeTab === 'lost' ? item.dateLost : item.dateFound).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
