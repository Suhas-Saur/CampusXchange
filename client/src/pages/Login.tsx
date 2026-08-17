import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState<string>('student@lnmiit.ac.in');
  const [password, setPassword] = useState<string>('password123');
  const [formError, setFormError] = useState<string | null>(null);

  const { login, user, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  // Clear errors on load
  useEffect(() => {
    setError(null);
  }, [setError]);

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Handled by context
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-10 left-10 w-64 h-64 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden min-h-[500px]"
      >
        {/* Left Side: Split Dashboard Preview Panel */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-brand-900 via-indigo-950 to-slate-950 p-10 flex-col justify-between text-white relative">
          <div className="absolute top-0 right-0 left-0 bottom-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-800/20 via-transparent to-transparent pointer-events-none"></div>
          
          <div>
            <Link to="/" className="flex items-center gap-2 mb-12">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" className="h-6 w-6">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
              </svg>
              <span className="font-extrabold text-lg tracking-tight">CampusConnect</span>
            </Link>

            <h2 className="text-2xl font-bold leading-tight mb-4">
              Connect and trade inside your campus.
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Find, list, buy, or trade items inside your secure campus boundaries. Registration is limited strictly to verified college domains.
            </p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-2">DEMO CREDENTIALS</p>
            <div className="space-y-1 text-xs text-slate-300">
              <p><span className="font-medium text-slate-100">Student:</span> student@lnmiit.ac.in</p>
              <p><span className="font-medium text-slate-100">Admin:</span> admin@lnmiit.ac.in</p>
              <p><span className="font-medium text-slate-100">Password:</span> password123</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="text-left mb-8">
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 mb-6 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Home
              </Link>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 text-sm mt-1.5">
                Sign in to search for lost belongings or list marketplace products.
              </p>
            </div>

            {/* Error alerts */}
            {(formError || error) && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertCircle className="h-4.5 w-4.5 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Sign In Failed</p>
                  <p className="mt-0.5 text-rose-700/90">{formError || error}</p>
                </div>
              </div>
            )}

            {/* Role Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6 max-w-xs">
              <button
                type="button"
                onClick={() => {
                  setRole('student');
                  setEmail('student@lnmiit.ac.in');
                  setPassword('password123');
                }}
                className={`flex-1 text-center py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  role === 'student'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Student Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setEmail('admin@lnmiit.ac.in');
                  setPassword('password123');
                }}
                className={`flex-1 text-center py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  role === 'admin'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Admin Profile
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  College Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50 hover:bg-slate-50"
                    placeholder="student@lnmiit.ac.in"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50 hover:bg-slate-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-brand-500/25 transition-all text-sm mt-8 disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="text-center mt-8 text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:underline">
                Create one here
              </Link>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center mt-12 max-w-[280px] mx-auto leading-normal">
              Only verified members belonging to the college domain are allowed access.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
