<svelte:head><title>Credits & Copyright — D-Genesis Info</title></svelte:head>

<div class="container page">
	<h1 class="page-title">Credits &amp; Copyright</h1>
	<p class="credits-intro">
		This is a derivative fan work collecting information from the series in one place.
		All information is copyright of the original author, artist, and publishers.
	</p>

	<div class="data-section">
		<p class="section-heading">Original Series</p>
		<div class="card">
			<dl class="credits-list">
				<div class="credits-row">
					<dt>Title</dt>
					<dd>D-Genesis: Three Years after the Dungeons Appeared</dd>
				</div>
				<div class="credits-row">
					<dt>Original Title</dt>
					<dd>Dジェネシス ダンジョンが出来て3年</dd>
				</div>
			</dl>
		</div>
	</div>

	<div class="data-section">
		<p class="section-heading">Creatives</p>
		<div class="card">
			<dl class="credits-list">
				<div class="credits-row">
					<dt>Author</dt>
					<dd><a href="https://x.com/KonoTsuranori" target="_blank" rel="noopener noreferrer">KONO Tsuranori (之貫紀)</a></dd>
				</div>
				<div class="credits-row">
					<dt>Illustrator</dt>
					<dd><a href="https://xfolio.jp/en/portfolio/ttl" target="_blank" rel="noopener noreferrer">ttl</a></dd>
				</div>
				<div class="credits-row">
					<dt>Manga</dt>
					<dd><a href="https://x.com/Miya_Taira" target="_blank" rel="noopener noreferrer">Miya Taira (平未夜)</a></dd>
				</div>
			</dl>
		</div>
	</div>

	<div class="data-section">
		<p class="section-heading">Publishing</p>
		<div class="card">
			<dl class="credits-list">
				<div class="credits-row">
					<dt>English Publisher</dt>
					<dd><a href="https://j-novel.club/series/d-genesis" target="_blank" rel="noopener noreferrer">J-Novel Club</a></dd>
				</div>
				<div class="credits-row">
					<dt>Japanese Publisher</dt>
					<dd><a href="https://www.kadokawa.co.jp/product/322502001806/" target="_blank" rel="noopener noreferrer">Kadokawa</a></dd>
				</div>
			</dl>
		</div>
	</div>

	<div class="data-section">
		<p class="section-heading">Fan Site</p>
		<div class="card">
			<dl class="credits-list">
				<div class="credits-row">
					<dt>Design &amp; Development</dt>
					<dd>J. Busch</dd>
				</div>
				<div class="credits-row">
					<dt>Source Code</dt>
					<dd><a href="https://github.com/sorvani/dgenesisinfo" target="_blank" rel="noopener noreferrer">GitHub</a></dd>
				</div>
			</dl>
		</div>
	</div>
</div>

<style>
	.credits-intro {
		color: var(--text-2);
		font-size: 0.9375rem;
		margin-top: 0.5rem;
		margin-bottom: 0;
	}

	.credits-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.credits-row {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 1rem;
		align-items: baseline;
	}

	dt {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-3);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	dd {
		font-size: 0.9375rem;
		color: var(--text);
	}

	@media (max-width: 500px) {
		.credits-row { grid-template-columns: 1fr; gap: 0.2rem; }
	}
</style>
