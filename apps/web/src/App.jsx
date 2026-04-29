import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import SearchPage from "./pages/SearchPage";
import TitleDetailPage from "./pages/TitleDetailPage";
import WatchPage from "./pages/WatchPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}>
					<Route index element={<HomePage />} />
					<Route path="/browse" element={<BrowsePage />} />
					<Route path="/search" element={<SearchPage />} />
					<Route path="/title/:id" element={<TitleDetailPage />} />
					<Route path="/watch/:id" element={<WatchPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};

export default App;