import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOrbs,
  getOrbBySlug,
  formatDate,
  formatProbability,
  formatCooldown,
} from "@/lib/data";
import { CitationBadge } from "@/components/CitationBadge";

export async function generateStaticParams() {
  const orbs = getOrbs();
  return orbs.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata(
  props: PageProps<"/orbs/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const orb = getOrbBySlug(slug);
  if (!orb) return { title: "Orb Not Found" };
  return {
    title: `${orb.orb_name}`,
    description: `Drop rates and effects for the ${orb.orb_name} skill orb from D-Genesis.`,
  };
}

export default async function OrbDetailPage(
  props: PageProps<"/orbs/[slug]">
) {
  const { slug } = await props.params;
  const orb = getOrbBySlug(slug);
  if (!orb) notFound();

  // Strip HTML for text display, but allow it in dangerouslySetInnerHTML
  const effectsPlainText = orb.known_effects
    ? orb.known_effects.replace(/<[^>]*>/g, " ").trim()
    : null;

  return (
    <>
      <div className="detail-header">
        <div className="detail-breadcrumb">
          <Link href="/orbs">← Skill Orbs</Link>
        </div>
        <h1 className="detail-title">{orb.orb_name || "Unknown Orb"}</h1>
      </div>

      {/* ── Effects ───────────────────── */}
      <section className="detail-section">
        <h2 className="detail-section-title">Known Effects</h2>
        <div
          className="contribute-card"
          style={{ borderLeft: "3px solid var(--accent-teal)" }}
        >
          {orb.known_effects ? (
            <p
              style={{ color: "var(--text-primary)", lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{
                __html: orb.known_effects.replace(/<br\s*\/?>/g, "<br />"),
              }}
            />
          ) : (
            <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
              Not documented
            </p>
          )}
        </div>
      </section>

      {/* ── Note ──────────────────────── */}
      {orb.note && (
        <section className="detail-section">
          <h2 className="detail-section-title">Note</h2>
          <div
            className="contribute-card"
            style={{ borderLeft: "3px solid var(--accent-purple)" }}
          >
            <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
              {orb.note}
            </p>
          </div>
        </section>
      )}

      {/* ── Drop Rates ────────────────── */}
      <section className="detail-section">
        <h2 className="detail-section-title">Drop Rates</h2>
        {orb.drop_rates.length > 0 ? (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dropped By</th>
                  <th>In Dungeon</th>
                  <th>On Floor</th>
                  <th>Probability</th>
                  <th>Cooldown</th>
                  <th>Citation</th>
                </tr>
              </thead>
              <tbody>
                {orb.drop_rates.map((rate, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--accent-teal)" }}>
                      {rate.creature || "Unknown"}
                    </td>
                    <td>{rate.dungeon || "Unknown"}</td>
                    <td>
                      {rate.floor ? (
                        <span
                          dangerouslySetInnerHTML={{ __html: rate.floor }}
                        />
                      ) : (
                        "Unknown"
                      )}
                    </td>
                    <td className="value-highlight">
                      {formatProbability(
                        rate.favorable_outcomes,
                        rate.total_events
                      )}
                    </td>
                    <td>
                      {rate.favorable_outcomes && rate.total_events
                        ? formatCooldown(rate.total_events)
                        : "—"}
                    </td>
                    <td>
                      <CitationBadge citation={rate.citation} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>No known drop rates.</p>
        )}
      </section>
    </>
  );
}
