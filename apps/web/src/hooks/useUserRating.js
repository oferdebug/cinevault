import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabase';

export const useUserRating = (tmdbId, mediaType) => {
	const { user } = useAuth();
	const [rating, setRating] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const loadRating = useCallback(async () => {
		if (!user || !tmdbId || !mediaType) {
			setRating(null);
			return;
		}
		setLoading(true);
		setError('');
		try {
			const { data, error } = await supabase
				.from('user_ratings')
				.select('rating')
				.eq('user_id', user.id)
				.eq('tmdb_id', tmdbId)
				.eq('media_type', mediaType)
				.maybeSingle();
			if (error) throw error;
			setRating(data?.rating ?? null);
		} catch (err) {
			console.error('useUserRating loadRating error', err);
			setError('Failed to load rating. Please try again later.');
		} finally {
			setLoading(false);
		}
	}, [user, tmdbId, mediaType]);

	useEffect(() => {
		loadRating();
	}, [loadRating]);
	const saveRating = async (nextRating) => {
		if (!user || !tmdbId || !mediaType) return;
		setLoading(true);
		setError('');

		const { error } = await supabase.from('user_ratings').upsert(
			{
				user_id: user.id,
				tmdb_id: Number(tmdbId),
				media_type: mediaType,
				rating: nextRating,
				updated_at: new Date().toISOString(),
			},
			{
				onConflict: 'user_id,tmdb_id,media_type',
			},
		);

		if (error) {
			setError('Failed to save rating. Please try again later.');
		} else {
			setRating(nextRating);
		}
		setLoading(false);
	};

	return { rating, loading, error, saveRating };
};
