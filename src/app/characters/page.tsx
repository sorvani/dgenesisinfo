import type { Metadata } from "next";
import { getCharacters, getAllUniqueRankingCitations } from "@/lib/data";
import { CharactersGrid } from "@/components/CharactersGrid";

export const metadata: Metadata = {
  title: "Cast of Characters",
  description:
    "Database of all known characters and explorers from D-Genesis.",
};

export default function CharactersPage() {
  const characters = getCharacters();
  const citations = getAllUniqueRankingCitations();

  return (
    <>
      <div className="page-header">
        <h1>Cast of Characters</h1>
        <p>
          A complete roster containing {characters.length} known
          characters and explorers. Click a character to view their biography and metadata.
        </p>
      </div>
      <CharactersGrid characters={characters} />
    </>
  );
}
