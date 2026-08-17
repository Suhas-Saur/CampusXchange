import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Shield,
  BookOpen,
  Phone,
  Mail,
  Camera,
  AlertCircle,
  CheckCircle,
  ShoppingBag,
  AlertTriangle,
  Lock,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();

  // Profile Edit fields
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [year, setYear] = useState<number>(1);
  const [profileImage, setProfileImage] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Tab Listings states
  const [listingsCount, setListingsCount] = useState<number>(0);
  const [lostCount, setLostCount] = useState<number>(0);
  const [foundCount, setFoundCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setDepartment(user.department);
      setYear(user.year);
      setProfileImage(user.profileImage);
      
      // Fetch aggregate metrics count
      fetchMetricsCounts();
    }
  }, [user]);

  const fetchMetricsCounts = async () => {
    try {
      const [prodRes, lostRes, foundRes] = await Promise.all([
        api.get(`/api/products?sellerId=${user?._id}`),
        api.get(`/api/lost?userId=${user?._id}`),
        api.get(`/api/found?userId=${user?._id}`)
      ]);
      setListingsCount(prodRes.data.length);
      setLostCount(lostRes.data.length);
      setFoundCount(foundRes.data.length);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setUpdating(true);

    try {
      const updateData: any = {
        name,
        phone,
        department,
        year
      };

      if (password) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setUpdating(false);
          return;
        }
        updateData.password = password;
      }

      await updateProfile(updateData);
      setSuccess(true);
      setPassword(''); // clear password
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Profile update failed.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="py-6 max-w-4xl mx-auto text-left">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account settings, credentials, and listed reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Avatar details card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <img
                src={profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`}
                alt={name}
                className="h-24 w-24 rounded-full border border-slate-100 object-cover"
              />
            </div>
            
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-900 text-base">{name}</h2>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{user?.studentId}</p>
            </div>

            <div className="w-full border-t border-slate-50 pt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-bold text-slate-900">{listingsCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Listings</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">{lostCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Lost</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">{foundCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Found</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-50 pb-2">Academic Validation</h3>
            <div className="flex gap-2.5 items-center text-slate-600">
              <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <span className="break-all">{user?.email}</span>
            </div>
            <div className="flex gap-2.5 items-center text-slate-600">
              <BookOpen className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <span>{department} • Year {year}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-50 pb-4 mb-6">Edit Profile Coordinates</h3>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertCircle className="h-4.5 w-4.5 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Update Error</p>
                  <p className="mt-0.5 text-rose-700/90">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Success</p>
                  <p className="mt-0.5 text-emerald-700/90">Your profile details were updated successfully.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/50"
                  >
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Electronics & Comm">Electronics & Comm Engineering</option>
                    <option value="Computer & Comm">Computer & Comm Engineering</option>
                    <option value="Mechanical Eng">Mechanical Engineering</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Academic Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/50"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                    <option value={5}>5th Year</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Update Password (leave blank to keep current)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-2xl text-xs shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
                >
                  {updating ? 'Saving changes...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
