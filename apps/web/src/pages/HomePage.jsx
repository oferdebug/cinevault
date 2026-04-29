import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

const fetchTrending = async () => {
  const { data } = await api.get('/catalog/trending');
  return data.data;
};

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: movies, isLoading, isError } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrending,
  });

  return (
    <main className={'pattern'}>
      <img
        src="/src/assets/BG.png"
        alt=""
        className="pointer-events-none absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className={'wrapper pt-28'}>
        <header>
          <img src='/src/assets/cinevault-logo-transparent.svg' alt='CineVault' />
          <h1>Discover <span className="text-gradient">Movies</span>
            <br /> You'll Actually Want to Watch
            </h1>
            <p className={'mx-auto mt-6 max-w-3xl text-center text-base leading-7 text-light-200'}>
                  Search millions of movies and TV shows. Find your next obsession.
            </p>
        </header>


        <div className={'search max-w-2xl mx-auto'}>
          <div>
            <img src={'/src/assets/search-icon-strong-glow.svg'}  alt='search' />
            <input type='text' placeholder='Search movies and TV shows' value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} />
          </div>
        </div>

        <section className="mt-16">
          <h2 className="mb-6">Trending This Week</h2>

          {isLoading && (
            <p className="text-gray-100 text-center py-10">Loading movies…</p>
          )}

          {isError && (
            <p className="text-red-400 text-center py-10">Failed to load movies.</p>
          )}

          {movies && (
            <div className="all-movies">
              <ul>
                {movies.map((movie) => (
                  <li key={movie.id} className="movie-card cursor-pointer">
                    <img
                      src={movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : '/src/assets/No-Poster.png'}
                      alt={movie.title ?? movie.name}
                    />
                    <h3>{movie.title ?? movie.name}</h3>
                    <div className="content">
                      <div className="rating">
                        <span>⭐</span>
                        <p>{movie.vote_average?.toFixed(1)}</p>
                      </div>
                      <span>•</span>
                      <span className="year">
                        {(movie.release_date ?? movie.first_air_date ?? '').slice(0, 4)}
                      </span>
                      <span>•</span>
                      <span className="lang">{movie.original_language}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};


export default HomePage;
