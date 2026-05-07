import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabase';

export const useUserRatings = () => {
	const { user } = useAuth();
	const [ratings, setRatings] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const loadRatings = useCallback(async () => {
		if (!user) {
			setRatings([]);
			return;
		}
		setLoading(true);
		setError('');

		const { data, error } = await supabase
			.from('user_ratings')
			.select('tmdb_id,media_type,rating')
			.eq('user_id', user.id);
		if (error) {
			console.error('useUserRatings load error', error);
			setError('Failed to load ratings. Please try again later.');
			setRatings([]);
		} else {
			setRatings(data ?? []);
		}
		setLoading(false);
	}, [user]);
	useEffect(() => {
		loadRatings();
	}, [loadRatings]);
	return { ratings, loading, error, refresh: loadRatings };
};
