import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const MarketingTab = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get('/marketing/promotions');
      setPromotions(res.data.data || []);
    } catch (error) {
      toast.error('Lỗi tải khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Chắc chắn xóa mã này?')) {
      try {
        await axiosClient.delete(`/marketing/promotions/${id}`);
        toast.success('Đã xóa!');
        fetchData();
      } catch (err) {
        toast.error('Xóa thất bại');
      }
    }
  };

  if (loading) return <div>Đang tải dữ liệu Marketing...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
         <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Quản Lý Marketing & Khuyến Mãi</h3>
         <button className="btn-primary" onClick={() => toast.info('Chức năng thêm mới đang được tích hợp vào modal')}>+ Tạo Mã Mới</button>
      </div>

      <h4 style={{ marginBottom: '10px', color: 'var(--primary)' }}>Danh sách Voucher (Promotions)</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '40px' }}>
        <thead>
          <tr style={{ borderBottom: 'var(--glass-border)' }}>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>MÃ CODE</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>LOẠI / GIÁ TRỊ</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>THỜI HẠN</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>LƯỢT DÙNG</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {promotions.length === 0 ? <tr><td colSpan="5">Không có mã nào</td></tr> : promotions.map(promo => (
            <tr key={promo._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--accent)' }}>{promo.code}</td>
               <td style={{ padding: '15px' }}>{promo.discountType === 'percentage' ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString()} đ`}</td>
               <td style={{ padding: '15px', fontSize: '0.85rem' }}>
                  Từ: {new Date(promo.validFrom).toLocaleDateString()}<br/>
                  Đến: {new Date(promo.validUntil).toLocaleDateString()}
               </td>
               <td style={{ padding: '15px' }}>{promo.usageCount} / {promo.usageLimit}</td>
               <td style={{ padding: '15px' }}>
                  <button className="btn-primary" style={{ background: 'var(--danger)', padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleDelete(promo._id)}>Xóa</button>
               </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketingTab;
