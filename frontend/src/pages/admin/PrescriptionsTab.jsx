import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const PrescriptionsTab = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState('Pending'); // 'Pending' or 'All'

  useEffect(() => {
    fetchPrescriptions();
  }, [filterMode]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const url = filterMode === 'Pending' ? '/prescriptions/pending/list' : '/prescriptions/admin/all';
      const res = await axiosClient.get(url);
      setPrescriptions(res.data.data || []);
    } catch (error) {
      toast.error('Lỗi lấy danh sách y lệnh');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRxStatus = async (id, status) => {
    try {
      await axiosClient.put(`/prescriptions/${id}/status`, { status });
      toast.success(`Đã đổi đơn thuốc thành ${status}!`);
      fetchPrescriptions();
    } catch (err) {
      toast.error('Lỗi duyệt y lệnh');
    }
  };

  return (
    <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Duyệt Đơn Thuốc (Y Lệnh)</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn-primary" 
                  style={{ padding: '8px 15px', background: filterMode === 'Pending' ? 'var(--primary)' : 'transparent', border: '1px solid var(--primary)' }}
                  onClick={() => setFilterMode('Pending')}
                >Yêu Cầu Mới</button>
                <button 
                  className="btn-primary" 
                  style={{ padding: '8px 15px', background: filterMode === 'All' ? 'var(--primary)' : 'transparent', border: '1px solid var(--primary)' }}
                  onClick={() => setFilterMode('All')}
                >Tất Cả Lịch Sử</button>
            </div>
        </div>

        {loading ? <div className="text-center p-4">Đang tải dữ liệu...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
              <tr style={{ borderBottom: 'var(--glass-border)' }}>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>MÃ Y LỆNH</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>BỆNH NHÂN (BÁC Sĩ)</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>ẢNH Y LỆNH ĐÍNH KÈM</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '15px', color: 'var(--text-muted)' }}>THAO TÁC</th>
              </tr>
              </thead>
              <tbody>
              {prescriptions.length === 0 ? <tr><td colSpan="5" className="text-center p-4">Không có y lệnh nào phù hợp!</td></tr> : prescriptions.map((rx) => (
                  <tr key={rx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '15px', fontSize: '0.85rem', color: 'var(--accent)' }}>#{rx.prescriptionNumber || rx._id.substring(0,8)}</td>
                      <td style={{ padding: '15px' }}>
                         <strong>{rx.customer?.lastName} {rx.customer?.firstName}</strong> <br/>
                         <small style={{color:'var(--text-muted)'}}>Dr. {rx.doctor?.name}</small>
                      </td>
                      <td style={{ padding: '15px' }}>
                          {rx.prescriptionImage ? (
                               <a href={`http://localhost:5000${rx.prescriptionImage}`} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>Xem ảnh đính kèm</a>
                          ) : 'Không có ảnh'}
                      </td>
                      <td style={{ padding: '15px' }}>
                          <span style={{
                              background: rx.status === 'Approved' ? 'rgba(16,185,129,0.2)' : rx.status === 'Rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', 
                              color: rx.status === 'Approved' ? '#10b981' : rx.status === 'Rejected' ? '#ef4444' : '#fbbf24', 
                              padding:'4px 8px', borderRadius:'10px', fontSize:'0.8rem'
                          }}>{rx.status}</span>
                      </td>
                      <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                          {rx.status === 'Pending' ? (
                              <>
                                  <button className="btn-primary" style={{ background: '#10b981', padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleUpdateRxStatus(rx._id, 'Approved')}>Duyệt</button>
                                  <button className="btn-primary" style={{ background: 'var(--danger)', padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleUpdateRxStatus(rx._id, 'Rejected')}>Từ Chối</button>
                              </>
                          ) : (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Đã xử lý lúc<br/>{new Date(rx.updatedAt).toLocaleDateString()}</span>
                          )}
                      </td>
                  </tr>
              ))}
              </tbody>
          </table>
        )}
    </div>
  );
};

export default PrescriptionsTab;
