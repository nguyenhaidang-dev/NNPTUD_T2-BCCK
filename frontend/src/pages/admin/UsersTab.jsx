import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        axiosClient.get('/users'),
        axiosClient.get('/roles')
      ]);
      setUsers(usersRes.data.data);
      setRoles(rolesRes.data.data);
    } catch (error) {
      toast.error('Lỗi tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId, email) => {
    const newPass = prompt(`Nhập mật khẩu mới cho user ${email}:`);
    if (!newPass) return;
    try {
      await axiosClient.post('/users/force-reset-password', { userId, newPassword: newPass });
      toast.success('Đã đổi mật khẩu thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi đổi mật khẩu');
    }
  };

  const handleChangeRole = async (userId, roleId) => {
    try {
      await axiosClient.put(`/users/${userId}/role`, { roleId });
      toast.success('Thay đổi quyền thành công!');
      fetchData();
    } catch (error) {
      toast.error('Lỗi phân quyền');
    }
  };

  if (loading) return <div>Đang tải dữ liệu Users...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
         <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Quản Lý Người Dùng & Phân Quyền (RBAC)</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: 'var(--glass-border)' }}>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>MÃ USER</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>EMAIL</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>HỌ TÊN</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>VAI TRÒ (ROLE)</th>
            <th style={{ padding: '15px', color: 'var(--text-muted)' }}>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <td style={{ padding: '15px', fontSize: '0.85rem' }}>{user._id.substring(0,8)}...</td>
               <td style={{ padding: '15px' }}>{user.email}</td>
               <td style={{ padding: '15px' }}>{user.lastName} {user.firstName}</td>
               <td style={{ padding: '15px' }}>
                  <select 
                     className="input-glass" 
                     style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                     value={user.role?._id || ''}
                     onChange={(e) => handleChangeRole(user._id, e.target.value)}
                  >
                     {roles.map(r => <option key={r._id} value={r._id} style={{color: 'black'}}>{r.name}</option>)}
                  </select>
               </td>
               <td style={{ padding: '15px' }}>
                  <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#eab308', color: 'black' }} onClick={() => handleResetPassword(user._id, user.email)}>Reset Pass</button>
               </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTab;
