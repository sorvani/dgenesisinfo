import { marked } from 'marked';

// Inline-only renderer — no wrapping <p> for single-line strings.
// Use renderMd() for block content (paragraphs, lists, images).
// Use renderMdInline() for single-line fields where a <p> wrapper is unwanted.

marked.setOptions({ breaks: true });

export function renderMd(src: string | null | undefined): string {
	if (!src) return '';
	return marked.parse(src) as string;
}

export function renderMdInline(src: string | null | undefined): string {
	if (!src) return '';
	return marked.parseInline(src) as string;
}
