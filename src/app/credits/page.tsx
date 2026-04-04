import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credits & Copyright",
  description:
    "Credits, copyright, and attribution for the D-Genesis Stats fan database.",
};

export default function CreditsPage() {
  return (
    <>
      <div className="credits-card">
        <h1>Credits &amp; Copyright</h1>
        <p className="credits-intro">
          This is a derivative fan work collecting information from the series in
          one place. All information is copyright of the original author, artist,
          and publishers.
        </p>

        <h2>Original Series</h2>
        <dl className="credits-list">
          <div className="credits-row">
            <dt>Title</dt>
            <dd>D-Genesis: Three Years after the Dungeons Appeared</dd>
          </div>
          <div className="credits-row">
            <dt>Original Title</dt>
            <dd>Dジェネシス ダンジョンが出来て3年</dd>
          </div>
        </dl>

        <h2>Creatives</h2>
        <dl className="credits-list">
          <div className="credits-row">
            <dt>Author</dt>
            <dd>
              <a
                href="https://x.com/KonoTsuranori"
                target="_blank"
                rel="noopener noreferrer"
              >
                KONO Tsuranori (之貫紀)
              </a>
            </dd>
          </div>
          <div className="credits-row">
            <dt>Illustrator</dt>
            <dd>
              <a
                href="https://xfolio.jp/en/portfolio/ttl"
                target="_blank"
                rel="noopener noreferrer"
              >
                ttl
              </a>
            </dd>
          </div>
          <div className="credits-row">
            <dt>Manga</dt>
            <dd>
              <a
                href="https://x.com/Miya_Taira"
                target="_blank"
                rel="noopener noreferrer"
              >
                Miya Taira (平未夜)
              </a>
            </dd>
          </div>
        </dl>

        <h2>Publishing</h2>
        <dl className="credits-list">
          <div className="credits-row">
            <dt>English Publisher</dt>
            <dd>
              <a
                href="https://j-novel.club/series/d-genesis"
                target="_blank"
                rel="noopener noreferrer"
              >
                J-Novel Club
              </a>
            </dd>
          </div>
          <div className="credits-row">
            <dt>Japanese Publisher</dt>
            <dd>
              <a
                href="https://www.kadokawa.co.jp/product/322502001806/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kadokawa
              </a>
            </dd>
          </div>
        </dl>

        <h2>Fan Site</h2>
        <dl className="credits-list">
          <div className="credits-row">
            <dt>Design &amp; Development</dt>
            <dd>J. Busch</dd>
          </div>
          <div className="credits-row">
            <dt>Source Code</dt>
            <dd>
              <a
                href="https://github.com/sorvani/dgenesisinfo"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
