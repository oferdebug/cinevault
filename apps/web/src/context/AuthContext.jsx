import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		supabase.auth
			.getSession()
			.then(({ data: { session } }) => {
				setUser(session?.user ?? null);
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
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, []);

	const signInWithGoogle = () =>
		supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: window.location.origin },
		});

	const signInWithGithub = () =>
		supabase.auth.signInWithOAuth({
			provider: "github",
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
	if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
	return ctx;
};
