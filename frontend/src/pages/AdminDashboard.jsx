import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // orders | rx
  const [loading, setLoading] = useState(true);

  // Phân quyền nhẹ: Nếu là Pharmacist thì tab mặc định là Rx
  useEffect(() => {
    if (user?.role?.name === 'Pharmacist') {
      setActiveTab('rx');
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'orders') {
          const res = await axiosClient.get('/orders/admin/all');
          setOrders(res.data.data);
        } else if (activeTab === 'rx') {
          const res = await axiosClient.get('/prescriptions/pending/list');
          setPrescriptions(res.data.data);
        }
      } catch (error) {
        toast.error("Lỗi lấy dữ liệu quản trị: " + (error.response?.data?.message || ''));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await axiosClient.put(`/orders/${id}/status`, { status });
      toast.success('Đã cập nhật trạng thái đơn hàng!');
      // Reload lại data
      const res = await axiosClient.get('/orders/admin/all');
      setOrders(res.data.data);
    } catch (err) {
      toast.error('Lỗi cập nhật');
    }
  };

  const handleUpdateRxStatus = async (id, status) => {
    try {
      await axiosClient.put(`/prescriptions/${id}/status`, { status });
      toast.success(`Đã đổi đơn thuốc thành ${status}!`);
      const res = await axiosClient.get('/prescriptions/pending/list');
      setPrescriptions(res.data.data);
    } catch (err) {
      toast.error('Lỗi duyệt y lệnh');
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '30px', borderBottom: 'var(--glass-border)', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>Bảng Chi Huy Trung Tâm</h2>
          <p style={{ color: 'var(--text-muted)' }}>Màn hình nghiệp vụ dành riêng cho Ban Quản trị & Dược sĩ.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(user?.role?.name === 'Admin' || user?.role?.name === 'Manager') && (
            <button className="btn-primary" style={{ background: activeTab === 'orders' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', boxShadow: 'none' }} onClick={() => setActiveTab('orders')}>Tất cả Đơn Hàng</button>
          )}
          {(user?.role?.name === 'Admin' || user?.role?.name === 'Pharmacist') && (
            <button className="btn-primary" style={{ background: activeTab === 'rx' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', boxShadow: 'none' }} onClick={() => setActiveTab('rx')}>Duyệt Đơn Thuốc</button>
          )}
        </div>
      </div>

      {loading ? <div className="text-center mt-10">Đang quét hệ thống...</div> : (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px' }}>
          
          {/* TAB ORDERS */}
          {activeTab === 'orders' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: 'var(--glass-border)' }}>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>MÃ ĐƠN HÀNG</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>KHÁCH HÀNG</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>TỔNG TIỀN</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>THANH TOÁN</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>HÀNH ĐỘNG (TRẠNG THÁI)</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? <tr><td colSpan="5" className="text-center p-4">Trống</td></tr> : orders.map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '15px', fontSize: '0.85rem' }}>{order._id.substring(0,8)}...</td>
                      <td style={{ padding: '15px' }}>{order.user?.email}</td>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{order.totalAmount?.toLocaleString('vi-VN')} đ</td>
                      <td style={{ padding: '15px' }}>{order.paymentStatus}</td>
                      <td style={{ padding: '15px' }}>
                        <select 
                           value={order.orderStatus} 
                           onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                           className="input-glass" style={{ padding: '5px 10px', width: 'auto' }}
                        >
                          <option value="Pending" style={{color:'black'}}>Pending</option>
                          <option value="Processing" style={{color:'black'}}>Processing</option>
                          <option value="Shipped" style={{color:'black'}}>Shipped</option>
                          <option value="Delivered" style={{color:'black'}}>Delivered</option>
                          <option value="Cancelled" style={{color:'black'}}>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB PHARMACIST */}
          {activeTab === 'rx' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: 'var(--glass-border)' }}>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>MÃ Y LỆNH</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>BỆNH NHÂN (DOCTOR)</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>TRIỆU CHỨNG</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>THẨM ĐỊNH (DƯỢC SĨ)</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.length === 0 ? <tr><td colSpan="5" className="text-center p-4">Không có y lệnh nào đang chờ!</td></tr> : prescriptions.map((rx) => (
                    <tr key={rx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '15px', fontSize: '0.85rem', color: 'var(--accent)' }}>#{rx._id.substring(0,8)}...</td>
                      <td style={{ padding: '15px' }}>{rx.patientInfo?.name} <br/><small style={{color:'var(--text-muted)'}}>Dr. {rx.doctor?.firstName}</small></td>
                      <td style={{ padding: '15px' }}>{rx.diagnosis}</td>
                      <td style={{ padding: '15px' }}><span style={{background:'rgba(245,158,11,0.2)', color:'#fbbf24', padding:'4px 8px', borderRadius:'10px', fontSize:'0.8rem'}}>{rx.status}</span></td>
                      <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                        <button className="btn-primary" style={{ background: '#10b981', padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleUpdateRxStatus(rx._id, 'Approved')}>Duyệt (Approve)</button>
                        <button className="btn-primary" style={{ background: 'var(--danger)', padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleUpdateRxStatus(rx._id, 'Rejected')}>Từ Chối</button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
