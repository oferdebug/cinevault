import { getVaultStats } from "./getVaultStats";

export const getRecommendationSeeds = (items = [], stats) => {
	if (!items.length) return [];

	const newestItem =
		[...items].sort(
			(a, b) =>
				new Date(b.created_at ?? 0).getTime() -
				new Date(a.created_at ?? 0).getTime(),
		)[0] ?? null;

	const total = items.length;
	const movieCount = items.filter((item) => item.media_type === "movie").length;
	const seriesCount = items.filter((item) => item.media_type === "tv").length;
	const dominantRatio = Math.max(movieCount, seriesCount) / total;

	let differentTypeItem = null;

	const ratedItems = items.filter((item) => item.userRating != null);
	const highestUserRated = ratedItems.reduce((bestItem, currentItem) => {
		if (!bestItem) return currentItem;

		const bestRating = Number(bestItem.userRating ?? 0);
		const currentRating = Number(currentItem.userRating ?? 0);

		return currentRating > bestRating ? currentItem : bestItem;
	}, null);

	const highestRated =
		highestUserRated ??
		stats?.highestRated ??
		getVaultStats(items).highestRated;
	if (dominantRatio < 0.8) {
		differentTypeItem = items.find(
			(item) => highestRated && item.media_type !== highestRated.media_type,
		);
	}

	const seeds = [highestRated, newestItem, differentTypeItem].filter(Boolean);

	const uniqueSeeds = seeds.filter(
		(seed, index, array) =>
			array.findIndex(
				(item) =>
					item.tmdb_id === seed.tmdb_id && item.media_type === seed.media_type,
			) === index,
	);

	return uniqueSeeds.slice(0, 3);
};
