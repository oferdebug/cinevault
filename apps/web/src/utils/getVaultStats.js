export const getVaultStats = (items = []) => {
	const totalTitles = items.length;

	if (totalTitles === 0) {
		return {
			totalTitles: 0,
			movieCount: 0,
			seriesCount: 0,
			averageRating: 0,
			highestRated: null,
		};
	}

	const movieCount = items.filter((item) => item.media_type === 'movie').length;
	const seriesCount = items.filter((item) => item.media_type === 'tv').length;

	const ratingSum = items.reduce((sum, item) => {
		return sum + Number(item.vote_average ?? 0);
	}, 0);

	const averageRating = ratingSum / totalTitles;

	const highestRated = items.reduce((bestItem, currentItem) => {
		if (!bestItem) return currentItem;

		const bestRating = Number(bestItem.vote_average ?? 0);
		const currentRating = Number(currentItem.vote_average ?? 0);

		return currentRating > bestRating ? currentItem : bestItem;
	}, null);

	return {
		totalTitles,
		movieCount,
		seriesCount,
		averageRating,
		highestRated,
	};
};
