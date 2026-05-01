import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import supabase from '../lib/supabase';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext({
	vaultItems: [],
	savedIds: new Set(),
	isInWatchlist: () => false,
	addToWatchlist: () => {},
	removeFromWatchlist: () => {},
	refresh: () => {},
	loading: false,
});

export const WatchlistProvider = ({ children }) => {
	const { user } = useAuth();
	const [vaultItems, setVaultItems] = useState([]);
	const [loading, setLoading] = useState(true);

	const savedIds = useMemo(
		() => new Set(vaultItems.map((item) => String(item.tmdb_id))),
		[vaultItems],
	);

	const loadVault = useCallback(async () => {
		if (!user) {
			setVaultItems([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		const { data, error } = await supabase
			.from('watchlist')
			.select(
				'id, tmdb_id, media_type, title, poster_path, vote_average, created_at',
			)
			.eq('user_id', user.id)
			.order('created_at', { ascending: false });

		if (!error) {
			setVaultItems(data ?? []);
		}
		setLoading(false);
	}, [user]);

	const isInWatchlist = useCallback(
		(tmdbId) => savedIds.has(String(tmdbId)),
		[savedIds],
	);

	const addToWatchlist = useCallback((item) => {
		setVaultItems((prev) => {
			if (prev.some((i) => String(i.tmdb_id) === String(item.tmdb_id))) {
				return prev;
			}
			return [{ ...item, created_at: new Date().toISOString() }, ...prev];
		});
	}, []);

	const removeFromWatchlist = useCallback((tmdbId) => {
		setVaultItems((prev) =>
			prev.filter((i) => String(i.tmdb_id) !== String(tmdbId)),
		);
	}, []);

	useEffect(() => {
		loadVault();
	}, [loadVault]);

	useEffect(() => {
		if (!user) return;
		const channel = supabase
			.channel(`watchlist-context-${user.id}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'watchlist',
				},
				() => {
					void loadVault();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [user, loadVault]);

	return (
		<WatchlistContext.Provider
			value={{
				vaultItems,
				savedIds,
				isInWatchlist,
				addToWatchlist,
				removeFromWatchlist,
				refresh: loadVault,
				loading,
			}}
		>
			{children}
		</WatchlistContext.Provider>
	);
};

export const useWatchlistContext = () => useContext(WatchlistContext);
