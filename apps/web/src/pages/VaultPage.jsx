import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabase';

const VaultPage = () => {
	const navigate = useNavigate();
	const { user, loading: authLoading } = useAuth();

	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let ignore = false;

		const loadVault = async () => {
			if (authLoading) return;

			if (!user) {
				setItems([]);
				setLoading(false);
				return;
			}

			setLoading(true);
			setError('');

			const { data, error } = await supabase
				.from('watchlist')
				.select(
					'id, tmdb_id, media_type, title, poster_path, vote_average, created_at',
				)
				.eq('user_id', user.id)
				.order('created_at', { ascending: false });

			if (ignore) return;

			if (error) {
				setError('Failed to load your vault.');
				setItems([]);
			} else {
				setItems(data ?? []);
			}

			setLoading(false);
		};

		loadVault();

		return () => {
			ignore = true;
		};
	}, [user, authLoading]);

	const removeFromVault = async (vaultId) => {
		const previousItems = items;

		setItems((currentItems) =>
			currentItems.filter((item) => item.id !== vaultId),
		);

		const { error } = await supabase
			.from('watchlist')
			.delete()
			.eq('id', vaultId);

		if (error) {
			setItems(previousItems);
			setError('Failed to remove title from your vault.');
		}
	};

	if (authLoading || loading) {
		return (
			<main className="min-h-screen bg-primary px-8 pt-28 pb-20">
				<div className="mx-auto max-w-6xl">
					<p className="text-light-200">Loading your vault…</p>
				</div>
			</main>
		);
	}

	if (!user) {
		return (
			<main className="min-h-screen bg-primary px-8 pt-28 pb-20">
				<section className="mx-auto max-w-3xl rounded-3xl border border-light-100/10 bg-dark-100/70 p-8 text-center">
					<p className="text-sm font-bold uppercase tracking-[0.24em] text-accent">
						My Vault
					</p>

					<h1 className="mt-4 text-4xl font-bold text-light-100">
						Sign in to open your vault.
					</h1>

					<p className="mx-auto mt-4 max-w-xl text-light-200">
						Save movies and shows, then come back to your personal CineVault
						anytime.
					</p>

					<button
						type="button"
						onClick={() => navigate('/login')}
						className="mt-6 rounded-full bg-accent px-7 py-3 text-sm font-bold text-primary transition hover:bg-accent/80"
					>
						Sign In
					</button>
				</section>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-primary px-8 pt-28 pb-20">
			<section className="mx-auto max-w-6xl">
				<div className="mb-8">
					<p className="text-sm font-bold uppercase tracking-[0.24em] text-accent">
						My Vault
					</p>

					<h1 className="mt-3 text-left text-4xl font-bold text-light-100">
						Your saved titles
					</h1>

					<p className="mt-3 max-w-2xl text-light-200">
						Everything you saved from CineVault, ready when you are.
					</p>
				</div>

				{error && <p className="mb-6 text-red-400">{error}</p>}

				{items.length === 0 ? (
					<div className="rounded-3xl border border-light-100/10 bg-dark-100/70 p-8 text-center">
						<h2 className="text-2xl font-bold text-light-100">
							Your vault is empty.
						</h2>

						<p className="mt-3 text-light-200">
							Start saving titles from the home page or title detail pages.
						</p>

						<button
							type="button"
							onClick={() => navigate('/')}
							className="mt-6 rounded-full border border-accent/40 px-6 py-3 text-sm font-bold text-accent transition hover:bg-accent hover:text-primary"
						>
							Discover Titles
						</button>
					</div>
				) : (
					<div className="all-movies">
						<ul>
							{items.map((item) => {
								const posterSrc = item.poster_path
									? `https://image.tmdb.org/t/p/w500${item.poster_path}`
									: '/src/assets/No-Poster.png';

								return (
									<li key={item.id} className="movie-card relative">
										<button
											type="button"
											aria-label="Remove from vault"
											onClick={() => removeFromVault(item.id)}
											className="absolute right-7 top-7 z-10 rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-bold text-primary backdrop-blur-md transition hover:bg-red-400"
										>
											Remove
										</button>

										<button
											type="button"
											className="w-full cursor-pointer text-left"
											onClick={() =>
												navigate(
													`/title/${item.tmdb_id}?type=${item.media_type ?? 'movie'}`,
												)
											}
										>
											<img src={posterSrc} alt={item.title} />

											<h3>{item.title}</h3>

											<div className="content">
												<div className="rating">
													<span>⭐</span>
													<p>{Number(item.vote_average ?? 0).toFixed(1)}</p>
												</div>

												<span>•</span>

												<span className="lang">
													{item.media_type === 'tv' ? 'Series' : 'Movie'}
												</span>
											</div>
										</button>
									</li>
								);
							})}
						</ul>
					</div>
				)}
			</section>
		</main>
	);
};

export default VaultPage;
