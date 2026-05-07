import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useWatchlist = (tmdbId) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const isToggling = { current: false };

  useEffect(() => {
    if (!user || !tmdbId) return;

    setLoading(true);
    supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('tmdb_id', tmdbId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('useWatchlist check error', error);
          return;
        }
        setSaved(!!data);
      })
      .finally(() => setLoading(false));
  }, [user, tmdbId]);

  const toggle = async (movieData) => {
    if (!user || isToggling.current) return;
    isToggling.current = true;
    setLoading(true);

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
        const { error } = await supabase.from('watchlist').insert({
          user_id: user.id,
          tmdb_id: tmdbId,
          ...movieData,
        });
        if (error) throw error;
        setSaved(true);
      }
    } catch (err) {
      console.error('useWatchlist toggle error', err);
    } finally {
      setLoading(false);
      isToggling.current = false;
    }
  };

  return { saved, loading, toggle };
};
