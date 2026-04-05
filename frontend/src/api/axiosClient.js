import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Trỏ thẳng về backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor nạp Token vào mỗi Request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý lỗi global
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu token hết hạn, có thể force logout ở đây
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
