import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const SettingsTab = () => {
  const [settings, setSettings] = useState([
    { key: 'vat_rate', value: '10', description: 'Thuế VAT (%)', group: 'Tax' },
    { key: 'shipping_fee', value: '30000', description: 'Phí ship cơ bản (VNĐ)', group: 'Shipping' },
    { key: 'free_ship_threshold', value: '500000', description: 'Mức giỏ hàng miễn phí ship (VNĐ)', group: 'Shipping' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axiosClient.get('/settings');
      if (res.data.data && res.data.data.length > 0) {
        // Merge with defaults
        const apiSettings = res.data.data;
        setSettings(prev => prev.map(p => {
          const found = apiSettings.find(a => a.key === p.key);
          return found ? found : p;
        }));
      }
    } catch (error) {
      console.warn('Could not fetch settings');
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axiosClient.post('/settings/bulk-update', settings);
      toast.success('Cập nhật cấu hình thành công!');
    } catch (error) {
      toast.error('Lỗi cập nhật cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, value) => {
    const fresh = [...settings];
    fresh[index].value = value;
    setSettings(fresh);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Cấu Hình Hệ Thống</h3>
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
         {settings.map((s, index) => (
           <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
             <label style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{s.description} ({s.key})</label>
             <input type="text" className="input-glass" value={s.value} onChange={(e) => handleChange(index, e.target.value)} />
           </div>
         ))}
         <button className="btn-primary" onClick={handleUpdate} disabled={loading} style={{ marginTop: '10px' }}>
           {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
         </button>
      </div>
    </div>
  );
};

export default SettingsTab;
