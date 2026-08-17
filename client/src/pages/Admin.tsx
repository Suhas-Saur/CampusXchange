import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  ShoppingBag,
  AlertTriangle,
  Compass,
  CreditCard,
  Flag,
  ShieldCheck,
  Search,
  UserX,
  UserCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Tab State
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'reports'>('overview');

  // Overview metrics
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    activeListings: 0,
    lostReports: 0,
    foundReports: 0,
    recoveredItems: 0,
    totalOrders: 0,
    successfulPayments: 0,
    revenue: 0
  });

  // Moderation lists
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState<string>('');
  const [userDept, setUserDept] = useState<string>('All');

  useEffect(() => {
    fetchAdminData();
  }, [adminTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      if (adminTab === 'overview') {
        const statsRes = await api.get('/api/admin/stats');
        setStats(statsRes.data);
      } else if (adminTab === 'users') {
        let url = '/api/admin/users';
        if (userSearch) url += `?search=${encodeURIComponent(userSearch)}`;
        if (userDept !== 'All') url += `${userSearch ? '&' : '?'}department=${encodeURIComponent(userDept)}`;
        const usersRes = await api.get(url);
        setUsersList(usersRes.data);
      } else if (adminTab === 'reports') {
        const reportsRes = await api.get('/api/admin/reports');
        setReportsList(reportsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce user search
  useEffect(() => {
    if (adminTab === 'users') {
      const delayDebounce = setTimeout(() => {
        fetchAdminData();
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [userSearch, userDept]);

  const toggleUserStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (confirm(`Are you sure you want to change user status to ${nextStatus.toUpperCase()}?`)) {
      try {
        await api.put(`/api/admin/users/${id}/status`, { status: nextStatus });
        fetchAdminData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resolveFlagReport = async (id: string) => {
    try {
      await api.put(`/api/admin/reports/${id}/status`, { status: 'resolved' });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
        <p className="text-slate-500 text-sm mt-1">Platform moderation panel for LNM Institute coordinators.</p>
      </div>

      {/* Tabs list */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setAdminTab('overview')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              adminTab === 'overview'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setAdminTab('users')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              adminTab === 'users'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Student Directory
          </button>

          <button
            onClick={() => setAdminTab('reports')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1 ${
              adminTab === 'reports'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Flag className="h-4 w-4" />
            Flagged Items
          </button>
        </div>
      </div>

      {/* OVERVIEW PANEL */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-3xl font-black text-indigo-650 mb-2">{stats.totalStudents || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL USERS</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-3xl font-black text-rose-500 mb-2">{stats.lostReports || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LOST ITEMS</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-3xl font-black text-emerald-500 mb-2">{stats.foundReports || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FOUND ITEMS</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-3xl font-black text-[#8b5cf6] mb-2">{stats.activeListings || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MARKETPLACE ITEMS</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-3xl font-black text-[#8b5cf6] mb-2">{stats.totalOrders || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">APPLICATIONS</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <p className="text-3xl font-black text-emerald-500 mb-2">
                {stats.completedOrders || 0}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MEETINGS</p>
            </div>
          </div>
          
          {/* Details Overview text details */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Platform Operational Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="font-bold text-slate-800 mb-1">Orders Tracker</p>
                <p>Transactions listed: <span className="font-semibold text-slate-950">{stats.totalOrders} total orders</span>.</p>
                <p>Payment verification succeeds instantly on frontend test selections, with secure signature locks verified on server controllers.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="font-bold text-slate-800 mb-1">Moderator Notes</p>
                <p>Use the directory tab to restrict students breaching exchange guidelines. Submissions flagged by students append automatically to Flagged queue.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER LIST DIRECTORY PANEL */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          {/* Filters row */}
          <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search name, ID..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400 whitespace-nowrap">Dept:</span>
              <select
                value={userDept}
                onChange={(e) => setUserDept(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics & Comm">Electronics & Comm</option>
                <option value="Computer & Comm">Computer & Comm</option>
                <option value="Mechanical Eng">Mechanical Eng</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Student Profile</th>
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Loading student registry...
                      </td>
                    </tr>
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No students found matching filters.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                            alt={u.name}
                            className="h-8 w-8 rounded-full border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[10px] text-slate-450">{u.email}</p>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">{u.studentId}</td>
                        <td className="p-4 text-slate-500">{u.department} (Yr {u.year})</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                            u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700 animate-pulse'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => toggleUserStatus(u._id, u.status)}
                            className={`p-2 rounded-xl border transition-all ${
                              u.status === 'active'
                                ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                                : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                            }`}
                            title={u.status === 'active' ? 'Suspend Student' : 'Reactivate Student'}
                          >
                            {u.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FLAGGED moderation items PANEL */}
      {adminTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Flagged Items Review Queue</h3>
            
            {loading ? (
              <p className="text-slate-400 text-xs py-8 text-center">Loading moderation reports...</p>
            ) : reportsList.length === 0 ? (
              <p className="text-slate-400 text-xs py-12 text-center">Zero flags pending. Platform is clean!</p>
            ) : (
              <div className="space-y-4">
                {reportsList.map((rep) => (
                  <div
                    key={rep._id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-left"
                  >
                    <div className="space-y-1.5">
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[9px] font-bold uppercase tracking-wider">
                          Type: {rep.targetType}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Report ID: #{rep._id} • Flagged by {rep.reporterId?.name || 'Student'}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">
                        Target Name: {rep.target?.title || rep.target?.name || 'Removed Item'}
                      </p>
                      <p className="text-slate-500 italic mt-1 leading-relaxed">
                        Reason listed: "{rep.reason}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {rep.status === 'pending' ? (
                        <button
                          onClick={() => resolveFlagReport(rep._id)}
                          className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Resolve Report
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
