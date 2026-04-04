import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Help improve the D-Genesis Stats database by contributing data corrections and additions.",
};

export default function ContributePage() {
  return (
    <>
      <div className="page-header">
        <h1>Contribute to D-Genesis Stats</h1>
        <p>
          Help us build the most complete and accurate database of explorer data
          from D-Genesis: Three Years after the Dungeons Appeared.
        </p>
      </div>

      <div className="contribute-card">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <h3>Submission Form</h3>
          <span className="coming-soon-badge">Coming Soon</span>
        </div>
        <p>
          We&apos;re building a submission form that will let you suggest corrections
          and additions directly. Your submissions will be reviewed and
          incorporated into the database.
        </p>
      </div>

      <div className="contribute-card">
        <h3>How to Contribute Now</h3>
        <p style={{ marginBottom: "1rem" }}>
          In the meantime, you can contribute through GitHub:
        </p>
        <ol>
          <li>
            <strong>Report issues:</strong> Found incorrect data?{" "}
            <a
              href="https://github.com/sorvani/dgenesisinfo/issues/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open an issue on GitHub
            </a>{" "}
            with the correction details.
          </li>
          <li>
            <strong>Submit data:</strong> Have new data from a recently
            translated volume? Include the volume, chapter, and JNC part
            number as a citation.
          </li>
          <li>
            <strong>Pull requests:</strong> If you&apos;re comfortable with JSON,
            you can directly edit the data files and submit a pull request.
          </li>
        </ol>
      </div>

      <div className="contribute-card">
        <h3>Citation Format</h3>
        <p>
          All data should include a citation referencing where in the light
          novel series the information was found:
        </p>
        <ul style={{ marginTop: "0.75rem" }}>
          <li>
            <strong>Volume:</strong> The volume number (e.g., 1, 2, 3…)
          </li>
          <li>
            <strong>Chapter:</strong> The chapter number within the volume
          </li>
          <li>
            <strong>JNC Part:</strong> The J-Novel Club digital part number
          </li>
        </ul>
      </div>

      <div className="contribute-card">
        <h3>What We Track</h3>
        <ul>
          <li>
            <strong>Explorers:</strong> Names, monikers, nationality, WDARL
            rankings over time, stat readings, and orbs used
          </li>
          <li>
            <strong>Skill Orbs:</strong> Names, known effects, drop rates,
            source creatures and dungeons
          </li>
        </ul>
      </div>
    </>
  );
}
