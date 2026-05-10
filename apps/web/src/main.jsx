import { PostHogProvider } from '@posthog/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import posthog from 'posthog-js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import './index.css';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
			retry: 1,
		},
	},
});

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
	api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
	defaults: '2026-01-30',
	autocapture: false,
});

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<PostHogProvider client={posthog}>
			<AuthProvider>
				<WatchlistProvider>
					<QueryClientProvider client={queryClient}>
						<App />
						<ReactQueryDevtools initialIsOpen={false} />
					</QueryClientProvider>
				</WatchlistProvider>
			</AuthProvider>
		</PostHogProvider>
	</StrictMode>,
);
