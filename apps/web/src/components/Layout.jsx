import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
	isActive
		? 'text-accent font-semibold relative after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-px after:bg-accent after:rounded-full'
		: 'text-gray-100 hover:text-light-100 transition-colors duration-200 relative';

const mobileNavLinkClass = ({ isActive }) =>
	`flex flex-col items-center gap-1 text-xs transition-colors duration-200 ${
		isActive ? 'text-accent' : 'text-gray-100 hover:text-light-200'
	}`;
isActive ? 'text-white' : 'hover:text-white transition-colors';

const mobileNavLinkClass = ({ isActive }) =>
`flex flex-col items-center gap-1 text-xs ${
isActive ? 'text-accent' : 'text-gray-400'
}`;

const IconHome = () => (
	<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
		<polyline points="9 22 9 12 15 12 15 22"/>
	</svg>
);

const IconDiscover = () => (
	<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<circle cx="11" cy="11" r="8"/>
		<line x1="21" y1="21" x2="16.65" y2="16.65"/>
	</svg>
);

const IconVault = () => (
	<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
		<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
	</svg>
);

const IconUser = () => (
	<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
		<circle cx="12" cy="7" r="4"/>
	</svg>
);

const NavbarAuth = () => {
	const { user, signOut } = useAuth();

	if (user) {
		return (
			<div className="flex items-center gap-3">
				<Link
					to="/account"
					className="hidden text-sm text-gray-100 transition-colors duration-200 hover:text-light-100 md:block"
				>
					Account
				</Link>

				<Link to="/account" aria-label="Account">
					<img
						src={
							user.user_metadata?.avatar_url ??
							`https://ui-avatars.com/api/?name=${encodeURIComponent(
								user.email ?? '',
							)}&background=6366f1&color=f8fafc`
						}
						alt="avatar"
						className="h-8 w-8 rounded-full border-2 border-accent/50 object-cover transition-all duration-200 hover:border-accent"
					/>
				</Link>

				<button
					type="button"
					onClick={signOut}
					className="hidden text-sm text-gray-100 transition-colors duration-200 hover:text-light-100 md:block cursor-pointer"
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
				className="hidden text-sm text-gray-100 transition-colors duration-200 hover:text-light-100 md:block"
			>
				Sign In
			</Link>

			<Link
				to="/signup"
				className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-accent-2 cursor-pointer"
				style={{ boxShadow: '0 0 0 0 transparent' }}
				onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'}
				onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 0 transparent'}
			>
				Get Started
			</Link>
		</div>
	);
};

const Layout = () => {
	const { user } = useAuth();

	return (
		<div className="min-h-screen w-full bg-primary">
			<nav className="fixed left-4 right-4 top-4 z-50 flex items-center justify-between rounded-2xl border border-white/8 bg-surface/80 px-6 py-3 backdrop-blur-xl"
				style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
				<Link to="/" className="flex items-center gap-2.5 cursor-pointer">
					<img
						src="/src/assets/cinevault-logo-transparent.svg"
						alt="CineVault"
						className="h-8 w-8"
					/>
					<span className="text-lg font-bold tracking-wide text-light-100" style={{ fontFamily: 'Righteous, sans-serif' }}>
						CineVault
					</span>
				</Link>

				<div className="hidden items-center gap-7 text-sm font-medium md:flex">
					<NavLink to="/" end className={navLinkClass}>Home</NavLink>
					<NavLink to="/browse" className={navLinkClass}>Discover</NavLink>
					<NavLink to="/vault" className={navLinkClass}>My Vault</NavLink>
					<NavLink to="/subscribe" className={navLinkClass}>Pricing</NavLink>
				</div>

				<NavbarAuth />
			</nav>

			<main className="min-h-screen w-full pt-20">
				<Outlet />
			</main>

			<footer className="hidden border-t border-white/5 px-8 py-6 text-center text-sm text-gray-200 md:block">
				&copy; 2025 CineVault. All rights reserved.
			</footer>

			<nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/8 bg-surface/95 px-4 py-3 backdrop-blur-xl md:hidden">
				<NavLink to="/" end className={mobileNavLinkClass}>
					<IconHome />
					<span>Home</span>
				</NavLink>

				<NavLink to="/browse" className={mobileNavLinkClass}>
					<IconDiscover />
					<span>Discover</span>
				</NavLink>

				<NavLink to="/vault" className={mobileNavLinkClass}>
					<IconVault />
					<span>Vault</span>
				</NavLink>

				{user ? (
					<NavLink to="/account" className={mobileNavLinkClass}>
						<img
							src={
								user.user_metadata?.avatar_url ??
								`https://ui-avatars.com/api/?name=${encodeURIComponent(
									user.email ?? '',
								)}&background=6366f1&color=f8fafc`
							}
							alt="avatar"
							className="h-5 w-5 rounded-full object-cover"
						/>
						<span>Account</span>
					</NavLink>
				) : (
					<NavLink to="/login" className={mobileNavLinkClass}>
						<IconUser />
						<span>Sign In</span>
					</NavLink>
				)}
			</nav>
		</div>
	);
const { user, signOut } = useAuth();

if (user) {
return (
<div className="flex items-center gap-3">
<Link
to="/account"
className="text-sm text-gray-300 transition-colors hover:text-white"
>
Account
</Link>

<Link to="/account" aria-label="Account">
<img
src={
user.user_metadata?.avatar_url ??
`https://ui-avatars.com/api/?name=${encodeURIComponent(
user.email ?? '',
)}&background=38bdf8&color=020617`
}
alt="avatar"
className="h-8 w-8 rounded-full border-2 border-accent/50 object-cover"
/>
</Link>

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

<NavLink to="/subscribe" className={navLinkClass}>
Pricing
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
<NavLink to="/account" className={mobileNavLinkClass}>
<img
src={
user.user_metadata?.avatar_url ??
`https://ui-avatars.com/api/?name=${encodeURIComponent(
user.email ?? '',
)}&background=38bdf8&color=020617`
}
alt="avatar"
className="h-6 w-6 rounded-full object-cover"
/>
<span>Account</span>
</NavLink>
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
