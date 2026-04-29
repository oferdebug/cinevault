const MovieCardSkeleton = () => (
  <li className="movie-card animate-pulse">
    <div className="w-full aspect-2/3 rounded-xl bg-dark-100" />
    <div className="h-4 bg-dark-100 rounded mt-4 w-3/4" />
    <div className="mt-2 flex gap-2">
      <div className="h-3 bg-dark-100 rounded w-8" />
      <div className="h-3 bg-dark-100 rounded w-10" />
      <div className="h-3 bg-dark-100 rounded w-6" />
    </div>
  </li>
);

export default MovieCardSkeleton;
