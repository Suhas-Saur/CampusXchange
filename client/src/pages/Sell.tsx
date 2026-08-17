import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Upload,
  X,
  Plus,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Sell: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  // Form states
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Books');
  const [price, setPrice] = useState<string>('');
  const [condition, setCondition] = useState<string>('good');
  const [location, setLocation] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const categories = [
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

  // If in edit mode, fetch details
  useEffect(() => {
    if (editId) {
      const fetchEditDetails = async () => {
        try {
          const res = await api.get(`/api/products/${editId}`);
          const p = res.data;
          setTitle(p.title);
          setDescription(p.description);
          setCategory(p.category);
          setPrice(p.price.toString());
          setCondition(p.condition);
          setLocation(p.location);
          setExistingImages(p.images);
        } catch (err) {
          console.error(err);
          setFormError('Failed to fetch details for edit.');
        }
      };
      fetchEditDetails();
    }
  }, [editId]);

  // Clean up previews URL on unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Limit to 5 images total
      const totalCount = files.length + selectedFiles.length + existingImages.length;
      if (totalCount > 5) {
        setFormError('You can upload at most 5 images.');
        return;
      }

      setFiles([...files, ...selectedFiles]);

      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const removeNewFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setFiles(files.filter((_, i) => i !== idx));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    if (!title || !description || !category || !price || !condition || !location) {
      setFormError('Please fill out all mandatory fields.');
      setLoading(false);
      return;
    }

    if (Number(price) < 0) {
      setFormError('Price cannot be negative.');
      setLoading(false);
      return;
    }

    if (files.length === 0 && existingImages.length === 0) {
      setFormError('Please upload at least one image showing the product condition.');
      setLoading(false);
      return;
    }

    // Build multipart form data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('condition', condition);
    formData.append('location', location);

    // If edit mode, append existing image array state
    if (editId) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      if (editId) {
        await api.put(`/api/products/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/marketplace');
      }, 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error processing listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 max-w-3xl mx-auto text-left">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm"
      >
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {editId ? 'Edit Product Listing' : 'Sell an Item'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Turn your old books, sheets, calculators, or devices into instant cash.
          </p>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
            <h2 className="text-2xl font-bold text-slate-900">Listing Saved!</h2>
            <p className="text-slate-500 text-sm">
              Your item was listed on the campus marketplace successfully. Redirecting...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertCircle className="h-4.5 w-4.5 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Listing Error</p>
                  <p className="mt-0.5 text-rose-700/90">{formError}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Product Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Casio Scientific Calculator fx-991EX"
                  className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50 hover:bg-slate-50"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="State details such as wear condition, notes about usage, missing pages, or charging components."
                  className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50 hover:bg-slate-50"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50"
                >
                  {categories.filter(c => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50"
                >
                  <option value="new">Brand New (Unopened)</option>
                  <option value="like_new">Like New (Barely Used)</option>
                  <option value="good">Good (Normal wear, fully working)</option>
                  <option value="fair">Fair (Visible scratches, working)</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Price (INR ₹)
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="₹950"
                  className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50 hover:bg-slate-50"
                />
              </div>

              {/* Pickup location */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Pickup Coordination / Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hostel A lobby / Library Canteen"
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50 hover:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Images upload dropzone */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Upload Images (Maximum 5)
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Render existing images in edit mode */}
                {existingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} className="h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 relative group">
                    <img src={img} alt="preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-slate-950/70 text-white rounded-full hover:bg-rose-600 transition-colors opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Render new selected image previews */}
                {previews.map((preview, idx) => (
                  <div key={`new-${idx}`} className="h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 relative group">
                    <img src={preview} alt="preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-slate-950/70 text-white rounded-full hover:bg-rose-600 transition-colors opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* File input tile */}
                {(files.length + existingImages.length) < 5 && (
                  <label className="h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-500 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-brand-600 transition-all bg-slate-50/20">
                    <Upload className="h-5 w-5" />
                    <span className="text-[9px] font-bold mt-1 uppercase tracking-wide">Add Image</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-brand-500/25 transition-all text-sm mt-8 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : editId ? (
                'Save Changes'
              ) : (
                'Post Listing'
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
