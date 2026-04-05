import React, { useEffect, useState, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const fileInputRef = useRef(null);

  const initialFormState = {
    _id: '',
    name: '',
    sku: '',
    price: '',
    form: 'Viên nén',
    dosage: '',
    category: '',
    manufacturer: '',
    description: '',
    requiresPrescription: false,
    isActive: true,
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchInitData();
  }, []);

  const fetchInitData = async () => {
    setLoading(true);
    try {
       await fetchProducts();
       const [catRes, manRes] = await Promise.all([
          axiosClient.get('/categories').catch(() => ({ data: { data: [] } })),
          axiosClient.get('/manufacturers').catch(() => ({ data: { data: [] } }))
       ]);
       setCategories(catRes.data.data || []);
       setManufacturers(manRes.data.data || []);
    } catch(err) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const res = await axiosClient.get('/products?limit=100');
    setProducts(res.data.data || []);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
       ...prev,
       [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setFormData(initialFormState);
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEditMode(true);
    setFormData({
       _id: product._id,
       name: product.name || '',
       sku: product.sku || '',
       price: product.price || '',
       form: product.form || 'Viên nén',
       dosage: product.dosage || '',
       category: product.category?._id || '',
       manufacturer: product.manufacturer?._id || '',
       description: product.description || '',
       requiresPrescription: product.requiresPrescription || false,
       isActive: product.isActive !== undefined ? product.isActive : true,
    });
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.price || !formData.category || !formData.manufacturer) {
        return toast.error('Vui lòng điền đủ các trường bắt buộc!');
    }

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('sku', formData.sku);
    payload.append('price', formData.price);
    payload.append('form', formData.form);
    payload.append('dosage', formData.dosage);
    payload.append('category', formData.category);
    payload.append('manufacturer', formData.manufacturer);
    payload.append('description', formData.description);
    payload.append('requiresPrescription', formData.requiresPrescription);
    payload.append('isActive', formData.isActive);
    
    if (selectedFile) {
        payload.append('image', selectedFile);
    }

    try {
        setLoading(true);
        if (isEditMode) {
             await axiosClient.put(`/products/${formData._id}`, payload, {
                 headers: { 'Content-Type': 'multipart/form-data' }
             });
             toast.success('Cập nhật sản phẩm thành công!');
        } else {
             await axiosClient.post('/products', payload, {
                 headers: { 'Content-Type': 'multipart/form-data' }
             });
             toast.success('Tạo sản phẩm mới thành công!');
        }
        setShowModal(false);
        fetchProducts();
    } catch (err) {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu trữ!');
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id) => {
      if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
          try {
             await axiosClient.delete(`/products/${id}`);
             toast.success('Xóa thành công!');
             fetchProducts();
          } catch(err) {
             toast.error('Xóa thất bại');
          }
      }
  };

  return (
    <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Quản Lý Thuốc & Sản Phẩm</h2>
            <button className="btn-primary" onClick={openCreateModal} style={{ boxShadow: '0 0 15px rgba(56,189,248,0.5)' }}>+ THÊM SẢN PHẨM MỚI</button>
        </div>

        {loading && !showModal ? <div className="text-center p-4">Đang tải dữ liệu...</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: 'var(--glass-border)' }}>
                    <th style={{ padding: '15px', color: 'var(--text-muted)' }}>HÌNH ẢNH</th>
                    <th style={{ padding: '15px', color: 'var(--text-muted)' }}>SKU / TÊN THUỐC</th>
                    <th style={{ padding: '15px', color: 'var(--text-muted)' }}>GIÁ</th>
                    <th style={{ padding: '15px', color: 'var(--text-muted)' }}>TRẠNG THÁI</th>
                    <th style={{ padding: '15px', color: 'var(--text-muted)', textAlign: 'right' }}>THAO TÁC</th>
                    </tr>
                </thead>
                <tbody>
                    {!products || products.length === 0 ? <tr><td colSpan="5" className="text-center p-4">Không có sản phẩm nào!</td></tr> : products.map((prod) => (
                    <tr key={prod._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '15px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', backgroundImage: prod.image ? `url(http://localhost:5000${prod.image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        </td>
                        <td style={{ padding: '15px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{prod.sku}</div>
                            <div style={{ fontWeight: 600 }}>{prod.name}</div>
                        </td>
                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{prod.price?.toLocaleString('vi-VN')} đ</td>
                        <td style={{ padding: '15px' }}>{prod.isActive ? <span style={{ color: '#10b981' }}>Đang bán</span> : <span style={{ color: 'var(--danger)' }}>Ngừng kinh doanh</span>}</td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', fontSize: '0.8rem', marginRight: '5px' }} onClick={() => openEditModal(prod)}>Sửa</button>
                            <button className="btn-primary" style={{ background: 'var(--danger)', padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleDelete(prod._id)}>Xóa</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        )}

      {/* MODAL FORM */}
      {showModal && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(5px)' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{isEditMode ? 'Chỉnh Sửa Thông Tin Thuốc' : 'Thêm Thuốc Mới'}</h2>
                  <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
               </div>
               
               <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Left Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tên Thuốc (*)</label>
                        <input type="text" name="name" className="input-glass" value={formData.name} onChange={handleInputChange} required />
                     </div>
                     <div style={{ display: 'flex', gap: '15px' }}>
                         <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mã SKU (*)</label>
                            <input type="text" name="sku" className="input-glass" value={formData.sku} onChange={handleInputChange} required />
                         </div>
                         <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Giá Bán (*)</label>
                            <input type="number" name="price" className="input-glass" value={formData.price} onChange={handleInputChange} required />
                         </div>
                     </div>
                     <div style={{ display: 'flex', gap: '15px' }}>
                         <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Danh mục (*)</label>
                            <select name="category" className="input-glass" value={formData.category} onChange={handleInputChange} required>
                               <option value="" style={{color:'black'}}>Chọn DM...</option>
                               {categories.map(c => <option key={c._id} value={c._id} style={{color:'black'}}>{c.name}</option>)}
                            </select>
                         </div>
                         <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nhà sản xuất (*)</label>
                            <select name="manufacturer" className="input-glass" value={formData.manufacturer} onChange={handleInputChange} required>
                               <option value="" style={{color:'black'}}>Chọn NSX...</option>
                               {manufacturers.map(m => <option key={m._id} value={m._id} style={{color:'black'}}>{m.name}</option>)}
                            </select>
                         </div>
                     </div>
                     <div>
                         <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mô tả sẩn phẩm</label>
                         <textarea name="description" className="input-glass" value={formData.description} onChange={handleInputChange} rows="3" />
                     </div>
                  </div>

                  {/* Right Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     <div style={{ display: 'flex', gap: '15px' }}>
                         <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dạng bào chế (*)</label>
                            <input type="text" name="form" placeholder="VD: Viên nén" className="input-glass" value={formData.form} onChange={handleInputChange} required />
                         </div>
                         <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hàm lượng (Dosage)</label>
                            <input type="text" name="dosage" className="input-glass" value={formData.dosage} onChange={handleInputChange} />
                         </div>
                     </div>
                     
                     <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', border: '1px dashed var(--glass-border)' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>Hình Ảnh Sản Phẩm</label>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ color: 'white', fontSize: '0.85rem' }} />
                        {isEditMode && <p style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '5px' }}>Bỏ trống nếu không muốn đổi ảnh cũ</p>}
                     </div>

                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <input type="checkbox" name="requiresPrescription" id="reqRx" checked={formData.requiresPrescription} onChange={handleInputChange} style={{ width: '20px', height: '20px' }} />
                        <label htmlFor="reqRx">Thuốc Kê Đơn (Bắt buộc đơn Y Lệnh)</label>
                     </div>

                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleInputChange} style={{ width: '20px', height: '20px' }} />
                        <label htmlFor="isActive">Đang kinh doanh (Active)</label>
                     </div>
                  </div>

                  {/* Footer */}
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                     <button type="button" className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--text-muted)' }} onClick={() => setShowModal(false)}>Hủy Bỏ</button>
                     <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu Thông Tin'}</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default ProductsTab;
