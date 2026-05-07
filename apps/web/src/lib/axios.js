import axios from 'axios';
import supabase from './supabase';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
	withCredentials: true,
	timeout: 10000,
});

api.interceptors.request.use(async (config) => {
	const { data: session } = await supabase.auth.getSession();
	if (session?.session?.access_token) {
		config.headers.Authorization = `Bearer ${session.session.access_token}`;
	}
	return config;
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
