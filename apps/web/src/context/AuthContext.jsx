import { usePostHog } from '@posthog/react';
import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const posthog = usePostHog();
	useEffect(() => {
		supabase.auth
			.getSession()
			.then(({ data: { session } }) => {
				const sessionUser = session?.user ?? null;
				setUser(sessionUser);
				if (sessionUser) {
					posthog.identify(sessionUser.id, {
						email: sessionUser.email,
						name:
							sessionUser.user_metadata?.full_name ||
							sessionUser.email?.split('@')[0] ||
							'User',
					});
				}
			})
			.catch(() => {
				setUser(null);
			})
			.finally(() => {
				setLoading(false);
			});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			const sessionUser = session?.user ?? null;
			setUser(sessionUser);
			if (sessionUser) {
				posthog.identify(sessionUser.id, {
					email: sessionUser.email,
					name:
						sessionUser.user_metadata?.full_name ||
						sessionUser.email.split('@')[0],
				});
			} else {
				posthog.reset();
			}
		});

		return () => subscription.unsubscribe();
	}, [posthog]);

	const signInWithGoogle = () =>
		supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo: window.location.origin },
		});

	const signInWithGithub = () =>
		supabase.auth.signInWithOAuth({
			provider: 'github',
			options: { redirectTo: window.location.origin },
		});

	const signOut = () => supabase.auth.signOut();

	return (
		<AuthContext.Provider
			value={{ user, loading, signInWithGoogle, signInWithGithub, signOut }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
	return ctx;
};
