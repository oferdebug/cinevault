import { usePostHog } from '@posthog/react';
import { createContext, useCallback, useEffect, useState } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const posthog = usePostHog();

	const identifyPosthogUser = useCallback(
		(sessionUser) => {
			if (!sessionUser) return;
			try {
				posthog.identify(sessionUser.id, {
					name: sessionUser.user_metadata?.full_name || 'User',
				});
			} catch (err) {
				console.error('posthog.identify failed', err);
			}
		},
		[posthog],
	);

	useEffect(() => {
		supabase.auth
			.getSession()
			.then(({ data: { session } }) => {
				const sessionUser = session?.user ?? null;
				setUser(sessionUser);
				identifyPosthogUser(sessionUser);
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
			identifyPosthogUser(sessionUser);
			if (!sessionUser) {
				try {
					posthog.reset();
				} catch (err) {
					console.error('posthost.reset failed', err);
				}
			}
		});

		return () => subscription.unsubscribe();
	}, [posthog, identifyPosthogUser]);

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
