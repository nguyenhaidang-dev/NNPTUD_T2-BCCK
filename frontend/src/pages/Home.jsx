import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { Search, Info } from 'lucide-react';

import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'otc', 'rx'
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (searchQuery = '') => {
    setLoading(true);
    try {
      const url = searchQuery ? `/products/search/${searchQuery}` : '/products';
      const res = await axiosClient.get(url);
      setProducts(res.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(query);
  };

  const filteredProducts = products.filter(p => {
    if (activeTab === 'otc') return !p.requiresPrescription;
    if (activeTab === 'rx') return p.requiresPrescription;
    return true;
  });

  const handleAdd = (p) => {
    addToCart(p);
    toast.success(`Đã thêm ${p.name} vào giỏ!`, { icon: '🛒' });
  }

  return (
    <div className="animate-fade-in">
      
      {/* Hero Banner Area */}
      <div className="glass-panel" style={{ 
        padding: '60px 40px', textAlign: 'center', marginBottom: '40px', 
        background: 'linear-gradient(to right bottom, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Chăm sóc sức khỏe 24/7</span>
          <h2 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: 800, margin: '15px 0' }}>Hiệu thuốc của bạn. Trực tuyến.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 30px' }}>
            Tìm kiếm hàng ngàn sản phẩm y tế, mua sắm an toàn và nhận thuốc tại nhà chỉ qua vài cú click.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', maxWidth: '500px', margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Tìm tên thuốc, công dụng..." 
              className="input-glass" 
              style={{ padding: '16px 20px', borderRadius: '30px' }}
              value={query} onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ borderRadius: '30px', padding: '0 25px' }}>
              <Search size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
        <button className="btn-primary" style={{ background: activeTab === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'none' }} onClick={() => setActiveTab('all')}>Tất Cả Sản Phẩm</button>
        <button className="btn-primary" style={{ background: activeTab === 'otc' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'none' }} onClick={() => setActiveTab('otc')}>Thuốc Không Kê Đơn</button>
        <button className="btn-primary" style={{ background: activeTab === 'rx' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'none' }} onClick={() => setActiveTab('rx')}>Thuốc Kê Đơn</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '50px 0', color: 'var(--primary)' }}>Đang tìm kiếm kho thuốc...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy sản phẩm nào!</div>
          ) : (
            filteredProducts.map(product => (
              <div key={product._id} className="glass-panel hover-grow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform 0.2s', cursor: 'pointer' }}>
                <Link to={`/product/${product._id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ height: '220px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '15px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.image ? (
                      <img src={`http://localhost:5000${product.image}`} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No Image</span>
                    )}
                  </div>
                  
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }} className="text-gradient hover-underline">{product.name}</h3>
                </Link>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px', flexGrow: 1 }}>{product.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span className="text-gradient" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {product.price.toLocaleString('vi-VN')} ₫
                  </span>
                  <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => handleAdd(product)}>
                    Thêm Giỏ
                  </button>
                </div>
                
                {product.requiresPrescription && (
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(245, 158, 11, 0.9)', color: '#fff', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Info size={12} /> Kê Đơn
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
