import { Outlet, Link, NavLink } from "react-router-dom";

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-linear-to-b from-primary/90 to-transparent backdrop-blur-sm">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/src/assets/cinevault-logo-transparent.svg" alt="CineVault" className="h-8 w-8" />
                    <span className="text-xl font-bold text-white tracking-wide">CineVault</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <NavLink to="/" className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors"}>Home</NavLink>
                    <NavLink to="/browse" className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors"}>Browse</NavLink>
                    <NavLink to="/search" className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors"}>Search</NavLink>
                </div>

                <div className="flex items-center gap-3">
                    <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Sign In</Link>
                    <Link to="/signup" className="text-sm bg-accent text-primary font-semibold px-4 py-2 rounded-full hover:bg-accent/80 transition-colors">Get Started</Link>
                </div>
            </nav>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="px-8 py-6 text-center text-gray-600 text-sm border-t border-gray-900">
                &copy; 2025 CineVault. All rights reserved.
            </footer>
        </div>
    );
};


export default Layout;
