# i18n-iso-cities

Multilingual city name translations organized by ISO 3166-1 alpha-2 country codes.  
Modeled after [i18n-iso-countries](https://www.npmjs.com/package/i18n-iso-countries) — register only the locales you need for tree-shaking.

## Installation

```bash
npm install i18n-iso-cities
```

## Usage

```js
import cities from 'i18n-iso-cities';

// Import only the locales you need (tree-shakeable)
import en from 'i18n-iso-cities/langs/en.json';
import ar from 'i18n-iso-cities/langs/ar.json';

cities.registerLocale(en);
cities.registerLocale(ar);
```

### Translate a city name (with country code)

```js
cities.getName('SA', 'Riyadh', 'ar');   // 'الرياض'
cities.getName('AE', 'Dubai', 'ar');     // 'دبي'
cities.getName('EG', 'Cairo', 'ar');     // 'القاهرة'
cities.getName('US', 'New York', 'ar');  // 'نيويورك'
```

### Translate without country code (convenience)

Useful when you get city names from APIs (e.g. Instagram demographics) without country codes.

```js
cities.translate('Riyadh', 'ar');  // 'الرياض'
cities.translate('london', 'ar');  // 'لندن'  (case-insensitive)
```

### Get all cities for a country

```js
cities.getAll('QA', 'ar');
// [
//   { name: 'Al Daayen', translation: 'الضعاين' },
//   { name: 'Al Khor', translation: 'الخور' },
//   { name: 'Al Rayyan', translation: 'الريان' },
//   { name: 'Al Shamal', translation: 'الشمال' },
//   { name: 'Al Wakrah', translation: 'الوكرة' },
//   { name: 'Doha', translation: 'الدوحة' },
//   ...
// ]
```

### Reverse lookup (translated → original)

```js
cities.getOriginalName('الرياض', 'ar');
// { countryCode: 'SA', name: 'Riyadh' }
```

### Utility methods

```js
cities.getCountryCodes('ar');      // ['SA', 'AE', 'KW', 'QA', ...]
cities.getSupportedLocales();      // ['en', 'ar']
```

## Supported Locales

| Locale | Language |
|--------|----------|
| `en`   | English  |
| `ar`   | Arabic   |

## Covered Countries

### Arab World (comprehensive coverage)
🇸🇦 Saudi Arabia (70+ cities) · 🇦🇪 UAE · 🇰🇼 Kuwait · 🇶🇦 Qatar · 🇧🇭 Bahrain · 🇴🇲 Oman  
🇵🇸 Palestine · 🇯🇴 Jordan · 🇪🇬 Egypt · 🇱🇧 Lebanon · 🇮🇶 Iraq · 🇱🇾 Libya  
🇸🇩 Sudan · 🇲🇦 Morocco · 🇹🇳 Tunisia · 🇩🇿 Algeria · 🇸🇾 Syria · 🇾🇪 Yemen

### Major World Cities
🇬🇧 United Kingdom · 🇺🇸 United States · 🇫🇷 France · 🇩🇪 Germany · 🇹🇷 Turkey · 🇮🇳 India · 🇵🇰 Pakistan

## Contributing

### Adding a new locale

1. Create `langs/<locale>.json` following the existing format:

```json
{
  "locale": "fr",
  "cities": {
    "SA": {
      "Riyadh": "Riyad",
      "Jeddah": "Djeddah"
    }
  }
}
```

2. The keys must match the English city names in `langs/en.json`.
3. Submit a pull request.

### Adding cities

1. Add the city to **all** locale files (`en.json`, `ar.json`, etc.).
2. Keep cities alphabetically sorted within each country.
3. Run `npm test` to verify data integrity.

## API Reference

### `registerLocale(data: LocaleData): void`
Register a locale. Must be called before using other methods.

### `getName(countryCode: string, cityName: string, locale: string): string | undefined`
Get translated city name by country code and English name.

### `translate(cityName: string, locale: string): string | undefined`
Translate a city name without specifying country code (case-insensitive, first match).

### `getAll(countryCode: string, locale: string): CityEntry[]`
Get all cities for a country, sorted by English name.

### `getOriginalName(translatedName: string, locale: string): CityLookup | undefined`
Reverse lookup: translated name → `{ countryCode, name }`.

### `getCountryCodes(locale: string): string[]`
Get all country codes that have data for a locale.

### `getSupportedLocales(): string[]`
Get all registered locale codes.

## License

MIT © [houssam966](https://github.com/houssam966)
