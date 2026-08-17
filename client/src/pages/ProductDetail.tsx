import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Bookmark,
  Shield,
  MessageSquare,
  CreditCard,
  ChevronLeft,
  User,
  AlertTriangle,
  Flag,
  CheckCircle2,
  BookmarkCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChat = () => {
    if (!product) return;
    // Redirect to messages passing partnerId and productId
    navigate(`/messages?partnerId=${product.sellerId._id}&productId=${product._id}`);
  };

  const handleBuy = () => {
    if (!product) return;
    navigate(`/checkout?productId=${product._id}`);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    try {
      await api.post('/api/reports', {
        targetType: 'product',
        targetId: product._id,
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

  if (loading) {
    return (
      <div className="py-12 max-w-7xl mx-auto space-y-6 text-left">
        <div className="h-6 w-24 skeleton-loader rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 skeleton-loader rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 w-3/4 skeleton-loader rounded"></div>
            <div className="h-5 w-1/4 skeleton-loader rounded"></div>
            <div className="h-24 skeleton-loader rounded-2xl"></div>
            <div className="h-12 w-full skeleton-loader rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="font-extrabold text-slate-800 text-lg">Product Error</h3>
        <p className="text-slate-500 text-sm mt-1">{error || 'This listing no longer exists.'}</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="mt-6 inline-flex bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const isOwner = user?._id === product.sellerId?._id;

  return (
    <div className="py-6 max-w-5xl mx-auto text-left">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-100/80 rounded-3xl p-4 md:p-8 shadow-sm">
        
        {/* Left Side: Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="h-[300px] md:h-[400px] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative">
            <img
              src={product.images[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'}
              alt={product.title}
              className="h-full w-full object-cover"
            />
            {product.status === 'sold' && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-xs">
                <span className="bg-slate-900 text-white font-extrabold px-6 py-2.5 rounded-xl border border-white/20 uppercase tracking-widest text-sm">
                  Sold Out
                </span>
              </div>
            )}
          </div>
          
          {/* Small images grid if multiple images exist */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img: string, idx: number) => (
                <div key={idx} className="h-16 rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                  <img src={img} alt={`preview ${idx}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details info */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                Condition: {product.condition.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center justify-between py-2 border-y border-slate-50">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">CAMPUS PRICE</p>
                <p className="text-3xl font-black text-slate-950">₹{product.price}</p>
              </div>
              
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">LOCATION</p>
                <p className="text-xs font-semibold text-slate-700 flex items-center gap-1 justify-end">
                  <MapPin className="h-3.5 w-3.5 text-brand-500" />
                  {product.location}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Description</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Seller profile overview card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <img
              src={product.sellerId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(product.sellerId?.name || '')}`}
              alt={product.sellerId?.name}
              className="h-10 w-10 rounded-full border border-slate-200"
            />
            <div className="text-left flex-grow">
              <p className="text-xs font-bold text-slate-950">{product.sellerId?.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {product.sellerId?.department} • Year {product.sellerId?.year || 1}
              </p>
            </div>
            
            <div className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-xl text-[9px] font-bold border border-brand-100">
              VERIFIED STUDENT
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3 pt-4 border-t border-slate-50">
            {isOwner ? (
              <div className="flex gap-2">
                <Link
                  to={`/sell?editId=${product._id}`}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl text-center text-xs"
                >
                  Edit Listing
                </Link>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this listing?')) {
                      await api.delete(`/api/products/${product._id}`);
                      navigate('/marketplace');
                    }
                  }}
                  className="flex-1 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-semibold py-3 px-4 rounded-xl text-xs"
                >
                  Delete Listing
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <button
                    disabled={product.status === 'sold'}
                    onClick={handleBuy}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 active:scale-98 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-brand-500/20 text-xs transition-all"
                  >
                    <CreditCard className="h-4 w-4" />
                    Buy Now
                  </button>
                  <button
                    onClick={handleChat}
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 active:scale-98 text-slate-700 font-bold py-3.5 px-4 rounded-2xl border border-slate-200 text-xs transition-all"
                  >
                    <MessageSquare className="h-4 w-4 text-slate-500" />
                    Chat with Seller
                  </button>
                </div>
                
                <div className="flex justify-between items-center px-1">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-brand-600 flex items-center gap-1 transition-colors"
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 text-emerald-500" />
                        Saved to Wishlist
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" />
                        Save for Later
                      </>
                    )}
                  </button>
                  
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

      {/* Flag Moderation Modal */}
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
              Flag Product Listing
            </h3>
            
            {reportSuccess ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-slate-800 text-sm">Report Submitted</p>
                <p className="text-slate-500 text-xs mt-1">Thank you. Administrators will inspect this listing.</p>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <p className="text-slate-500 text-xs leading-relaxed">
                  Help us maintain a clean college platform. State the reason you believe this listing violates guidelines (e.g. offensive, mock items, excessive prices).
                </p>
                <div>
                  <textarea
                    required
                    rows={4}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Reason for report..."
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
                    Submit Report
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
