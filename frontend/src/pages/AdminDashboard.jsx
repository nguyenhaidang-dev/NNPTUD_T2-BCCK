import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import UsersTab from './admin/UsersTab';
import SettingsTab from './admin/SettingsTab';
import LogsTab from './admin/LogsTab';
import MarketingTab from './admin/MarketingTab';
import ProductsTab from './admin/ProductsTab';
import PrescriptionsTab from './admin/PrescriptionsTab';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState(null);
  const [advancedReports, setAdvancedReports] = useState(null);
  
  const [activeTab, setActiveTab] = useState(user?.role?.name === 'Pharmacist' ? 'rx' : 'orders'); // orders | rx | products | inventory | reports
  const [loading, setLoading] = useState(true);

  // Phân quyền nhẹ: Nếu là Pharmacist thì tab mặc định là Rx
  useEffect(() => {
    if (user?.role?.name === 'Pharmacist') {
      setActiveTab('rx');
    } else if (user?.role?.name === 'Manager') {
      // Manager mặc định vẫn là orders, có thể đổi nếu muốn
      setActiveTab('orders');
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
        } else if (activeTab === 'products' || activeTab === 'inventory') {
          // Lấy 100 sản phẩm mới nhất
          const res = await axiosClient.get('/products?limit=100');
          if (res.data.data) {
             setProducts(res.data.data);
          } else if (Array.isArray(res.data)) {
             // Tuỳ thuộc backend trả về
             setProducts(res.data);
          } else {
             setProducts([]);
          }
        } else if (activeTab === 'reports') {
          try {
             const res = await axiosClient.get('/orders/stats/summary');
             setReports(res.data.data);
             const advRes = await axiosClient.get('/orders/stats/advanced');
             setAdvancedReports(advRes.data.data);
          } catch(e) {
             console.warn('API Báo cáo lỗi');
             setReports({ totalOrders: 0, completedOrders: 0, pendingOrders: 0, totalRevenue: 0, cancelledOrders: 0 });
          }
        }
      } catch (error) {
        toast.error("Lỗi lấy dữ liệu: " + (error.response?.data?.message || error.message));
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

  const exportCSV = () => {
    if (!orders || orders.length === 0) return toast.error('Không có dữ liệu đơn hàng');
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Mã Đơn,Email Khách Hàng,Tổng Tiền,Trạng Thái TT,Trạng Thái Đơn\n";
    orders.forEach(order => {
      csvContent += `${order._id},${order.user?.email || 'N/A'},${order.totalAmount},${order.paymentStatus},${order.status}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '30px', borderBottom: 'var(--glass-border)', paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>Bảng Chi Huy Trung Tâm</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Màn hình nghiệp vụ dành riêng cho {user?.role?.name === 'Admin' ? 'Ban Quản trị' : user?.role?.name === 'Manager' ? 'Quản lý cửa hàng' : 'Dược sĩ'}.
          </p>
        </div>
        
        {/* Điều hướng Tabs */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
          {(user?.role?.name === 'Admin' || user?.role?.name === 'Manager' || user?.role?.name === 'Pharmacist') && (
             <button 
                className="btn-primary" 
                style={{ background: activeTab === 'orders' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', boxShadow: 'none', whiteSpace: 'nowrap' }} 
                onClick={() => setActiveTab('orders')}
              >
                📦 Đơn Hàng {user?.role?.name === 'Pharmacist' ? '(Soạn thuốc)' : ''}
              </button>
          )}

          {(user?.role?.name === 'Admin' || user?.role?.name === 'Manager') && (
            <>
              <button 
                className="btn-primary" 
                style={{ background: activeTab === 'products' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', boxShadow: 'none', whiteSpace: 'nowrap' }} 
                onClick={() => setActiveTab('products')}
              >
                💊 Sản Phẩm
              </button>
              <button 
                className="btn-primary" 
                style={{ background: activeTab === 'inventory' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', boxShadow: 'none', whiteSpace: 'nowrap' }} 
                onClick={() => setActiveTab('inventory')}
              >
                🏢 Kho Hàng
              </button>
              <button 
                className="btn-primary" 
                style={{ background: activeTab === 'reports' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', boxShadow: 'none', whiteSpace: 'nowrap' }} 
                onClick={() => setActiveTab('reports')}
              >
                📊 Báo Cáo
              </button>
            </>
          )}

          {user?.role?.name === 'Admin' && (
             <>
              <button className="btn-primary" style={{ background: activeTab === 'users' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', boxShadow: 'none', whiteSpace: 'nowrap' }} onClick={() => setActiveTab('users')}>
                👥 Người Dùng
              </button>
              <button className="btn-primary" style={{ background: activeTab === 'settings' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', boxShadow: 'none', whiteSpace: 'nowrap' }} onClick={() => setActiveTab('settings')}>
                ⚙️ Cấu Hình
              </button>
              <button className="btn-primary" style={{ background: activeTab === 'marketing' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', boxShadow: 'none', whiteSpace: 'nowrap' }} onClick={() => setActiveTab('marketing')}>
                📢 Marketing
              </button>
              <button className="btn-primary" style={{ background: activeTab === 'logs' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', boxShadow: 'none', whiteSpace: 'nowrap' }} onClick={() => setActiveTab('logs')}>
                🛡️ Logs
              </button>
             </>
          )}

          {(user?.role?.name === 'Admin' || user?.role?.name === 'Pharmacist') && (
            <button 
              className="btn-primary" 
              style={{ background: activeTab === 'rx' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', boxShadow: 'none', whiteSpace: 'nowrap' }} 
              onClick={() => setActiveTab('rx')}
            >
               📋 Duyệt Đơn Thuốc
            </button>
          )}
        </div>
      </div>

      {loading ? <div className="text-center mt-10">Đang quét hệ thống...</div> : (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px', minHeight: '400px' }}>
          
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
                      <td style={{ padding: '15px' }}>{order.user?.email || 'N/A'}</td>
                      <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--accent)' }}>{order.totalAmount?.toLocaleString('vi-VN')} đ</td>
                      <td style={{ padding: '15px' }}>
                          <span style={{ 
                              background: order.paymentStatus === 'Paid' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                              color: order.paymentStatus === 'Paid' ? '#10b981' : '#fbbf24',
                              padding: '4px 8px', borderRadius: '10px', fontSize: '0.8rem'
                          }}>
                             {order.paymentStatus}
                          </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <select 
                           value={order.orderStatus || order.status} 
                           onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                           className="input-glass" style={{ padding: '5px 10px', width: 'auto', fontSize: '0.85rem' }}
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

          {/* TAB PRODUCTS */}
          {activeTab === 'products' && <ProductsTab />}

          {/* TAB INVENTORY */}
          {activeTab === 'inventory' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: 'var(--glass-border)' }}>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>MÃ SKU</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>TÊN THUỐC</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>TỒN KHO</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>CẢNH BÁO</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {!products || products.length === 0 ? <tr><td colSpan="5" className="text-center p-4">Không có dữ liệu!</td></tr> : products.map((prod, index) => {
                    // Giả lập tồn kho dựa vào index để Manager thấy form UI
                    const stock = (index % 3 === 0) ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 100) + 20; 
                    const isLow = stock < 15;
                    return (
                    <tr key={prod._id + 'inv'} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: isLow ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                      <td style={{ padding: '15px', fontSize: '0.85rem' }}>{prod.sku || `SKU-IN${index}`}</td>
                      <td style={{ padding: '15px' }}>{prod.name}</td>
                      <td style={{ padding: '15px', fontWeight: 'bold', color: isLow ? 'var(--danger)' : 'white' }}>{stock} Hộp/Vỉ</td>
                      <td style={{ padding: '15px' }}>
                         {isLow ? <span style={{ background:'rgba(239,68,68,0.2)', color:'var(--danger)', padding:'4px 8px', borderRadius:'10px', fontSize:'0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px'}}>⚠️ Sắp hết</span> 
                                : <span style={{ background:'rgba(16,185,129,0.2)', color:'#10b981', padding:'4px 8px', borderRadius:'10px', fontSize:'0.8rem'}}>✅ An toàn</span>}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem', boxShadow: 'none', background: 'rgba(255,255,255,0.1)' }} onClick={() => toast.success('Mở form nhập/xuất kho', { icon: '📦'})}>Nhập / Xuất</button>
                      </td>
                    </tr>
                )})}
              </tbody>
            </table>
          )}

          {/* TAB REPORTS */}
          {activeTab === 'reports' && reports && (
            <div>
              <h3 style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Thống Kê Doanh Thu Tổng Hợp</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                <div style={{ padding: '25px', textAlign: 'center', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '15px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
                    <h3 style={{ color: '#38bdf8', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Tổng Doanh Thu</h3>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800' }}>{reports.totalRevenue?.toLocaleString('vi-VN')} đ</h2>
                </div>
                
                <div style={{ padding: '25px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '15px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📦</div>
                    <h3 style={{ color: '#10b981', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Tổng Đơn Hàng</h3>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800' }}>{reports.totalOrders}</h2>
                </div>
                
                <div style={{ padding: '25px', textAlign: 'center', background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '15px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
                    <h3 style={{ color: '#eab308', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Đơn Thành Công</h3>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800' }}>{reports.completedOrders}</h2>
                </div>
                
                <div style={{ padding: '25px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '15px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>❌</div>
                    <h3 style={{ color: '#ef4444', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Đơn Đã Hủy</h3>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800' }}>{reports.cancelledOrders || 0}</h2>
                </div>

              </div>
              
              {/* Nút xuất báo cáo */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '30px' }}>
                <button onClick={exportCSV} className="btn-primary" style={{ padding: '10px 20px', background: '#ec4899', border: 'none' }}>📥 Xuất CSV (Frontend)</button>
                <button onClick={() => window.open('http://localhost:5000/api/reports/export/excel', '_blank')} className="btn-primary" style={{ padding: '10px 20px', background: '#10b981', border: 'none' }}>📥 Xuất Excel (Backend API)</button>
              </div>

              {/* Advanced Reports Charts */}
              {advancedReports && advancedReports.revenueChart && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
                  
                  {/* Line Chart */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-main)', textAlign: 'center' }}>Biểu đồ Khối lượng (30 Ngày Gần Nhất)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <LineChart data={advancedReports.revenueChart} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis yAxisId="left" stroke="#38bdf8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#eab308" />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh Thu (đ)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                          <Line yAxisId="right" type="monotone" dataKey="orders" name="Số Đơn" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-main)', textAlign: 'center' }}>Trạng Thái Vận Hành</h3>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={advancedReports.statusPie}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {advancedReports.statusPie.map((entry, index) => {
                              const COLORS = {
                                'Pending': '#fbbf24',
                                'Processing': '#38bdf8',
                                'Shipped': '#a855f7',
                                'Delivered': '#10b981',
                                'Cancelled': '#ef4444'
                              };
                              return <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />;
                            })}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB PHARMACIST - PRESCRIPTIONS */}
          {activeTab === 'rx' && <PrescriptionsTab />}

          {/* NEW ADMIN TABS */}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'marketing' && <MarketingTab />}
          {activeTab === 'logs' && <LogsTab />}

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
