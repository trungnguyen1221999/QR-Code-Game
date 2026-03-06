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
};

export default userApi;
