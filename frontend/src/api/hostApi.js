import axios from './axios';

const hostApi = {
  getAll: () => axios.get('/hosts'),
  getById: (id) => axios.get(`/hosts/${id}`),
  create: (data) => axios.post('/hosts', data),
  update: (id, data) => axios.put(`/hosts/${id}`, data),
  delete: (id) => axios.delete(`/hosts/${id}`),
  login: (username, password) => axios.post('/hosts/login', { username, password }),
  logout: () => axios.post('/hosts/logout'),
  // Player management
  getPendingPlayers: () => axios.get('/hosts/players/pending'),
  getApprovedPlayers: () => axios.get('/hosts/players/approved'),
  getRejectedPlayers: () => axios.get('/hosts/players/rejected'),
  approvePlayer: (userId) => axios.put(`/hosts/players/${userId}/approve`),
  rejectPlayer: (userId) => axios.put(`/hosts/players/${userId}/reject`),
};

export default hostApi;
