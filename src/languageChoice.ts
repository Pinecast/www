import {LOCALES} from './locales.mjs';

// The reader's choice of language, kept in localStorage: the code of the
// language that they picked, in the footer or in the language suggestion, or
// "dismissed" when they closed the suggestion. Once there is a choice, the site
// suggests no language again (Matt, 2026-11-16). It stays on the reader's
// device: nothing sends it anywhere, and nothing redirects by it.
const STORAGE_KEY = 'language';

export const DISMISSED = 'dismissed';

export function readLanguageChoice(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage that is off or full is no choice.
    return null;
  }
}

export function saveLanguageChoice(choice: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {}
}

// The first of the reader's languages (`navigator.languages`, most preferred
// first) that the site has, by its primary subtag: `es-MX` and `es` are `es`.
// Null when the site has none of them.
export function preferredLocale(
  languages: ReadonlyArray<string>,
): string | null {
  for (const language of languages) {
    const primary = language.split('-')[0].toLowerCase();
    if (LOCALES.includes(primary)) {
      return primary;
    }
  }
  return null;
}
