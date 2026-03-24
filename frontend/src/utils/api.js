import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-unwrap data, throw readable error message
api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.message || 'Something went wrong'))
);

// ─── Host ────────────────────────────────────────────────────────────────────
export const hostAPI = {
  register: (body)      => api.post('/hosts', body),
  login:    (body)      => api.post('/hosts/login', body),
  getById:  (id)        => api.get(`/hosts/${id}`),
  update:   (id, body)  => api.put(`/hosts/${id}`, body),
};

// ─── Game Session ─────────────────────────────────────────────────────────────
export const sessionAPI = {
  create:      (body)    => api.post('/sessions', body),
  checkCode:   (code)    => api.get(`/sessions/code/${code}`),
  getById:     (id)      => api.get(`/sessions/${id}`),
  start:       (id)      => api.post(`/sessions/${id}/start`),
  finish:      (id)      => api.post(`/sessions/${id}/finish`),
  getPlayers:  (id)      => api.get(`/sessions/${id}/players`),
  leaderboard: (id)      => api.get(`/sessions/${id}/leaderboard`),
  byHost:      (hostId)  => api.get(`/sessions/host/${hostId}`),
};

// ─── Player Session ───────────────────────────────────────────────────────────
export const playerAPI = {
  join:       (body)      => api.post('/player-sessions/join', body),
  getById:    (id)        => api.get(`/player-sessions/${id}`),
  checkpoint: (id, body)  => api.patch(`/player-sessions/${id}/checkpoint`, body),
  buy:        (id, body)  => api.patch(`/player-sessions/${id}/buy`, body),
  earnMoney:  (id, body)  => api.patch(`/player-sessions/${id}/earn-money`, body),
  loseLife:   (id)        => api.patch(`/player-sessions/${id}/lose-life`),
  resetToStart: (id)      => api.patch(`/player-sessions/${id}/reset-to-start`),
  finish:     (id, body)  => api.patch(`/player-sessions/${id}/finish`, body),
};

// ─── Checkpoint ───────────────────────────────────────────────────────────────
export const checkpointAPI = {
  getAll:   ()            => api.get('/checkpoints'),
  getById:  (id)          => api.get(`/checkpoints/${id}`),
  getByQR:  (qr)          => api.get(`/checkpoints/qr/${qr}`),
  create:   (body)        => api.post('/checkpoints', body),
  update:   (id, body)    => api.put(`/checkpoints/${id}`, body),
  delete:   (id)          => api.delete(`/checkpoints/${id}`),
};

// ─── Shop ─────────────────────────────────────────────────────────────────────
export const shopAPI = {
  getByLevel: (level) => api.get(`/shops/checkpoint/${level}`),
  getById:    (id)    => api.get(`/shops/${id}`),
};

// ─── Item ─────────────────────────────────────────────────────────────────────
export const itemAPI = {
  getAll:  () => api.get('/items'),
  getById: (id) => api.get(`/items/${id}`),
};

// ─── User ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  leaderboard: () => api.get('/users/leaderboard'),
};

// ─── Minigame ─────────────────────────────────────────────────────────────────
export const minigameAPI = {
  getById:   (id) => api.get(`/minigames/${id}`),
  getRandom: ()   => api.get('/minigames/random'),
};

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadAPI = {
  avatar: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/upload/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
