import React, { useState } from 'react';
import api from '../services/api';
import { Search, Clock, ShieldCheck, Mail, Calendar, User } from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const [itemId, setItemId] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      
      // Fetch orders/applications for this product ID where the current user is the seller
      const res = await api.get(`/api/orders?productId=${itemId.trim()}&role=seller`);
      setApplications(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Error retrieving applications. Make sure the Item ID is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 text-center max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold text-[#8b5cf6] tracking-tight mb-2">
          Seller Dashboard
        </h1>
        <div className="w-16 h-1 bg-[#8b5cf6] mx-auto mb-8 rounded-full"></div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
          ENTER ITEM ID TO SEE APPLICATIONS:
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="flex justify-center items-center gap-3 max-w-md mx-auto">
        <input
          type="text"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          placeholder="e.g. mock_prod_1"
          className="px-4 py-3 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent text-sm w-64 bg-white shadow-sm"
        />
        <button
          type="submit"
          className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-3 px-6 rounded-2xl text-sm shadow-md shadow-[#8b5cf6]/20 transition-all hover:scale-102 active:scale-98"
        >
          Search
        </button>
      </form>

      {/* Search Results */}
      <div className="mt-12 text-left">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8b5cf6] border-t-transparent"></div>
          </div>
        )}

        {!loading && error && (
          <div className="text-rose-500 text-center text-sm">{error}</div>
        )}

        {!loading && searched && applications.length === 0 && (
          <p className="text-slate-400 text-center text-sm py-8">
            No applications found for this Item ID.
          </p>
        )}

        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-all text-left"
              >
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-850 text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    Buyer ID: {app.buyerId?.name || app.buyerId}
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    Email: {app.buyerId?.email || 'N/A'}
                  </p>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  Message: {app.pickupLocation ? `Coordinate handover at ${app.pickupLocation}` : 'I want to buy this item!'}
                </p>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                      app.paymentStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                        : 'bg-amber-50 text-amber-700 border border-amber-100/50'
                    }`}>
                      {app.paymentStatus === 'paid' ? 'ACCEPTED' : 'PENDING'}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Applied on: {new Date(app.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
