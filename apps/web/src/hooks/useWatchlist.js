import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useWatchlist = (tmdbId) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!user || !tmdbId) return;

    supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('tmdb_id', tmdbId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [user, tmdbId]);

  const toggle = async (movieData) => {
    if (!user) return;
    setLoading(true);

    if (saved) {
      await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('tmdb_id', tmdbId);
      setSaved(false);
    } else {
      await supabase.from('watchlist').insert({
        user_id: user.id,
        tmdb_id: tmdbId,
        ...movieData,
      });
      setSaved(true);
    }
    setLoading(false);
  };

  return { saved, loading, toggle };
};
