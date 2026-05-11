import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabase';
import { isVaultLimitError } from '../utils/errors';
export const useWatchlist = (tmdbId) => {
	const { user } = useAuth();
	const [saved, setSaved] = useState(false);
	const [loading, setLoading] = useState(false);
	const isToggling = useRef(false);
	const [error, setError] = useState(null);

	const checkSaved = useCallback(async () => {
		if (!user || !tmdbId) {
			setSaved(false);
			return;
		}

		const { data, error } = await supabase
			.from('watchlist')
			.select('id')
			.eq('user_id', user.id)
			.eq('tmdb_id', tmdbId)
			.maybeSingle();

		if (error) {
			console.error('useWatchlist check error', error);
			return;
		}

		setSaved(!!data);
	}, [user, tmdbId]);

	useEffect(() => {
		setLoading(true);

		checkSaved().finally(() => {
			setLoading(false);
		});
	}, [checkSaved]);

	useEffect(() => {
		const handlePageVisible = () => {
			if (document.visibilityState === 'visible') {
				void checkSaved();
			}
		};

		window.addEventListener('focus', checkSaved);
		document.addEventListener('visibilitychange', handlePageVisible);

		return () => {
			window.removeEventListener('focus', checkSaved);
			document.removeEventListener('visibilitychange', handlePageVisible);
		};
	}, [checkSaved]);

	const toggle = async (movieData) => {
		if (!user || isToggling.current) return;

		isToggling.current = true;
		setLoading(true);
		setError(null);

		try {
			if (saved) {
				const { error } = await supabase
					.from('watchlist')
					.delete()
					.eq('user_id', user.id)
					.eq('tmdb_id', tmdbId);
				if (error) throw error;
				setSaved(false);
			} else {
				const { error: insertError } = await supabase.from('watchlist').insert({
					user_id: user.id,
					tmdb_id: tmdbId,
					...movieData,
				});
				if (insertError) throw insertError;
				setSaved(true);
			}
		} catch (err) {
			console.error('useWatchlist toggle error', err);
			if (isVaultLimitError(err)) {
				setError(
					'Vault limit reached. Please Upgrade to a paid plan to add more titles.',
				);
			} else {
				setError('An error occurred. Please try again later.');
			}
		} finally {
			setLoading(false);
			isToggling.current = false;
		}
	};

	return { saved, loading, toggle, error };
};
