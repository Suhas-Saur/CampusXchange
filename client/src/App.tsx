import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AppLayout } from './layouts/AppLayout';

// Pages import
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Marketplace } from './pages/Marketplace';
import { ProductDetail } from './pages/ProductDetail';
import { Sell } from './pages/Sell';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { LostFound } from './pages/LostFound';
import { LostFoundDetail } from './pages/LostFoundDetail';
import { ReportLost } from './pages/ReportLost';
import { ReportFound } from './pages/ReportFound';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { SellerDashboard } from './pages/SellerDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Private Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/:id" element={<ProductDetail />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              
              <Route path="/lost-found" element={<LostFound />} />
              <Route path="/lost-found/:type/:id" element={<LostFoundDetail />} />
              <Route path="/report-lost" element={<ReportLost />} />
              <Route path="/report-found" element={<ReportFound />} />
              
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
