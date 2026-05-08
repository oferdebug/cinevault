import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [authError, setAuthError] = useState("");
	const { signInWithGoogle, signInWithGithub } = useAuth();

	const handleOAuth = async (fn) => {
		setAuthError("");
		const { error } = await fn();
		if (error) setAuthError(error.message);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		alert("Email auth coming in Phase 2!");
	};

	return (
		<main className="min-h-screen bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
			<div
				className="pointer-events-none absolute inset-0"
				style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(99,102,241,0.18), transparent)' }}
			/>
			<div className="glass-card w-full max-w-md p-8 relative z-10">
				<div className="flex flex-col items-center mb-6">
					<img
						src="/src/assets/cinevault_icon_logo.svg"
						alt="CineVault"
						className="h-11 w-11 mb-4"
					/>
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">CineVault</p>
					<h2 className="text-center text-2xl">Create account</h2>
					<p className="text-center text-light-200/60 text-sm mt-1">
						Join CineVault and start discovering
					</p>
				</div>

				<div className="flex flex-col gap-2.5 mb-5">
					<button
						type="button"
						onClick={() => handleOAuth(signInWithGoogle)}
						className="flex items-center justify-center gap-3 w-full bg-white/95 text-gray-900 font-semibold py-3 rounded-xl hover:bg-white transition-all duration-200 text-sm cursor-pointer"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
							<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
							<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
							<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
							<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
						</svg>
						Continue with Google
					</button>
					<button
						type="button"
						onClick={() => handleOAuth(signInWithGithub)}
						className="flex items-center justify-center gap-3 w-full bg-[#24292e] text-white font-semibold py-3 rounded-xl border border-white/10 hover:bg-[#2f363d] transition-all duration-200 text-sm cursor-pointer"
					>
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
						</svg>
						Continue with GitHub
					</button>
				</div>

				{authError && (
					<p role="alert" className="text-danger/80 text-xs text-center mb-4">
						{authError}
					</p>
				)}

				<div className="flex items-center gap-3 mb-5">
					<div className="flex-1 h-px bg-white/8" />
					<span className="text-xs text-light-200/40">or continue with email</span>
					<div className="flex-1 h-px bg-white/8" />
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div>
						<label
							htmlFor="signup-name"
							className="block text-xs font-medium text-light-200/60 mb-1.5 uppercase tracking-wider"
						>
							Display name
						</label>
						<input
							id="signup-name"
							type="text"
							autoComplete="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Your name"
							required
							className="w-full bg-surface-3/80 border border-white/8 rounded-xl px-4 py-3 text-sm text-light-100 placeholder-gray-200 outline-none focus:border-accent/50 focus:bg-surface-3 transition-all duration-200"
						/>
					</div>
					<div>
						<label
							htmlFor="signup-email"
							className="block text-xs font-medium text-light-200/60 mb-1.5 uppercase tracking-wider"
						>
							Email
						</label>
						<input
							id="signup-email"
							type="email"
							autoComplete="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							required
							className="w-full bg-surface-3/80 border border-white/8 rounded-xl px-4 py-3 text-sm text-light-100 placeholder-gray-200 outline-none focus:border-accent/50 focus:bg-surface-3 transition-all duration-200"
						/>
					</div>
					<div>
						<label
							htmlFor="signup-password"
							className="block text-xs font-medium text-light-200/60 mb-1.5 uppercase tracking-wider"
						>
							Password
						</label>
						<input
							id="signup-password"
							type="password"
							autoComplete="new-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
							minLength={8}
							className="w-full bg-surface-3/80 border border-white/8 rounded-xl px-4 py-3 text-sm text-light-100 placeholder-gray-200 outline-none focus:border-accent/50 focus:bg-surface-3 transition-all duration-200"
						/>
					</div>
					<button
						type="submit"
						className="mt-1 w-full btn-primary justify-center rounded-xl py-3"
					>
						Create Account
					</button>
				</form>

				<p className="text-center text-light-200/50 text-xs mt-6">
					Already have an account?{" "}
					<Link to="/login" className="text-accent hover:text-accent-2 transition-colors">
						Sign in
					</Link>
				</p>
			</div>
		</main>
	);
};

export default SignupPage;
