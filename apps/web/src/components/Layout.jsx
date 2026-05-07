import { Outlet, Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavbarAuth = () => {
	const { user, signOut } = useAuth();
	if (user) {
		return (
			<div className="flex items-center gap-3">
				<img
					src={
						user.user_metadata?.avatar_url ??
						`https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? "")}&background=38bdf8&color=020617`
					}
					alt="avatar"
					className="w-8 h-8 rounded-full object-cover border-2 border-accent/50"
				/>
				<button
					onClick={signOut}
					className="text-sm text-gray-300 hover:text-white transition-colors"
				>
					Sign Out
				</button>
			</div>
		);
	}
	return (
		<div className="flex items-center gap-3">
			<Link
				to="/login"
				className="text-sm text-gray-300 hover:text-white transition-colors"
			>
				Sign In
			</Link>
			<Link
				to="/signup"
				className="text-sm bg-accent text-primary font-semibold px-4 py-2 rounded-full hover:bg-accent/80 transition-colors"
			>
				Get Started
			</Link>
		</div>
	);
};

const Layout = () => {
	const { user, signOut } = useAuth();
	return (
		<div className="min-h-screen flex flex-col">
			<nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-linear-to-b from-primary/90 to-transparent backdrop-blur-sm">
				<Link to="/" className="flex items-center gap-2">
					<img
						src="/src/assets/cinevault-logo-transparent.svg"
						alt="CineVault"
						className="h-8 w-8"
					/>
					<span className="text-xl font-bold text-white tracking-wide">
						CineVault
					</span>
				</Link>

				<div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
					<NavLink
						to="/"
						className={({ isActive }) =>
							isActive ? "text-white" : "hover:text-white transition-colors"
						}
					>
						Home
					</NavLink>
					<NavLink
						to="/browse"
						className={({ isActive }) =>
							isActive ? "text-white" : "hover:text-white transition-colors"
						}
					>
						Browse
					</NavLink>
					<NavLink
						to="/search"
						className={({ isActive }) =>
							isActive ? "text-white" : "hover:text-white transition-colors"
						}
					>
						Search
					</NavLink>
				</div>

				<NavbarAuth />
			</nav>

			<main className="flex-1">
				<Outlet />
			</main>

			<footer className="px-8 py-6 text-center text-gray-600 text-sm border-t border-gray-900 hidden md:block">
				&copy; 2025 CineVault. All rights reserved.
			</footer>

			<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-4 py-3 bg-primary/95 backdrop-blur-md border-t border-gray-800">
				<NavLink
					to="/"
					className={({ isActive }) =>
						`flex flex-col items-center gap-1 text-xs ${isActive ? "text-accent" : "text-gray-400"}`
					}
				>
					<span className="text-lg">🏠</span>
					<span>Home</span>
				</NavLink>
				<NavLink
					to="/browse"
					className={({ isActive }) =>
						`flex flex-col items-center gap-1 text-xs ${isActive ? "text-accent" : "text-gray-400"}`
					}
				>
					<span className="text-lg">🎬</span>
					<span>Browse</span>
				</NavLink>
				<NavLink
					to="/search"
					className={({ isActive }) =>
						`flex flex-col items-center gap-1 text-xs ${isActive ? "text-accent" : "text-gray-400"}`
					}
				>
					<span className="text-lg">🔍</span>
					<span>Search</span>
				</NavLink>
				{user ? (
					<button
						onClick={signOut}
						className="flex flex-col items-center gap-1 text-xs text-gray-400"
					>
						<img
							src={
								user.user_metadata?.avatar_url ??
								`https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? "")}&background=38bdf8&color=020617`
							}
							alt="avatar"
							className="w-6 h-6 rounded-full object-cover"
						/>
						<span>Sign Out</span>
					</button>
				) : (
					<NavLink
						to="/login"
						className={({ isActive }) =>
							`flex flex-col items-center gap-1 text-xs ${isActive ? "text-accent" : "text-gray-400"}`
						}
					>
						<span className="text-lg">👤</span>
						<span>Sign In</span>
					</NavLink>
				)}
			</nav>
		</div>
	);
};

export default Layout;
