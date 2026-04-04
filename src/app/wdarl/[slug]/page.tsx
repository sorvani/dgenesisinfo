import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCharacters, getCharacterBySlug, getFullName } from "@/lib/data";
import { CharacterDetail } from "@/components/CharacterDetail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const characters = getCharacters().filter((c) => c.in_wdarl);
  return characters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const character = getCharacterBySlug(slug);
  if (!character || !character.in_wdarl) return { title: "WDARL Listing Not Found" };
  const name = getFullName(character);
  return {
    title: `${name}${character.moniker ? ` "${character.moniker}"` : ""}`,
    description: `WDARL stats, rankings, and skill orbs for ${name} from D-Genesis.`,
  };
}

export default async function WdarlDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const character = getCharacterBySlug(slug);
  
  if (!character || !character.in_wdarl) {
    notFound();
  }

  return (
    <CharacterDetail 
      character={character} 
      backHref="/wdarl" 
      backLabel="WDARL Rankings" 
    />
  );
}
