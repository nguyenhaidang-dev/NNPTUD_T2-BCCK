import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const LogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axiosClient.get('/logs');
        setLogs(res.data.data);
      } catch (error) {
        console.warn('Lỗi tải logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div>Đang tải lịch sử...</div>;

  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Nhật Ký Hệ Thống (System Logs)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: 'var(--glass-border)' }}>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>THỜI GIAN</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>NGƯỜI THỰC HIỆN</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>HÀNH ĐỘNG</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>CHI TIẾT</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>IP CỦA MÁY TRẠM</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <td style={{ padding: '15px', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
               <td style={{ padding: '15px' }}>{log.user ? `${log.user.email}` : 'Hệ thống'}</td>
               <td style={{ padding: '15px', color: 'var(--primary)', fontWeight: 'bold' }}>{log.action}</td>
               <td style={{ padding: '15px', fontSize: '0.85rem' }}>{log.details}</td>
               <td style={{ padding: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.ipAddress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTab;
