import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import { LogOut, Package, Key, XSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'password'
  
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchMyOrders();
    }
  }, [activeTab]);

  const fetchMyOrders = async () => {
    try {
      const res = await axiosClient.get('/orders/my-orders');
      setOrders(res.data.data);
    } catch (err) {
      toast.error('Lỗi lấy lịch sử đặt hàng');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if(!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      await axiosClient.put(`/orders/${orderId}/cancel`);
      toast.success('Đã hủy đơn hàng thành công!');
      fetchMyOrders(); // reload
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng này chạy');
    }
  };

  const handlePassChange = (e) => setPassData({...passData, [e.target.name]: e.target.value});

  const submitPassChange = async (e) => {
    e.preventDefault();
    if(passData.newPassword !== passData.newPasswordConfirm) {
        return toast.error('Mật khẩu mới không trùng khớp!');
    }
    const tid = toast.loading('Đang xử lý...');
    try {
      await axiosClient.put('/auth/change-password', passData);
      toast.success('Đổi mật khẩu thành công tuyệt đối!', { id: tid });
      setPassData({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mật khẩu cũ không chính xác!', { id: tid });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
      
      {/* Sidebar */}
      <div className="glass-panel" style={{ padding: '30px 20px', height: 'fit-content' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' 
          }}>
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <h3>{user.firstName} {user.lastName}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
          <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.8rem', padding: '4px 10px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: '15px' }}>
             Rank: {user.role?.name || 'Customer'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="btn-primary"
            style={{ 
              background: activeTab === 'orders' ? 'rgba(255,255,255,0.1)' : 'transparent', 
              color: 'var(--text-main)', textAlign: 'left', padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'none'
            }}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} /> Đơn hàng của tôi
          </button>
          
          <button 
            className="btn-primary"
            style={{ 
              background: activeTab === 'password' ? 'rgba(255,255,255,0.1)' : 'transparent', 
              color: 'var(--text-main)', textAlign: 'left', padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'none'
            }}
            onClick={() => setActiveTab('password')}
          >
            <Key size={18} /> Đổi mật khẩu
          </button>

          <button 
            className="btn-primary"
            style={{ 
              background: 'transparent', 
              color: 'var(--danger)', textAlign: 'left', padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'none', marginTop: '20px', borderTop: 'var(--glass-border)', borderRadius: 0
            }}
            onClick={() => { logout(); window.location.href='/'; }}
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h2 style={{ borderBottom: 'var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>Lịch Sử Đặt Hàng</h2>
            {orders.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Bạn chưa có đơn đặt hàng nào trong hệ thống.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {orders.map(order => (
                  <div key={order._id} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mã: #{order._id.substring(0, 8)}...</span>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>{order.orderStatus}</span>
                        {/* Hiện nút huỷ nếu Pending */}
                        {order.orderStatus === 'Pending' && (
                           <button onClick={() => handleCancelOrder(order._id)} title="Hủy Đơn Này" style={{ background: 'transparent', color: 'var(--danger)' }}>
                             <XSquare size={20}/>
                           </button>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                       {order.items?.map((i, idx) => (
                           <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                              <span>{i.quantity}x {i.product?.name || "Thuốc không còn tồn tại"}</span>
                           </div>
                       ))}
                    </div>

                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                       <span className="text-gradient" style={{ fontWeight: 'bold' }}>Thành tiền: {order.totalAmount?.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'password' && (
          <div className="animate-fade-in" style={{ maxWidth: '400px' }}>
            <h2 style={{ borderBottom: 'var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>Bảo mật tài khoản</h2>
            <form onSubmit={submitPassChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mật khẩu hiện tại</label>
                <input type="password" name="currentPassword" value={passData.currentPassword} onChange={handlePassChange} className="input-glass" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mật khẩu mới</label>
                <input type="password" name="newPassword" value={passData.newPassword} onChange={handlePassChange} className="input-glass" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Xác nhận mật khẩu mới</label>
                <input type="password" name="newPasswordConfirm" value={passData.newPasswordConfirm} onChange={handlePassChange} className="input-glass" required />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Lưu thay đổi</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfile;
