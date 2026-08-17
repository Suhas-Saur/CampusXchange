import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  AlertTriangle,
  Compass,
  ChevronLeft,
  MessageSquare,
  Flag,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LostFoundDetail: React.FC = () => {
  const params = useParams<{ type: 'lost' | 'found'; id: string }>();
  const type = params.type || 'lost';
  const id = params.id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        // Fetch from /api/lost/:id or /api/found/:id
        const res = await api.get(`/api/${type}/${id}`);
        setItem(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error loading post details.');
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [type, id]);

  const handleContact = () => {
    if (!item) return;
    navigate(`/messages?partnerId=${item.userId._id}`);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    try {
      await api.post('/api/reports', {
        targetType: type === 'lost' ? 'lost_item' : 'found_item',
        targetId: item._id,
        reason: reportReason
      });
      setReportSuccess(true);
      setReportReason('');
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const markResolved = async () => {
    try {
      if (confirm('Mark this report as resolved? It will be archived.')) {
        await api.put(`/api/${type}/${id}`, { status: 'resolved' });
        navigate('/lost-found');
      }
    } catch (err) {
      console.error(err);
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

  if (error || !item) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="font-extrabold text-slate-800 text-lg">Report Error</h3>
        <p className="text-slate-500 text-sm mt-1">{error || 'This report is no longer available.'}</p>
        <button
          onClick={() => navigate('/lost-found')}
          className="mt-6 inline-flex bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md"
        >
          Return to Portal
        </button>
      </div>
    );
  }

  const isOwner = user?._id === item.userId?._id;

  return (
    <div className="py-6 max-w-4xl mx-auto text-left">
      <button
        onClick={() => navigate('/lost-found')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Portal
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-100 rounded-3xl p-4 md:p-8 shadow-sm">
        
        {/* Left Side: Images */}
        <div className="lg:col-span-6 space-y-4">
          <div className="h-[280px] md:h-[350px] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative">
            <img
              src={item.images[0] || 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600'}
              alt={item.title}
              className="h-full w-full object-cover"
            />
            {item.status === 'resolved' && (
              <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center backdrop-blur-xs">
                <span className="bg-emerald-600 text-white font-extrabold px-6 py-2.5 rounded-xl border border-white/20 uppercase tracking-widest text-xs">
                  Resolved / Recovered
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                type === 'lost' ? 'bg-rose-50 border border-rose-100 text-rose-700' : 'bg-teal-50 border border-teal-100 text-teal-700'
              }`}>
                {type.toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                {item.category}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {item.title}
            </h1>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">LOCATION</p>
                <p className="font-semibold text-slate-700 mt-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  {item.location}
                </p>
              </div>
              
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">DATE RECORDED</p>
                <p className="font-semibold text-slate-700 mt-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  {new Date(type === 'lost' ? item.dateLost : item.dateFound).toLocaleDateString(undefined, {
                    dateStyle: 'medium'
                  })}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Description</h3>
              <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>
          </div>

          {/* User overview (Privacy locks active phone/email details publicly) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <img
              src={item.userId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.userId?.name || '')}`}
              alt={item.userId?.name}
              className="h-10 w-10 rounded-full border border-slate-200"
            />
            <div className="text-left flex-grow">
              <p className="text-xs font-bold text-slate-950">Reported by {item.userId?.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {item.userId?.department} • Year {item.userId?.year || 1}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-50">
            {isOwner ? (
              <div className="flex gap-2">
                {item.status !== 'resolved' && (
                  <button
                    onClick={markResolved}
                    className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-center text-xs"
                  >
                    Mark Resolved
                  </button>
                )}
                
                <button
                  onClick={async () => {
                    if (confirm('Delete this report?')) {
                      await api.delete(`/api/${type}/${item._id}`);
                      navigate('/lost-found');
                    }
                  }}
                  className="bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-semibold py-3 px-6 rounded-xl text-xs"
                >
                  Delete Report
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <button
                    disabled={item.status === 'resolved'}
                    onClick={handleContact}
                    className="flex-grow flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 active:scale-98 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-brand-500/20 text-xs transition-all"
                  >
                    <MessageSquare className="h-4.5 w-4.5" />
                    Contact Claimant
                  </button>
                </div>
                
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    Private credentials hidden
                  </span>
                  
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="text-[11px] font-medium text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Flag Listing
                  </button>
                </div>
              </>
            )}
          </div>

        </div>

      </div>

      {/* Flag Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 p-6 max-w-md w-full shadow-2xl z-10 text-left relative"
          >
            <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-1.5">
              <Flag className="h-4.5 w-4.5 text-rose-500" />
              Flag Report
            </h3>
            
            {reportSuccess ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-slate-800 text-sm">Report Logged</p>
                <p className="text-slate-500 text-xs mt-1">Thank you. Moderators will review this post shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <p className="text-slate-500 text-xs leading-relaxed">
                  Provide details about why this report is inappropriate or false.
                </p>
                <div>
                  <textarea
                    required
                    rows={4}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Reason..."
                    className="w-full border border-slate-200 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Flag Post
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
