/**
 * i18n-iso-cities
 *
 * Multilingual city name translations organized by ISO 3166-1 country codes.
 * Modeled after i18n-iso-countries — register only the locales you need.
 *
 * Usage:
 *   import cities from 'i18n-iso-cities';
 *   import en from 'i18n-iso-cities/langs/en.json';
 *   import ar from 'i18n-iso-cities/langs/ar.json';
 *
 *   cities.registerLocale(en);
 *   cities.registerLocale(ar);
 *
 *   cities.getName('SA', 'Riyadh', 'ar');        // 'الرياض'
 *   cities.translate('Riyadh', 'ar');             // 'الرياض'
 *   cities.getAll('SA', 'ar');                    // [{ name: 'Riyadh', translation: 'الرياض' }, ...]
 *   cities.getOriginalName('الرياض', 'ar');        // { countryCode: 'SA', name: 'Riyadh' }
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface LocaleData {
  locale: string;
  cities: Record<string, Record<string, string>>;
}

export interface CityEntry {
  name: string;
  translation: string;
}

export interface CityLookup {
  countryCode: string;
  name: string;
}

// ── Locale Registry ──────────────────────────────────────────────────────────

/** locale → countryCode → englishName → translatedName */
const locales: Record<string, Record<string, Record<string, string>>> = {};

/** locale → translatedName → { countryCode, name } (built lazily) */
const reverseCache: Record<string, Map<string, CityLookup>> = {};

/** locale → flat englishName → translatedName (built lazily, first match wins) */
const flatCache: Record<string, Map<string, string>> = {};

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function invalidateCache(locale: string): void {
  delete reverseCache[locale];
  delete flatCache[locale];
}

function ensureReverse(locale: string): Map<string, CityLookup> {
  if (!reverseCache[locale]) {
    const map = new Map<string, CityLookup>();
    const countries = locales[locale];
    if (countries) {
      for (const [countryCode, cityMap] of Object.entries(countries)) {
        for (const [name, translation] of Object.entries(cityMap)) {
          if (!map.has(translation)) {
            map.set(translation, { countryCode, name });
          }
        }
      }
    }
    reverseCache[locale] = map;
  }
  return reverseCache[locale];
}

function ensureFlat(locale: string): Map<string, string> {
  if (!flatCache[locale]) {
    const map = new Map<string, string>();
    const countries = locales[locale];
    if (countries) {
      for (const cityMap of Object.values(countries)) {
        for (const [name, translation] of Object.entries(cityMap)) {
          const key = normalizeName(name);
          if (!map.has(key)) {
            map.set(key, translation);
          }
        }
      }
    }
    flatCache[locale] = map;
  }
  return flatCache[locale];
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Register a locale. Call this once per locale before using other methods.
 * Locales are tree-shakeable — only import the ones you need.
 */
export function registerLocale(data: LocaleData): void {
  if (!data?.locale || !data?.cities) return;
  locales[data.locale] = data.cities;
  invalidateCache(data.locale);
}

/**
 * Get the translated name of a city in a specific country.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g. "SA")
 * @param cityName    - English city name (e.g. "Riyadh")
 * @param locale      - Target locale (e.g. "ar")
 * @returns Translated city name, or undefined if not found
 */
export function getName(
  countryCode: string,
  cityName: string,
  locale: string,
): string | undefined {
  if (!cityName) return undefined;
  return locales[locale]?.[countryCode.toUpperCase()]?.[cityName];
}

/**
 * Translate a city name without specifying a country code.
 * Searches all registered countries in the locale; returns first match.
 * Useful for translating raw API responses (e.g. Instagram demographics).
 *
 * @param cityName - English city name (case-insensitive)
 * @param locale   - Target locale
 * @returns Translated name, or undefined
 */
export function translate(cityName: string, locale: string): string | undefined {
  if (!cityName) return undefined;
  return ensureFlat(locale).get(normalizeName(cityName));
}

/**
 * Get all cities for a country in a given locale.
 *
 * @param countryCode - ISO 3166-1 alpha-2 code
 * @param locale      - Target locale
 * @returns Array of { name, translation } objects sorted by English name
 */
export function getAll(countryCode: string, locale: string): CityEntry[] {
  const cityMap = locales[locale]?.[countryCode.toUpperCase()];
  if (!cityMap) return [];
  return Object.entries(cityMap)
    .map(([name, translation]) => ({ name, translation }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Reverse-lookup: given a translated city name, find the original English name
 * and country code. If the translated name is ambiguous across countries,
 * pass a country code to disambiguate.
 *
 * @param translatedName - City name in the target locale (e.g. "الرياض")
 * @param locale         - The locale of the translated name
 * @param countryCode    - Optional ISO 3166-1 alpha-2 country code hint
 * @returns { countryCode, name } or undefined
 */
export function getOriginalName(
  translatedName: string,
  locale: string,
  countryCode?: string,
): CityLookup | undefined {
  if (!translatedName) return undefined;

  if (countryCode) {
    const normalizedCountryCode = countryCode.toUpperCase();
    const cityMap = locales[locale]?.[normalizedCountryCode] ?? {};

    for (const [name, translation] of Object.entries(cityMap)) {
      if (translation === translatedName) {
        return { countryCode: normalizedCountryCode, name };
      }
    }
  }

  return ensureReverse(locale).get(translatedName);
}

/**
 * Get all country codes that have city data for a given locale.
 */
export function getCountryCodes(locale: string): string[] {
  return Object.keys(locales[locale] ?? {});
}

/**
 * Get all registered locales.
 */
export function getSupportedLocales(): string[] {
  return Object.keys(locales);
}

// ── Default Export ───────────────────────────────────────────────────────────

export default {
  registerLocale,
  getName,
  translate,
  getAll,
  getOriginalName,
  getCountryCodes,
  getSupportedLocales,
};
