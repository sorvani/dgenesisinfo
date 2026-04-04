import { formatCitation, type Citation } from "@/lib/data";

export function CitationBadge({ citation }: { citation: Citation | null }) {
  const text = formatCitation(citation);
  if (!text) return null;
  return <span className="citation-badge">{text}</span>;
}
