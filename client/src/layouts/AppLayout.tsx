import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import {
  Home,
  ShoppingBag,
  AlertTriangle,
  Compass,
  User,
  LogOut,
  Bell,
  MessageSquare,
  Plus,
  X,
  PlusCircle,
  FileText,
  DollarSign,
  LayoutDashboard
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();

  const [notificationsCount, setNotificationsCount] = useState<number>(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showQuickActionMenu, setShowQuickActionMenu] = useState<boolean>(false);
  
  // Real-time toast state
  const [toast, setToast] = useState<{ title: string; message: string; type: string } | null>(null);

  // Exclude auth-free routes
  const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);

  // Fetch unread notifications
  useEffect(() => {
    if (user && !isPublicRoute) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/api/notifications');
          setNotifications(res.data);
          setNotificationsCount(res.data.filter((n: any) => !n.read).length);
        } catch (err) {
          console.error('Failed to load notifications');
        }
      };
      fetchNotifications();
    }
  }, [user, location.pathname]);

  // Real-time Socket notifications handler
  useEffect(() => {
    if (socket) {
      socket.on('notification', (newNotif: any) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setNotificationsCount((count) => count + 1);
        setToast({
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type
        });
      });

      socket.on('new_message', (chatData: any) => {
        // If not already on messages screen, display toast alert
        if (location.pathname !== '/messages') {
          setToast({
            title: `New message from ${chatData.sender.name}`,
            message: chatData.message.message,
            type: 'message'
          });
        }
      });

      return () => {
        socket.off('notification');
        socket.off('new_message');
      };
    }
  }, [socket, location.pathname]);

  // Auto close toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/mark-read', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setNotificationsCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      // recalculate count
      setNotificationsCount(notifications.filter((n) => n._id !== id && !n.read).length);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect non-authenticated visitors
  if (!user && !isPublicRoute) {
    navigate('/login');
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col pb-20 lg:pb-0 bg-[#fafafc]">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 left-5 md:left-auto md:w-96 z-50 rounded-2xl bg-white border border-slate-100 p-4 shadow-xl card-glass cursor-pointer"
            onClick={() => {
              if (toast.type === 'message') {
                navigate('/messages');
              } else {
                navigate('/orders');
              }
              setToast(null);
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-500 animate-ping"></span>
                  {toast.title}
                </p>
                <p className="text-slate-600 text-xs mt-1 line-clamp-2">{toast.message}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToast(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100/80 z-40 hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" className="h-7 w-7">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
              </svg>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-indigo-800 bg-clip-text text-transparent">
                CampusXchange
              </span>
            </Link>

            {user && (
              <nav className="flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/marketplace"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/marketplace') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  to="/lost-found"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/lost-found') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                  }`}
                >
                  Lost & Found
                </Link>
                <Link
                  to="/orders"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/orders') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                  }`}
                >
                  My Activity
                </Link>
                <Link
                  to="/seller-dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/seller-dashboard') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                  }`}
                >
                  Seller Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors text-rose-600 hover:bg-rose-50 ${
                      isActive('/admin') ? 'bg-rose-50' : ''
                    }`}
                  >
                    Admin Panel
                  </Link>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/messages"
                  className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-50 rounded-xl relative transition-all"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>

                {/* Notifications dropdown trigger */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                    className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-50 rounded-xl relative transition-all"
                  >
                    <Bell className="h-5 w-5" />
                    {notificationsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotificationDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotificationDropdown(false)}></div>
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 shadow-xl rounded-2xl p-4 z-50 max-h-96 overflow-y-auto"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                            <button onClick={markAllAsRead} className="text-xs text-brand-600 hover:underline">
                              Mark all as read
                            </button>
                          </div>
                          {notifications.length === 0 ? (
                            <p className="text-slate-500 text-xs py-4 text-center">No notifications yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {notifications.map((n) => (
                                <div
                                  key={n._id}
                                  className={`p-2 rounded-xl text-left border transition-all ${
                                    n.read ? 'bg-white border-transparent' : 'bg-brand-50/50 border-brand-100'
                                  }`}
                                >
                                  <div className="flex justify-between">
                                    <span className="font-medium text-xs text-slate-950">{n.title}</span>
                                    <button onClick={(e) => clearNotification(n._id, e)} className="text-slate-400 hover:text-rose-500">
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-6 w-px bg-slate-200"></div>

                <Link to="/profile" className="flex items-center gap-2 group">
                  <img
                    src={user.profileImage || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-brand-100"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500">{user.studentId}</p>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-brand-600 px-4 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/25">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header Bar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 block lg:hidden">
        <div className="h-14 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" className="h-5 w-5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
            </svg>
            <span className="font-extrabold text-md bg-gradient-to-r from-brand-600 to-indigo-800 bg-clip-text text-transparent">
              CampusXchange
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-2">
              <Link to="/messages" className="p-2 text-slate-500 rounded-lg relative">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <Link to="/notifications" className="p-2 text-slate-500 rounded-lg relative">
                <Bell className="h-5 w-5" />
                {notificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
                )}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main View Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>

      {/* Mobile Floating Action Button (FAB) and Quick Action List */}
      {user && (
        <div className="fixed bottom-24 right-4 z-40 lg:hidden">
          <AnimatePresence>
            {showQuickActionMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30"
                  onClick={() => setShowQuickActionMenu(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.9 }}
                  className="absolute bottom-16 right-0 z-40 w-48 bg-white border border-slate-100 rounded-2xl p-2 shadow-2xl flex flex-col space-y-1"
                >
                  <button
                    onClick={() => {
                      setShowQuickActionMenu(false);
                      navigate('/sell');
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium text-left"
                  >
                    <DollarSign className="h-4.5 w-4.5 text-emerald-500" />
                    Sell an Item
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickActionMenu(false);
                      navigate('/report-lost');
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium text-left"
                  >
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
                    Report Lost Item
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickActionMenu(false);
                      navigate('/report-found');
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium text-left"
                  >
                    <Compass className="h-4.5 w-4.5 text-teal-500" />
                    Report Found Item
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickActionMenu(false);
                      navigate('/seller-dashboard');
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium text-left"
                  >
                    <LayoutDashboard className="h-4.5 w-4.5 text-brand-500" />
                    Seller Dashboard
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowQuickActionMenu(!showQuickActionMenu)}
            className="h-14 w-14 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/35 hover:scale-105 active:scale-95 transition-all z-40 relative"
          >
            <motion.div
              animate={{ rotate: showQuickActionMenu ? 135 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <Plus className="h-6 w-6" />
            </motion.div>
          </button>
        </div>
      )}

      {/* Mobile Bottom Tab Navigation */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 block lg:hidden">
          <div className="h-16 grid grid-cols-5">
            <Link
              to="/dashboard"
              className={`flex flex-col items-center justify-center text-xs transition-colors ${
                isActive('/dashboard') ? 'text-brand-600' : 'text-slate-400'
              }`}
            >
              <LayoutDashboard className="h-5 w-5 mb-0.5" />
              <span>Home</span>
            </Link>
            <Link
              to="/lost-found"
              className={`flex flex-col items-center justify-center text-xs transition-colors ${
                isActive('/lost-found') ? 'text-brand-600' : 'text-slate-400'
              }`}
            >
              <AlertTriangle className="h-5 w-5 mb-0.5" />
              <span>Lost/Found</span>
            </Link>
            <div className="flex items-center justify-center">
              {/* Center spacing for the floating action button */}
            </div>
            <Link
              to="/marketplace"
              className={`flex flex-col items-center justify-center text-xs transition-colors ${
                isActive('/marketplace') ? 'text-brand-600' : 'text-slate-400'
              }`}
            >
              <ShoppingBag className="h-5 w-5 mb-0.5" />
              <span>Market</span>
            </Link>
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center text-xs transition-colors ${
                isActive('/profile') ? 'text-brand-600' : 'text-slate-400'
              }`}
            >
              <User className="h-5 w-5 mb-0.5" />
              <span>Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
};

