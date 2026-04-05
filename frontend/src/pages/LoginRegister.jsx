import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', passwordConfirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const loginData = await login(formData.email, formData.password);
        if (loginData?.user?.role?.name === 'Manager') {
           navigate('/manager');
        } else if (loginData?.user?.role?.name === 'Admin' || loginData?.user?.role?.name === 'Pharmacist') {
           navigate('/admin');
        } else {
           navigate('/');
        }
      } else {
        if (formData.password !== formData.passwordConfirm) {
          setError('Mật khẩu không khớp!');
          setLoading(false);
          return;
        }
        await register(formData);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '40px 30px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: 'var(--glass-border)' }}>
          <button 
            style={{ 
              flex: 1, padding: '15px', background: 'transparent', 
              color: isLogin ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: isLogin ? 700 : 400,
              borderBottom: isLogin ? '2px solid var(--primary)' : 'none',
              transform: 'translateY(1px)' // cover bottom border
            }} 
            onClick={() => setIsLogin(true)}
          >
            ĐĂNG NHẬP
          </button>
          <button 
            style={{ 
              flex: 1, padding: '15px', background: 'transparent', 
              color: !isLogin ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: !isLogin ? 700 : 400,
              borderBottom: !isLogin ? '2px solid var(--primary)' : 'none',
              transform: 'translateY(1px)'
            }} 
            onClick={() => setIsLogin(false)}
          >
            ĐĂNG KÝ
          </button>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {!isLogin && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" name="firstName" placeholder="Họ" className="input-glass" required onChange={handleChange} />
              <input type="text" name="lastName" placeholder="Tên" className="input-glass" required onChange={handleChange} />
            </div>
          )}

          <input type="email" name="email" placeholder="Email" className="input-glass" required onChange={handleChange} />
          
          {!isLogin && (
            <input type="tel" name="phone" placeholder="Số điện thoại" className="input-glass" onChange={handleChange} />
          )}

          <input type="password" name="password" placeholder="Mật khẩu" className="input-glass" required onChange={handleChange} />

          {!isLogin && (
            <input type="password" name="passwordConfirm" placeholder="Xác nhận mật khẩu" className="input-glass" required onChange={handleChange} />
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '14px' }} disabled={loading}>
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
          </button>

        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
