import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState({
    street: '', city: '', state: '', zipCode: '', country: 'Việt Nam'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    
    if (cart.length === 0) {
      return setError('Giỏ hàng trống!');
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        })),
        shippingAddress: address,
        paymentMethod: 'Tiền mặt' // Mặc định để test, có thể làm UI chọn sau
      };

      await axiosClient.post('/orders', orderPayload);
      clearCart();
      alert('Tuyệt vời! Đặt hàng thành công!');
      navigate('/');
    } catch (err) {
      if (err.response?.data?.invalidItems) {
        // Lỗi insufficient stock
        const reason = err.response.data.invalidItems[0].reason;
        setError(`Thất bại: ${reason}`);
      } else {
        setError(err.response?.data?.message || 'Lỗi khi đặt hàng!');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="glass-panel text-center animate-fade-in" style={{ padding: '50px', maxWidth: '500px', margin: '0 auto' }}>
        <h2>Giỏ hàng trống!</h2>
        <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/')}>Quay lại mua sắm</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '30px' }}>
      
      <div className="glass-panel" style={{ padding: '30px' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: 'var(--glass-border)', paddingBottom: '15px' }}>Thông tin Giao hàng</h2>
        {error && <div className="alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
        
        <form id="checkout-form" onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" name="street" placeholder="Địa chỉ chi tiết (VD: 123 Đường Điện Biên Phủ)" className="input-glass" required onChange={handleChange} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input type="text" name="city" placeholder="Thành phố" className="input-glass" required onChange={handleChange} />
            <input type="text" name="state" placeholder="Tỉnh / Quận" className="input-glass" required onChange={handleChange} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input type="text" name="zipCode" placeholder="Mã Bưu Điện" className="input-glass" onChange={handleChange} />
            <input type="text" name="country" placeholder="Quốc gia" value={address.country} className="input-glass" readOnly />
          </div>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '30px', height: 'fit-content' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: 'var(--glass-border)', paddingBottom: '15px' }}>Thanh Toán</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
          {cart.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.quantity}x</span>
                <span style={{ fontSize: '0.9rem' }}>{item.product.name}</span>
              </div>
              <span>{(item.product.price * item.quantity).toLocaleString('vi-VN')} đ</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: 'var(--glass-border)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Tổng thanh toán</span>
          <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{cartTotal.toLocaleString('vi-VN')} đ</span>
        </div>

        <button type="submit" form="checkout-form" className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }} disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Xác nhận Đặt Hàng'}
        </button>
      </div>
      
    </div>
  );
};

export default Checkout;
