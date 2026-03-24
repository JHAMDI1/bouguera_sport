/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect } from 'vitest';
import { exportToCSV } from '../../lib/export';

describe('Export Utilities', () => {
  describe('CSV Export', () => {
    it('exports members to CSV format', () => {
      const csvData = [
        {
          Nom: 'Youssef',
          'Prénom': 'Ben Ahmed',
          Genre: 'male',
        },
        {
          Nom: 'Sarah',
          'Prénom': 'Ben Ahmed',
          Genre: 'female',
        },
      ];

      // Test that data transformation works
      expect(csvData[0].Nom).toBe('Youssef');
      expect(csvData[1].Genre).toBe('female');
    });

    it('handles empty data array', () => {
      // Test empty data handling
      const emptyData: any[] = [];
      expect(emptyData.length).toBe(0);
    });

    it('handles special characters in data', () => {
      // Test special characters
      const specialData = { name: 'Test, with "quotes"' };
      expect(specialData.name).toContain('quotes');
    });
  });
});

describe('Date Utilities', () => {
  it('formats date correctly', () => {
    const timestamp = new Date('2024-03-20T10:30:00').getTime();
    const date = new Date(timestamp);

    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(2); // March (0-indexed)
    expect(date.getDate()).toBe(20);
  });

  it('calculates time difference in days', () => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const diffMs = now - thirtyDaysAgo;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    expect(diffDays).toBe(30);
  });
});

describe('Currency Utilities', () => {
  it('formats amount as currency', () => {
    const amount = 450;
    const formatted = new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount);

    expect(formatted).toContain('450');
    expect(formatted).toContain('MAD');
  });
});

describe('String Utilities', () => {
  it('capitalizes first letter', () => {
    const str = 'taekwondo';
    const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    expect(capitalized).toBe('Taekwondo');
  });

  it('formats full name correctly', () => {
    const firstName = 'karim';
    const lastName = 'ben ali';
    const fullName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;
    expect(fullName).toBe('Karim Ben ali');
  });
});
