import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import ProductDetails from './pages/ProductDetails';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center p-8 text-white">Đang tải...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center p-8 text-white">Đang tải trung tâm an ninh...</div>;
  if (!user) return <Navigate to="/auth" />;
  
  // Kiểm tra Phân Quyền Cứng!
  const allowedRoles = ['Admin', 'Manager', 'Pharmacist'];
  if (!allowedRoles.includes(user.role?.name)) {
    return (
      <div className="glass-panel text-center" style={{ padding: '50px', marginTop: '50px' }}>
        <h2 style={{ color: 'var(--danger)' }}>BÁO ĐỘNG ĐỎ 🚨</h2>
        <p>Bạn không có đủ thẩm quyền Quân Hàm để truy cập vào màn hình này!</p>
        <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => window.location.href = '/'}>Quay đầu là bờ</button>
      </div>
    );
  }
  return children;
};

function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { background: 'rgba(30,30,40,0.9)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }
        }} 
      />
      <Router>
        <Navbar />
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<LoginRegister />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProductDetails />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
