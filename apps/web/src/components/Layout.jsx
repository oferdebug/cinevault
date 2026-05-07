import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
	isActive ? "text-white" : "hover:text-white transition-colors";

const mobileNavLinkClass = ({ isActive }) =>
	`flex flex-col items-center gap-1 text-xs ${isActive ? 'text-accent' : 'text-gray-400'}`;

const NavbarAuth = () => {
	const { user, signOut } = useAuth();

	if (user) {
		return (
			<div className="flex items-center gap-3">
				<img
					src={
						user.user_metadata?.avatar_url ??
						`https://ui-avatars.com/api/?name=${encodeURIComponent(
							user.email ?? "",
						)}&background=38bdf8&color=020617`
					}
					alt="avatar"
					className="h-8 w-8 rounded-full border-2 border-accent/50 object-cover"
				/>

				<button
					type="button"
					onClick={signOut}
					className="text-sm text-gray-300 transition-colors hover:text-white"
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
				className="text-sm text-gray-300 transition-colors hover:text-white"
			>
				Sign In
			</Link>

			<Link
				to="/signup"
				className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-accent/80"
			>
				Get Started
			</Link>
			<Link
				to="/subscribe"
				className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-accent/80"
			>
				Subscribe
			</Link>
		</div>
	);
};

const Layout = () => {
	const { user, signOut } = useAuth();

	return (
		<div className="min-h-screen w-full bg-primary">
			<nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-linear-to-b from-primary/90 to-transparent px-8 py-4 backdrop-blur-sm">
				<Link to="/" className="flex items-center gap-2">
					<img
						src="/src/assets/cinevault-logo-transparent.svg"
						alt="CineVault"
						className="h-8 w-8"
					/>
					<span className="text-xl font-bold tracking-wide text-white">
						CineVault
					</span>
				</Link>

				<div className="hidden items-center gap-8 text-sm font-medium text-gray-300 md:flex">
					<NavLink to="/" className={navLinkClass}>
						Home
					</NavLink>

					<NavLink to="/browse" className={navLinkClass}>
						Discover
					</NavLink>

					<NavLink to="/vault" className={navLinkClass}>
						My Vault
					</NavLink>
				</div>

				<NavbarAuth />
			</nav>

			<main className="min-h-screen w-full">
				<Outlet />
			</main>

			<footer className="hidden border-t border-gray-900 px-8 py-6 text-center text-sm text-gray-600 md:block">
				&copy; 2025 CineVault. All rights reserved.
			</footer>

			<nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-800 bg-primary/95 px-4 py-3 backdrop-blur-md md:hidden">
				<NavLink to="/" className={mobileNavLinkClass}>
					<span className="text-lg">🏠</span>
					<span>Home</span>
				</NavLink>

				<NavLink to="/browse" className={mobileNavLinkClass}>
					<span className="text-lg">🎬</span>
					<span>Discover</span>
				</NavLink>

				<NavLink to="/vault" className={mobileNavLinkClass}>
					<span className="text-lg">🔐</span>
					<span>Vault</span>
				</NavLink>

				{user ? (
					<button
						type="button"
						onClick={signOut}
						className="flex flex-col items-center gap-1 text-xs text-gray-400"
					>
						<img
							src={
								user.user_metadata?.avatar_url ??
								`https://ui-avatars.com/api/?name=${encodeURIComponent(
									user.email ?? "",
								)}&background=38bdf8&color=020617`
							}
							alt="avatar"
							className="h-6 w-6 rounded-full object-cover"
						/>
						<span>Sign Out</span>
					</button>
				) : (
					<NavLink to="/login" className={mobileNavLinkClass}>
						<span className="text-lg">👤</span>
						<span>Sign In</span>
					</NavLink>
				)}
			</nav>
		</div>
	);
};

export default Layout;
