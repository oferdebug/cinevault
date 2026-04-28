const App = () => {
	return (
		<main className={"pattern"}>
			<div className={"wrapper"}>
				<header>
					<img
						src={"src/assets/cinevault-logo-transparent.svg"}
						alt="Movie Explorer Logo"
						className={"mx-auto mb-8 h-28 w-28 object-contain"}
					/>
					<img src={"src/assets/"} alt="Hero-Image" />
					<h1 className={"text-center text-4xl font-bold"}>
						Discover <span className={"text-gradient"}>Movies</span>
						<br /> You’ll Actually Want to Watch
					</h1>
					<p
						className={
							"mx-auto mt-5 max-w-2xl text-center text-base leading-7 text-light-200"
						}
					>
						<span>
							{" "}
							Explore trending titles, top-rated films, and hidden gems — all in
							one cinematic experience.
						</span>
					</p>
				</header>
				<div className={"search"}>
					<div>
						<img
							src={"src/assets/search-icon-strong-glow.svg"}
							alt="Search Icon"
							className={"h-6 w-6"}
						/>
						<input
							type={"text"}
							placeholder={"Search For Movies, generates, or Keywords"}
							className={"input"}
						/>
					</div>
				</div>
			</div>
		</main>
	);
};
export default App;
