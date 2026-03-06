import axios from './axios';

const userApi = {
  getAll: () => axios.get('/users'),
  getById: (id) => axios.get(`/users/${id}`),
  create: (data) => axios.post('/users', data),
  update: (id, data) => axios.put(`/users/${id}`, data),
  delete: (id) => axios.delete(`/users/${id}`),
  getLeaderboard: () => axios.get('/users/leaderboard'),
  addItem: (id, itemId) => axios.post(`/users/${id}/items/${itemId}`),
  removeItem: (id, itemId) => axios.delete(`/users/${id}/items/${itemId}`),
  uploadAvatar: (id, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axios.post(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  login: (username) => axios.post('/users/login', { username }),
  logout: () => axios.post('/users/logout'),
  joinWaitingRoom: (id) => axios.put(`/users/${id}/join-waiting-room`),
  leaveWaitingRoom: (id) => axios.put(`/users/${id}/leave-waiting-room`),

  // Heartbeat: update lastPing
  heartbeat: (id) => axios.post(`/users/${id}/heartbeat`),

  // Get online user count
  getOnlineUserCount: () => axios.get('/users/online/count'),
};

export default userApi;
