import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const TitleDetailPage = lazy(() => import('./pages/TitleDetailPage'));
const WatchPage = lazy(() => import('./pages/WatchPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const VaultPage = lazy(() => import('./pages/VaultPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));

const App = () => {
	return (
		<BrowserRouter>
			<Suspense fallback={<div className="min-h-screen bg-primary" />}>
				<Routes>
					<Route element={<Layout />}>
						<Route index element={<HomePage />} />
						<Route path="/browse" element={<BrowsePage />} />
						<Route path="/search" element={<SearchPage />} />
						<Route path="/vault" element={<VaultPage />} />
						<Route path="/title/:id" element={<TitleDetailPage />} />
						<Route path="/watch/:id" element={<WatchPage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/signup" element={<SignupPage />} />
						<Route path="*" element={<NotFoundPage />} />
						<Route path="/subscribe" element={<SubscriptionPage />} />
					</Route>
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
};

export default App;
