import api from './axios';

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyOTP: (userId, otp) => api.post('/auth/verify-otp', { userId, otp }),
  getProfile: () => api.get('/auth/profile'),
};

export const departmentAPI = {
  getAll: (params) => api.get('/departments', { params }),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

export const facultyAPI = {
  getAll: (params) => api.get('/faculty', { params }),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (data) => api.post('/faculty', data),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`),
};

export const subjectAPI = {
  getAll: (params) => api.get('/subjects', { params }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  getByStudent: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
  getStats: (params) => api.get('/attendance/stats', { params }),
};

export const feeAPI = {
  getAll: (params) => api.get('/fees', { params }),
  getById: (id) => api.get(`/fees/${id}`),
  create: (data) => api.post('/fees', data),
  recordPayment: (id, data) => api.post(`/fees/${id}/payment`, data),
  getStats: () => api.get('/fees/stats'),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  create: (data) => api.post('/notifications', data),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
};

export const timetableAPI = {
  get: (params) => api.get('/timetable', { params }),
  create: (data) => api.post('/timetable', data),
  update: (id, data) => api.put(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`),
};

export const resultAPI = {
  getAll: (params) => api.get('/results', { params }),
  create: (data) => api.post('/results', data),
  bulkCreate: (results) => api.post('/results/bulk', { results }),
  update: (id, data) => api.put(`/results/${id}`, data),
  delete: (id) => api.delete(`/results/${id}`),
};

export const assignmentAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
};
