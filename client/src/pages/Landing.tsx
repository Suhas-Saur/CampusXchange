import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  AlertTriangle,
  Users,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Sparkles,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <div className="overflow-hidden bg-[#fafafc]">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-6"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Introducing CampusXchange 2.0</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6"
          >
            Your Campus. Your Community.<br />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-800 bg-clip-text text-transparent">
              One Unified Platform.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Find lost belongings, discover affordable college essentials, and connect securely with verified classmates across your campus.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              to={user ? '/marketplace' : '/register'}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-brand-500/25 transition-all text-base"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/lost-found"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/80 active:scale-98 text-slate-700 font-semibold px-8 py-4 rounded-2xl shadow-sm transition-all text-base"
            >
              <span>Lost & Found</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Interactive Dashboard Visual Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto rounded-3xl border border-slate-100/80 bg-white/70 backdrop-blur-md p-4 md:p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-rose-400"></span>
              <span className="h-3.5 w-3.5 rounded-full bg-amber-400"></span>
              <span className="h-3.5 w-3.5 rounded-full bg-emerald-400"></span>
            </div>
            <span className="text-xs text-slate-400 font-medium">campusconnect.lnmiit.ac.in/dashboard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Marketplace Card Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-48">
              <div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  MARKETPLACE
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-3">fx-991EX Scientific Calculator</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">High performance computing helper in perfect conditions.</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-brand-600 font-bold text-base">₹950</span>
                <span className="text-slate-400 text-xs">By Amit S. (4th Year)</span>
              </div>
            </div>

            {/* Lost Card Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-48">
              <div>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
                  LOST WARNING
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-3">Black Leather Fossil Wallet</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">Dropped near the sports arena. Has Student ID card and cash.</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-rose-500 text-xs font-semibold">Reward Offered</span>
                <span className="text-slate-400 text-xs">Lost 2 hours ago</span>
              </div>
            </div>

            {/* Found Card Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-48">
              <div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                  FOUND ITEM
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-3">Boat Over-Ear Headphones</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">Found sitting on cafeteria table bench. Power button works.</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-indigo-600 text-xs font-semibold">Resolved Match</span>
                <span className="text-slate-400 text-xs">Found in Library</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-gradient-to-r from-brand-900 to-indigo-950 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-4">
            <p className="text-3xl md:text-5xl font-extrabold text-brand-300">1,200+</p>
            <p className="text-slate-300 text-sm mt-2 font-medium">Students Connected</p>
          </div>
          <div className="p-4">
            <p className="text-3xl md:text-5xl font-extrabold text-brand-300">450+</p>
            <p className="text-slate-300 text-sm mt-2 font-medium">Items Recovered</p>
          </div>
          <div className="p-4">
            <p className="text-3xl md:text-5xl font-extrabold text-brand-300">800+</p>
            <p className="text-slate-300 text-sm mt-2 font-medium">Products Listed</p>
          </div>
          <div className="p-4">
            <p className="text-3xl md:text-5xl font-extrabold text-brand-300">99.8%</p>
            <p className="text-slate-300 text-sm mt-2 font-medium">Successful Transactions</p>
          </div>
        </div>
      </section>

      {/* How CampusXchange Works */}
      <section className="py-20 md:py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900">How CampusXchange Works</h2>
          <p className="text-slate-500 mt-3 text-sm">Four simple steps to safely access books, calculate math problems, or trace lost cards on campus.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center p-4">
            <div className="h-16 w-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-xl font-bold shadow-md shadow-brand-100/50 mb-6">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Create Account</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Sign up with your official college email address for immediate campus clearance.</p>
          </div>

          <div className="text-center p-4">
            <div className="h-16 w-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-xl font-bold shadow-md shadow-brand-100/50 mb-6">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Find or List Items</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Report things you found, request lost ones, or post marketplace notebooks for cash.</p>
          </div>

          <div className="text-center p-4">
            <div className="h-16 w-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-xl font-bold shadow-md shadow-brand-100/50 mb-6">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Connect with Students</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Discuss pickup coordinates, timings, and verify details safely using the secure live chat.</p>
          </div>

          <div className="text-center p-4">
            <div className="h-16 w-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-xl font-bold shadow-md shadow-brand-100/50 mb-6">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Pay Securely</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Checkout using standard UPI QR codes via Razorpay sandbox. Zero delivery stress.</p>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-20 bg-slate-50 border-y border-slate-100 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Built Specifically for Students</h2>
            <p className="text-slate-500 mt-3 text-sm">A centralized web workspace built on security, speed, and clean communication designs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm card-hover text-left">
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Lost & Found</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Trace missing credit cards, laptops, or textbooks within seconds using robust query filters.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm card-hover text-left">
              <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Student Marketplace</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Exchange textbooks, exam notes, calculators, and lab tools with direct coordinates agreements.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm card-hover text-left">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Secure Payments</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Payments are verified via Razorpay sandbox. Orders are held in pending states until signature confirmation is locked.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm card-hover text-left">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Verified Students Only</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Registration strict checks filter out external scammers. Only members of the local campus domain get inside.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm card-hover text-left">
              <div className="h-12 w-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Campus Community</h3>
              <p className="text-slate-500 text-xs leading-relaxed">P2P student connection avoids commercial shipment delays. Pick up items directly at libraries or cafeterias.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm card-hover text-left">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Real-Time Chat & Alerts</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Instant notifications and text messaging powered by WebSockets to coordinate handovers instantly.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
