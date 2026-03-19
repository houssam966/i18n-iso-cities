import { describe, it, expect, beforeAll } from 'vitest';
import cities from '../src/index';
import type { LocaleData } from '../src/index';
import en from '../langs/en.json';
import ar from '../langs/ar.json';

beforeAll(() => {
  cities.registerLocale(en as LocaleData);
  cities.registerLocale(ar as LocaleData);
});

describe('registerLocale', () => {
  it('registers supported locales', () => {
    const locales = cities.getSupportedLocales();
    expect(locales).toContain('en');
    expect(locales).toContain('ar');
  });

  it('ignores invalid data', () => {
    const before = cities.getSupportedLocales().length;
    cities.registerLocale(null as any);
    cities.registerLocale({} as any);
    expect(cities.getSupportedLocales().length).toBe(before);
  });
});

describe('getName', () => {
  it('returns Arabic translation for SA city', () => {
    expect(cities.getName('SA', 'Riyadh', 'ar')).toBe('الرياض');
    expect(cities.getName('SA', 'Jeddah', 'ar')).toBe('جدة');
    expect(cities.getName('SA', 'Mecca', 'ar')).toBe('مكة المكرمة');
  });

  it('returns English name for EN locale', () => {
    expect(cities.getName('SA', 'Riyadh', 'en')).toBe('Riyadh');
  });

  it('handles case-insensitive country codes', () => {
    expect(cities.getName('sa', 'Riyadh', 'ar')).toBe('الرياض');
    expect(cities.getName('Sa', 'Riyadh', 'ar')).toBe('الرياض');
  });

  it('returns undefined for unknown city', () => {
    expect(cities.getName('SA', 'Atlantis', 'ar')).toBeUndefined();
  });

  it('returns undefined for unknown country', () => {
    expect(cities.getName('XX', 'Riyadh', 'ar')).toBeUndefined();
  });

  it('returns undefined for unknown locale', () => {
    expect(cities.getName('SA', 'Riyadh', 'zh')).toBeUndefined();
  });

  it('translates AE cities', () => {
    expect(cities.getName('AE', 'Dubai', 'ar')).toBe('دبي');
    expect(cities.getName('AE', 'Abu Dhabi', 'ar')).toBe('أبوظبي');
  });

  it('translates PS cities', () => {
    expect(cities.getName('PS', 'Jerusalem', 'ar')).toBe('القدس');
    expect(cities.getName('PS', 'Gaza', 'ar')).toBe('غزة');
  });

  it('translates EG cities', () => {
    expect(cities.getName('EG', 'Cairo', 'ar')).toBe('القاهرة');
  });
});

describe('translate', () => {
  it('translates without country code', () => {
    expect(cities.translate('Riyadh', 'ar')).toBe('الرياض');
    expect(cities.translate('Dubai', 'ar')).toBe('دبي');
    expect(cities.translate('London', 'ar')).toBe('لندن');
  });

  it('is case-insensitive', () => {
    expect(cities.translate('riyadh', 'ar')).toBe('الرياض');
    expect(cities.translate('DUBAI', 'ar')).toBe('دبي');
    expect(cities.translate('london', 'ar')).toBe('لندن');
  });

  it('returns undefined for unknown city', () => {
    expect(cities.translate('Atlantis', 'ar')).toBeUndefined();
  });

  it('returns undefined for empty input', () => {
    expect(cities.translate('', 'ar')).toBeUndefined();
  });
});

describe('getAll', () => {
  it('returns all cities for a country', () => {
    const qaCities = cities.getAll('QA', 'ar');
    expect(qaCities.length).toBeGreaterThan(0);
    expect(qaCities.find(c => c.name === 'Doha')?.translation).toBe('الدوحة');
  });

  it('returns sorted results', () => {
    const saCities = cities.getAll('SA', 'ar');
    const names = saCities.map(c => c.name);
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  it('returns empty array for unknown country', () => {
    expect(cities.getAll('XX', 'ar')).toEqual([]);
  });
});

describe('getOriginalName', () => {
  it('reverse-looks up Arabic to English', () => {
    const result = cities.getOriginalName('الرياض', 'ar');
    expect(result).toEqual({ countryCode: 'SA', name: 'Riyadh' });
  });

  it('reverse-looks up Gulf cities', () => {
    const result = cities.getOriginalName('دبي', 'ar');
    expect(result).toEqual({ countryCode: 'AE', name: 'Dubai' });
  });

  it('returns undefined for unknown translation', () => {
    expect(cities.getOriginalName('أطلانتس', 'ar')).toBeUndefined();
  });

  it('returns undefined for empty input', () => {
    expect(cities.getOriginalName('', 'ar')).toBeUndefined();
  });
});

describe('getCountryCodes', () => {
  it('returns all country codes with data', () => {
    const codes = cities.getCountryCodes('ar');
    expect(codes).toContain('SA');
    expect(codes).toContain('AE');
    expect(codes).toContain('EG');
    expect(codes).toContain('US');
    expect(codes).toContain('GB');
  });
});

describe('data integrity', () => {
  it('en and ar have the same country codes', () => {
    const enCodes = cities.getCountryCodes('en').sort();
    const arCodes = cities.getCountryCodes('ar').sort();
    expect(enCodes).toEqual(arCodes);
  });

  it('en and ar have the same cities per country', () => {
    const countryCodes = cities.getCountryCodes('en');
    for (const code of countryCodes) {
      const enCityNames = cities.getAll(code, 'en').map(c => c.name).sort();
      const arCityNames = cities.getAll(code, 'ar').map(c => c.name).sort();
      expect(arCityNames, `Mismatch for ${code}`).toEqual(enCityNames);
    }
  });

  it('all Arabic translations are non-empty strings', () => {
    const countryCodes = cities.getCountryCodes('ar');
    for (const code of countryCodes) {
      const allCities = cities.getAll(code, 'ar');
      for (const city of allCities) {
        expect(city.translation, `Empty translation for ${code}/${city.name}`).toBeTruthy();
        expect(typeof city.translation).toBe('string');
      }
    }
  });
});
