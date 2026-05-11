import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NoPoster from '../assets/No-Poster.png';

const pickerOptions = {
	type: [
		{ label: 'Any', value: 'any' },
		{ label: 'Movie', value: 'movie' },
		{ label: 'Series', value: 'tv' },
	],
	mood: [
		{ label: 'Any', value: 'any' },
		{ label: 'Action', value: 'action' },
		{ label: 'Drama', value: 'drama' },
		{ label: 'Sci-Fi', value: 'sci-fi' },
		{ label: 'Comedy', value: 'comedy' },
		{ label: 'Thriller', value: 'thriller' },
	],
	time: [
		{ label: 'Any', value: 'any' },
		{ label: 'Quick watch', value: 'quick' },
		{ label: 'Full movie night', value: 'full' },
	],
};

const moodGenreMap = {
	action: [28, 12],
	drama: [18],
	'sci-fi': [878],
	comedy: [35],
	thriller: [53, 80, 9648],
};

const UnlockPicker = ({ titles = [] }) => {
	const navigate = useNavigate();

	const [isOpen, setIsOpen] = useState(false);
	const [answers, setAnswers] = useState({
		type: 'any',
		mood: 'any',
		time: 'any',
	});
	const [pickedTitle, setPickedTitle] = useState(null);

	const updateAnswer = (key, value) => {
		setAnswers((current) => ({
			...current,
			[key]: value,
		}));
	};

	const unlockPick = () => {
		const sourceTitles = Array.isArray(titles) ? titles : [];

		if (sourceTitles.length === 0) {
			setPickedTitle(null);
			return;
		}

		let candidates = [...sourceTitles];

		if (answers.type !== 'any') {
			candidates = candidates.filter(
				(title) => (title.media_type ?? 'movie') === answers.type,
			);
		}

		if (answers.mood !== 'any') {
			const genreIds = moodGenreMap[answers.mood] ?? [];

			candidates = candidates.filter((title) =>
				title.genre_ids?.some((genreId) => genreIds.includes(genreId)),
			);
		}

		if (answers.time !== 'any') {
			const timeFiltered = candidates.filter((title) => {
				if (typeof title.runtime !== 'number') return false;

				if (answers.time === 'quick') return title.runtime <= 100;
				if (answers.time === 'full') return title.runtime > 100;

				return true;
			});

			if (timeFiltered.length > 0) {
				candidates = timeFiltered;
			}
		}

		if (candidates.length === 0) {
			candidates = sourceTitles;
		}

		const randomIndex = Math.floor(Math.random() * candidates.length);
		setPickedTitle(candidates[randomIndex]);
	};

	return (
		<>
			<section className="mx-auto mt-10 max-w-4xl rounded-3xl border border-accent/20 bg-dark-100/70 p-6 shadow-inner shadow-accent/10 backdrop-blur-md sm:p-8">
				<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-accent">
							CineVault Picks
						</p>

						<h2 className="text-2xl font-bold text-light-100 sm:text-3xl">
							Not sure what to watch?
						</h2>

						<p className="mt-3 max-w-2xl text-sm leading-6 text-light-200 sm:text-base">
							Answer 3 quick questions and CineVault will unlock a pick based on
							your current watch mood.
						</p>
					</div>

					<button
						type="button"
						onClick={() => setIsOpen((current) => !current)}
						className="whitespace-nowrap rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-primary transition hover:bg-accent/80"
					>
						Unlock My Pick
					</button>
				</div>
			</section>

			{isOpen && (
				<section className="mx-auto mt-5 max-w-4xl rounded-3xl border border-light-100/10 bg-dark-100/80 p-6 backdrop-blur-md">
					<div className="grid gap-5 md:grid-cols-3">
						<div>
							<p className="mb-2 block text-sm font-semibold text-light-100">
								What do you want to watch?
							</p>

							<div className="flex flex-wrap gap-3">
								{pickerOptions.type.map((option) => (
									<button
										key={option.value}
										type="button"
										onClick={() => updateAnswer('type', option.value)}
										className={`rounded-full border px-3 py-2 text-sm transition ${
											answers.type === option.value
												? 'border-accent bg-accent text-primary'
												: 'border-light-100/10 text-light-200 hover:border-accent/50'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>

						<div>
							<p className="mb-2 block text-sm font-semibold text-light-100">
								What mood are you in?
							</p>

							<div className="flex flex-wrap gap-2">
								{pickerOptions.mood.map((option) => (
									<button
										key={option.value}
										type="button"
										onClick={() => updateAnswer('mood', option.value)}
										className={`rounded-full border px-3 py-2 text-sm transition ${
											answers.mood === option.value
												? 'border-accent bg-accent text-primary'
												: 'border-light-100/10 text-light-200 hover:border-accent/50'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>

						<div>
							<p className="mb-2 block text-sm font-semibold text-light-100">
								How much time?
							</p>

							<div className="flex flex-wrap gap-2">
								{pickerOptions.time.map((option) => (
									<button
										key={option.value}
										type="button"
										onClick={() => updateAnswer('time', option.value)}
										className={`rounded-full border px-3 py-2 text-sm transition ${
											answers.time === option.value
												? 'border-accent bg-accent text-primary'
												: 'border-light-100/10 text-light-200 hover:border-accent/50'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>
					</div>

					<div className="mt-6 flex justify-center">
						<button
							type="button"
							onClick={unlockPick}
							className="rounded-full bg-light-100 px-7 py-3 text-sm font-bold text-primary transition hover:bg-light-200"
						>
							Reveal My Pick
						</button>
					</div>

					{pickedTitle && (
						<div className="mt-6 rounded-2xl border border-accent/20 bg-primary/50 p-4">
							<p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
								Your unlocked pick
							</p>

							<div className="mt-4 flex gap-4">
								<img
									src={
										pickedTitle.poster_path
											? `https://image.tmdb.org/t/p/w185${pickedTitle.poster_path}`
											: NoPoster
									}
									alt={pickedTitle.title ?? pickedTitle.name}
									className="h-32 w-24 rounded-xl object-cover"
								/>

								<div>
									<h3 className="text-xl font-bold text-light-100">
										{pickedTitle.title ?? pickedTitle.name}
									</h3>

									<p className="mt-2 text-sm text-light-200">
										CineVault picked this based on your current mood and
										available trending titles.
									</p>

									<button
										type="button"
										onClick={() =>
											navigate(
												`/title/${pickedTitle.id}?type=${pickedTitle.media_type ?? 'movie'}`,
											)
										}
										className="mt-4 rounded-full border border-accent/40 px-5 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-primary"
									>
										View Details
									</button>
								</div>
							</div>
						</div>
					)}
				</section>
			)}
		</>
	);
};

export default UnlockPicker;
