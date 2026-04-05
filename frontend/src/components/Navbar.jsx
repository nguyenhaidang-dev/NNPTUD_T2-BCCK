import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User as UserIcon, LogOut, Pill } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-panel" style={{ 
      position: 'fixed', top: 0, width: '100%', zIndex: 50, 
      borderRadius: 0, padding: '15px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none' 
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>
            <Pill size={24} color="white" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Medisync</h1>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          <Link to={user ? "/checkout" : "/auth"} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={24} color="var(--text-main)" />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: 'var(--danger)', color: 'white',
                fontSize: '12px', fontWeight: 'bold',
                height: '20px', width: '20px', borderRadius: '50%',
                display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              
              {/* Phân Quyền Navbar: Chỉ hiển thị nút Panel nếu là Admin/Manager */}
              {(user.role?.name === 'Admin' || user.role?.name === 'Manager' || user.role?.name === 'Pharmacist') && (
                <Link to="/admin" className="text-gradient" style={{ fontWeight: 'bold', border: '1px solid var(--primary)', padding: '5px 10px', borderRadius: '8px' }}>
                  ⚙️ Quản Trị
                </Link>
              )}

              <Link to="/profile" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <UserIcon size={16} /> 
                <strong style={{ color: 'var(--primary)' }}>{user.firstName}</strong>
              </Link>
              <button 
                onClick={handleLogout}
                style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
              <UserIcon size={18} />
              <span>Đăng nhập</span>
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
