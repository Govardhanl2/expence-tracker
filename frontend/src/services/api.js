import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export const expenseAPI = {
  getAll: (params = {}) => API.get('/expenses', { params }),
  getById: (id) => API.get(`/expenses/${id}`),
  create: (data) => API.post('/expenses', data),
  update: (id, data) => API.put(`/expenses/${id}`, data),
  delete: (id) => API.delete(`/expenses/${id}`),
  uploadInvoice: (formData) =>
    API.post('/expenses/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),
  getDashboard: () => API.get('/expenses/dashboard'),
  getInsights: () => API.get('/expenses/insights'),
};

export default API;
