import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import MovieCardSkeleton from '../components/MovieCardSkeleton';

const fetchGenres = async () => {
  const { data } = await api.get('/catalog/genres');
  return data.data;
};

const fetchByGenre = async (genreId, type) => {
  const { data } = await api.get(`/catalog/by-genre/${genreId}?type=${type}`);
  return data.data;
};

const BrowsePage = () => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [mediaType, setMediaType] = useState('movie');
  const navigate = useNavigate();

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: fetchGenres,
  });

  const { data: movies, isLoading } = useQuery({
    queryKey: ['by-genre', selectedGenre, mediaType],
    queryFn: () => fetchByGenre(selectedGenre, mediaType),
    enabled: !!selectedGenre,
  });

  return (
    <main className="min-h-screen bg-primary pt-24 pb-16 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-left text-4xl mb-8">Browse</h1>

        <div className="flex gap-3 mb-6">
          {['movie', 'tv'].map((t) => (
            <button
              key={t}
              onClick={() => setMediaType(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                mediaType === t
                  ? 'bg-accent text-primary'
                  : 'bg-dark-100 text-gray-100 hover:bg-dark-100/60'
              }`}
            >
              {t === 'tv' ? 'TV Shows' : 'Movies'}
            </button>
          ))}
        </div>

        {genres && (
          <div className="flex flex-wrap gap-2 mb-10">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  selectedGenre === genre.id
                    ? 'bg-accent text-primary font-semibold'
                    : 'bg-dark-100/80 text-gray-100 hover:bg-dark-100 border border-light-100/10'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}

        {!selectedGenre && (
          <p className="text-gray-100 text-center py-20">
            Select a genre to browse titles
          </p>
        )}

        {isLoading && (
          <div className="all-movies">
            <ul>
              {Array.from({ length: 8 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </ul>
          </div>
        )}

        {movies && (
          <div className="all-movies">
            <ul>
              {movies.map((movie) => (
                <li
                  key={movie.id}
                  className="movie-card cursor-pointer"
                  onClick={() => navigate(`/title/${movie.id}?type=${mediaType}`)}
                >
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
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
};

export default BrowsePage;