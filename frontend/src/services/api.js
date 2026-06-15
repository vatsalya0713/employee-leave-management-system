import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to automatically add Bearer token
api.interceptors.request.use(
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

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userDetails) => api.post('/api/auth/register', userDetails),
};

export const employeeAPI = {
  create: (data) => api.post('/api/employees', data),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  getById: (id) => api.get(`/api/employees/${id}`),
  getAll: (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') =>
    api.get(`/api/employees?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  delete: (id) => api.delete(`/api/employees/${id}`),
  search: (params, page = 0, size = 10, sortBy = 'name', sortDir = 'asc') => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/employees/search?${query}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
  },
};

export const leaveAPI = {
  apply: (data) => api.post('/api/leaves', data),
  getMyLeaves: () => api.get('/api/leaves/my-leaves'),
  cancel: (id) => api.put(`/api/leaves/cancel/${id}`),
  search: (params, page = 0, size = 10, sortBy = 'id', sortDir = 'desc') => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.leaveType) query.append('leaveType', params.leaveType);
    return api.get(`/api/leaves/search?${query.toString()}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
  },
};

export const managerAPI = {
  getPending: (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') =>
    api.get(`/api/manager/pending-leaves?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  approve: (id) => api.put(`/api/manager/approve/${id}`),
  reject: (id) => api.put(`/api/manager/reject/${id}`),
};

export const adminAPI = {
  getEmployees: (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') =>
    api.get(`/api/admin/employees?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  getLeaves: (page = 0, size = 10, sortBy = 'id', sortDir = 'desc') =>
    api.get(`/api/admin/leaves?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  updateBalance: (id, balance) =>
    api.put(`/api/admin/update-balance/${id}?balance=${balance}`),
  deleteEmployee: (id) => api.delete(`/api/admin/delete/${id}`),
};

export default api;
