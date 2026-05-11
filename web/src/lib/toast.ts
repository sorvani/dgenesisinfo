import { writable } from 'svelte/store';

// Global toast message — set this from anywhere, render once in +layout.
// Survives SvelteKit client-side navigation, so the contribute flow can
// trigger a toast and immediately go back to the source page without
// waiting for the toast to clear.
export const toast = writable<string | null>(null);

export function showToast(msg: string, ms = 2000) {
	toast.set(msg);
	setTimeout(() => {
		// Only clear if it hasn't been replaced by a newer toast in the meantime.
		toast.update(cur => (cur === msg ? null : cur));
	}, ms);
}
