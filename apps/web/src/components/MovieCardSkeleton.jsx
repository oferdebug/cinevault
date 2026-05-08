const MovieCardSkeleton = () => (
	<li
		className="movie-card animate-pulse overflow-hidden"
		role="status"
		aria-busy="true"
		aria-label="Loading movie card"
	>
		<div className="w-full aspect-[2/3] bg-surface-3" />
		<div className="card-inner">
			<div className="h-3.5 bg-surface-3 rounded-full w-3/4" />
			<div className="mt-2 flex gap-2">
				<div className="h-2.5 bg-surface-3 rounded-full w-8" />
				<div className="h-2.5 bg-surface-3 rounded-full w-10" />
				<div className="h-2.5 bg-surface-3 rounded-full w-6" />
			</div>
		</div>
	</li>
);

export default MovieCardSkeleton;
