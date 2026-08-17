import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  MapPin,
  Clock,
  Inbox,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('All');
  const [condition, setCondition] = useState<string>('');
  const [sort, setSort] = useState<string>('newest');
  
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [savedItems, setSavedItems] = useState<string[]>([]);

  const categories = [
    'All',
    'Books',
    'Notes',
    'Electronics',
    'Calculators',
    'Lab Equipment',
    'College Supplies',
    'Stationery',
    'Bags',
    'Accessories',
    'Furniture',
    'Other'
  ];

  // Debounced search helper
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, condition, sort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/api/products?sort=${sort}&status=available`;
      if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;
      if (condition) url += `&condition=${condition}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load marketplace listings', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveItem = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (savedItems.includes(id)) {
      setSavedItems(savedItems.filter(item => item !== id));
    } else {
      setSavedItems([...savedItems, id]);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header and Search Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Marketplace</h1>
          <p className="text-slate-500 text-sm mt-1">Buy and sell college essentials within LNM Institute.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-fit space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Search Products</h3>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Books, calculators..."
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
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Item Condition</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'All', value: '' },
                { label: 'New', value: 'new' },
                { label: 'Like New', value: 'like_new' },
                { label: 'Good', value: 'good' },
                { label: 'Fair', value: 'fair' }
              ].map((cond) => (
                <button
                  key={cond.label}
                  onClick={() => setCondition(cond.value)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all text-center ${
                    condition === cond.value
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid Content Area */}
        <div className="flex-grow space-y-6">
          
          {/* Toolbar controllers */}
          <div className="bg-white border border-slate-100 rounded-2xl p-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl"
                title="Filters"
              >
                <SlidersHorizontal className="h-4.5 w-4.5" />
              </button>

              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-xs">
                <Tag className="h-3.5 w-3.5" />
                <span>{products.length} Listings Available</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Sort by:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 rounded-3xl border border-slate-100 bg-white p-4 space-y-4">
                  <div className="h-40 w-full rounded-2xl skeleton-loader"></div>
                  <div className="h-5 w-3/4 rounded skeleton-loader"></div>
                  <div className="h-4 w-1/2 rounded skeleton-loader"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl py-20 text-center max-w-xl mx-auto shadow-sm">
              <Inbox className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-extrabold text-slate-800 text-lg">No listings matches found</h3>
              <p className="text-slate-500 text-xs mt-1.5 px-6">
                We couldn't find items matching category "{category}" or search query "{search}". Try widening your range!
              </p>
              <button
                onClick={() => {
                  setCategory('All');
                  setSearch('');
                  setCondition('');
                }}
                className="mt-6 inline-flex bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/20"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/marketplace/${p._id}`)}
                  className="bg-white border border-slate-100 rounded-3xl p-3 flex flex-col justify-between shadow-sm card-hover group cursor-pointer"
                >
                  <div className="relative">
                    {/* Saved favorite toggle */}
                    <button
                      onClick={(e) => toggleSaveItem(p._id, e)}
                      className="absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md border z-10 transition-all bg-white/80 border-white/50 text-slate-500 hover:text-rose-500"
                    >
                      <Bookmark className={`h-4 w-4 ${savedItems.includes(p._id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    <div className="h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
                      <img
                        src={p.images[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'}
                        alt={p.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    </div>

                    <div className="px-1 mt-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-brand-50 border border-brand-100/50 text-brand-700 text-[9px] font-bold uppercase tracking-wider">
                        {p.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-1 mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">PRICE</p>
                      <p className="font-extrabold text-slate-950 text-lg">₹{p.price}</p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/checkout?productId=${p._id}`);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] py-2.5 px-4 rounded-xl shadow-md shadow-emerald-500/10 transition-all active:scale-95"
                    >
                      Pay & Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-up Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl z-50 lg:hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-slate-900 text-base">Filter Marketplace</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  Close
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Search</h4>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search titles..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                          category === cat
                            ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Condition</h4>
                  <div className="flex gap-2">
                    {[
                      { label: 'All', value: '' },
                      { label: 'New', value: 'new' },
                      { label: 'Like New', value: 'like_new' },
                      { label: 'Good', value: 'good' },
                      { label: 'Fair', value: 'fair' }
                    ].map((cond) => (
                      <button
                        key={cond.label}
                        onClick={() => setCondition(cond.value)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs border text-center ${
                          condition === cond.value
                            ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {cond.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
