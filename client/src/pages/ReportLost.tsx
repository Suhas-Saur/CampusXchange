import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ReportLost: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Step State
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Electronics');
  const [description, setDescription] = useState<string>('');
  const [dateLost, setDateLost] = useState<string>('');
  const [timeLost, setTimeLost] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [identifyingDetails, setIdentifyingDetails] = useState<string>('');

  // Files
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categories = [
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

  // Clean previews on unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        setFormError('You can upload at most 5 images.');
        return;
      }
      setFiles([...files, ...selectedFiles]);
      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setFiles(files.filter((_, i) => i !== idx));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  const validateStep1 = () => {
    setFormError(null);
    if (!title || !category || !description || !dateLost || !location) {
      setFormError('Please enter all required specifications.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    // Combine fields into description for comprehensive display
    const fullDescription = `${description}\n\n[Specifications]\n- Color: ${color || 'N/A'}\n- Brand: ${brand || 'N/A'}\n- Time Lost: ${timeLost || 'Approximate'}\n- Details: ${identifyingDetails || 'None'}`;
    
    formData.append('description', fullDescription);
    formData.append('location', location);
    formData.append('dateLost', dateLost);

    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      await api.post('/api/lost', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStep(4);
      setTimeout(() => {
        navigate('/lost-found');
      }, 3000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error publishing report.');
      setStep(1); // fallback to edit
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 max-w-2xl mx-auto text-left">
      <button
        onClick={() => navigate('/lost-found')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Cancel Report
      </button>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        
        {/* Step Indicator Header */}
        {step < 4 && (
          <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`h-2 w-8 rounded-full transition-all ${
                    step >= num ? 'bg-rose-500' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Step {step} of 3
            </span>
          </div>
        )}

        {formError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="h-4.5 w-4.5 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Review Errors</p>
              <p className="mt-0.5 text-rose-700/90">{formError}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: SPECIFICATIONS FORM */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Report Lost Belonging</h2>
                <p className="text-slate-500 text-xs mt-1">Provide exact specifications about your item so classmates can search and match it.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Item Name / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Fossil Black Leather Wallet"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50/50"
                  >
                    {categories.filter(c => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Meeting Location Lost
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. LT-3 Classroom / Cafeteria"
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Date Lost
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={dateLost}
                      onChange={(e) => setDateLost(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Approximate Time Lost
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={timeLost}
                      onChange={(e) => setTimeLost(e.target.value)}
                      placeholder="e.g. 5:30 PM"
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Matte Black / Navy Blue"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Brand (If applicable)
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Apple / Fossil / Lenskart"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Item Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter basic information about where you went or dropped the item."
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Unique Identifying Details
                  </label>
                  <input
                    type="text"
                    value={identifyingDetails}
                    onChange={(e) => setIdentifyingDetails(e.target.value)}
                    placeholder="e.g. Scratched logo / Cap shield keychain / Name card printed inside"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-6 rounded-2xl text-xs transition-all flex items-center gap-1.5"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: UPLOAD IMAGES */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Upload Item Photos</h2>
                <p className="text-slate-500 text-xs mt-1">If you have photos of the item or matching references, upload them here (max 5).</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
                {previews.map((preview, idx) => (
                  <div key={idx} className="h-24 rounded-2xl border overflow-hidden relative group bg-slate-50">
                    <img src={preview} alt="preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-slate-900/85 text-white rounded-full hover:bg-rose-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {files.length < 5 && (
                  <label className="h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-rose-500 flex flex-col items-center justify-center text-slate-400 hover:text-rose-600 transition-all bg-slate-50/20 cursor-pointer">
                    <Upload className="h-5 w-5" />
                    <span className="text-[9px] font-bold mt-1 uppercase tracking-wide">Add Photo</span>
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

              <div className="flex justify-between pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 border border-slate-200 rounded-2xl text-slate-600 text-xs hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-6 rounded-2xl text-xs transition-all flex items-center gap-1.5"
                >
                  Review Summary
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SUMMARY REVIEW */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Review Report Summary</h2>
                <p className="text-slate-500 text-xs mt-1">Check that all details are correct before publishing it to the college.</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs space-y-3">
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-slate-400 font-medium">Item Title:</span>
                  <span className="text-slate-900 font-bold">{title}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-slate-400 font-medium">Category:</span>
                  <span className="text-slate-900 font-semibold">{category}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-slate-400 font-medium">Location Lost:</span>
                  <span className="text-slate-900 font-medium">📍 {location}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-slate-400 font-medium">Date Lost:</span>
                  <span className="text-slate-900 font-medium">{dateLost}</span>
                </div>
                {color && (
                  <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-400 font-medium">Color:</span>
                    <span className="text-slate-900 font-medium">{color}</span>
                  </div>
                )}
                {brand && (
                  <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-400 font-medium">Brand:</span>
                    <span className="text-slate-900 font-medium">{brand}</span>
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-slate-400 font-medium mb-1">Description:</span>
                  <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200/50 leading-relaxed font-normal">{description}</p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 border border-slate-200 rounded-2xl text-slate-600 text-xs hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/25 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Publish Report
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 text-center space-y-6"
            >
              <div className="h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-100/50">
                <CheckCircle className="h-10 w-10 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Report Broadcasted!</h2>
                <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                  Your lost item details have been broadcasted to the college feed. You will receive notifications when matches are flagged.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
