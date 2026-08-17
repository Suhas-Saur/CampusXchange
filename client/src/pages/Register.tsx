import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, BookOpen, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export const Register: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [department, setDepartment] = useState<string>('Computer Science');
  const [year, setYear] = useState<number>(1);
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [formError, setFormError] = useState<string | null>(null);

  const { register, user, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  // Allowed college domain
  const COLLEGE_EMAIL_DOMAIN = 'lnmiit.ac.in';

  useEffect(() => {
    setError(null);
  }, [setError]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validations
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please enter name, email, password, and confirmation.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await register({
        name,
        email,
        studentId,
        department,
        year: Number(year),
        phone,
        password
      });
      navigate('/dashboard');
    } catch (err: any) {
      // Handled by context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-10 right-10 w-72 h-72 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-35 pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden"
      >
        <div className="p-6 md:p-10">
          <div className="text-left mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 mb-4 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create Student Account
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Access marketplace items and lost & found tools across the campus.
              </p>
            </div>
            
            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-3 flex items-center gap-2 max-w-xs">
              <Shield className="h-5 w-5 text-brand-600 shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">COLLEGE LOCK</p>
                <p className="text-[11px] font-semibold text-brand-800">@{COLLEGE_EMAIL_DOMAIN} required</p>
              </div>
            </div>
          </div>

          {/* Errors box */}
          {(formError || error) && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="h-4.5 w-4.5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Registration Failed</p>
                <p className="mt-0.5 text-rose-700/90">{formError || error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50 hover:bg-slate-50"
                    placeholder="Suhas Reddy"
                  />
                </div>
              </div>

              {/* College email */}
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
                    placeholder={`student@${COLLEGE_EMAIL_DOMAIN}`}
                  />
                </div>
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Student Roll Number / ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50 hover:bg-slate-50"
                    placeholder="2023CSE089"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50 hover:bg-slate-50"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50"
                  >
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Electronics & Comm">Electronics & Comm Engineering</option>
                    <option value="Computer & Comm">Computer & Comm Engineering</option>
                    <option value="Mechanical Eng">Mechanical Engineering</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50"
                >
                  <option value={1}>1st Year (Freshman)</option>
                  <option value={2}>2nd Year (Sophomore)</option>
                  <option value={3}>3rd Year (Junior)</option>
                  <option value={4}>4th Year (Senior)</option>
                  <option value={5}>5th Year (Dual Degree)</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Password (min 6 chars)
                </label>
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all bg-slate-50/50 hover:bg-slate-50"
                    placeholder="••••••••"
                  />
                </div>
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
                'Register & Verify'
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Sign in here
            </Link>
        </div>
      </div>
    </motion.div>
  </div>
);
};
