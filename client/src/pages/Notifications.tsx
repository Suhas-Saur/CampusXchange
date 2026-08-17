import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/mark-read', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotification = async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-left max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Bell className="h-5.5 w-5.5 text-brand-600" />
            Notifications
          </h1>
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl border border-slate-100 bg-white skeleton-loader"></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl py-16 text-center shadow-sm">
          <Bell className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 text-sm">No notifications</h3>
          <p className="text-slate-500 text-xs mt-1">We'll alert you about matches, payments, and chats here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all shadow-sm ${
                n.read ? 'bg-white border-slate-100' : 'bg-brand-50/50 border-brand-100'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0"></span>}
                  <span className="font-bold text-slate-900 text-xs">{n.title}</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <button
                onClick={() => clearNotification(n._id)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                title="Clear Notification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
