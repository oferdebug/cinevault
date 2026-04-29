import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      console.warn('Auth error', status);
    } else if (!err.response) {
      console.error('Network/timeout error', err.message);
    }
    return Promise.reject(err);
  },
);

export default api;
