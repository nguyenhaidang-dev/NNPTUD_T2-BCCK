import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { Star, Info, ArrowLeft, Send } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/products/${id}`);
      setProduct(res.data.data);
    } catch (err) {
      toast.error('Lỗi khi tải chi tiết thuốc');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (product) {
      addToCart(product);
      toast.success(`Đã thêm ${product.name} vào giỏ!`, { icon: '🛒' });
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error('Vui lòng nhập nội dung đánh giá!');
    if (!user) return toast.error('Bạn cần đăng nhập để đánh giá!');

    setIsSubmitting(true);
    try {
      await axiosClient.post(`/products/${id}/reviews`, { rating, comment });
      toast.success('Gửi đánh giá thành công! Cảm ơn bạn.');
      setComment('');
      setRating(5);
      fetchProduct(); // reload product to get new review
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-fade-in text-center mt-20 text-gradient text-xl">Đang tải thông tin thuốc...</div>;
  }

  if (!product) {
    return <div className="animate-fade-in text-center mt-20">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className="animate-fade-in container my-10" style={{ maxWidth: '1000px' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Quay lại trang chủ
      </Link>

      {/* Product Info Section */}
      <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '40px', padding: '40px', marginBottom: '40px' }}>
        {/* Left: Image */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '15px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {product.image ? (
            <img src={`http://localhost:5000${product.image}`} alt={product.name} style={{ width: '100%', maxHeight: '350px', objectFit: 'contain' }} />
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Chưa có hình ảnh</span>
          )}
        </div>

        {/* Right: Details */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
             <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{product.name}</h1>
             {product.requiresPrescription && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                   <Info size={14} /> Kê Đơn
                </span>
             )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--text-muted)' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#fbbf24' }}>
                <Star size={16} fill="#fbbf24" /> {product.rating ? parseFloat(product.rating).toFixed(1) : 'Chưa có'}
             </span>
             <span>({product.numReviews || 0} Nhận xét)</span>
             <span>•</span>
             <span>SKU: {product.sku}</span>
          </div>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '20px', lineHeight: 1.6 }}>{product.description}</p>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
             <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-main)' }}>Thương hiệu:</strong> {product.manufacturer?.name || 'Không rõ'}</p>
             <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-main)' }}>Dạng bào chế:</strong> {product.form || 'Không rõ'}</p>
             <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-main)' }}>Hàm lượng:</strong> {product.dosage || 'Không áp dụng'}</p>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--glass-border)', paddingTop: '20px' }}>
             <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>
               {product.price?.toLocaleString('vi-VN')} ₫
             </div>
             <button className="btn-primary" style={{ padding: '15px 30px', fontSize: '1.1rem' }} onClick={handleAdd}>
               🛒 Đưa vào giỏ hàng
             </button>
          </div>
        </div>
      </div>

      {/* User Reviews Section */}
      <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', paddingLeft: '10px', borderLeft: '4px solid var(--primary)' }}>Đánh giá & Bình luận</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 400px)', gap: '30px' }}>
        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!product.reviews || product.reviews.length === 0 ? (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Hãy là người đầu tiên đánh giá sản phẩm này!
            </div>
          ) : (
            product.reviews.map((rev) => (
              <div key={rev._id} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong>{rev.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div style={{ display: 'flex', color: '#fbbf24', gap: '2px', marginBottom: '10px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < rev.rating ? '#fbbf24' : 'transparent'} />
                  ))}
                </div>
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>"{rev.comment}"</p>
              </div>
            ))
          )}
        </div>

        {/* Review Form */}
        <div>
          {user ? (
             <div className="glass-panel" style={{ padding: '25px', position: 'sticky', top: '100px' }}>
                <h3 style={{ marginBottom: '15px' }}>Viết đánh giá của bạn</h3>
                <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cho điểm (Sao)</label>
                      <select 
                         className="input-glass" 
                         value={rating} onChange={(e) => setRating(Number(e.target.value))}
                         style={{ color: 'black' }}
                      >
                         <option style={{ color: 'black' }} value={5}>5 - Rất tuyệt vời 🌟</option>
                         <option style={{ color: 'black' }} value={4}>4 - Khá tốt</option>
                         <option style={{ color: 'black' }} value={3}>3 - Bình thường</option>
                         <option style={{ color: 'black' }} value={2}>2 - Không hài lòng</option>
                         <option style={{ color: 'black' }} value={1}>1 - Quá tệ</option>
                      </select>
                   </div>
                   <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Bình luận mở rộng</label>
                      <textarea 
                        className="input-glass" rows="4" 
                        placeholder="Thuốc này uống hiệu quả không, giao hàng có nhanh không?..."
                        value={comment} onChange={(e) => setComment(e.target.value)}
                        style={{ resize: 'none' }}
                      ></textarea>
                   </div>
                   <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                     {isSubmitting ? 'Đang gửi...' : <><Send size={18} /> Gửi đánh giá</>}
                   </button>
                </form>
             </div>
          ) : (
             <div className="glass-panel" style={{ padding: '25px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>Đăng nhập để có thể trải nghiệm tính năng đánh giá thuốc.</p>
                <Link to="/auth" className="btn-primary" style={{ display: 'inline-block' }}>Đăng Nhập Ngay</Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
