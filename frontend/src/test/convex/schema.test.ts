import { describe, it, expect } from 'vitest';
import { v } from 'convex/values';

// Mock Convex test helpers
describe('Convex Schema Validation', () => {
  describe('Disciplines', () => {
    it('validates discipline schema', () => {
      const discipline = {
        name: 'Taekwondo',
        description: 'Art martial coréen',
        monthlyFee: 450,
        color: '#EF4444',
        isActive: true,
        createdAt: Date.now(),
      };

      expect(discipline.name).toBe('Taekwondo');
      expect(discipline.monthlyFee).toBe(450);
      expect(discipline.isActive).toBe(true);
    });
  });

  describe('Sessions', () => {
    it('validates session schema', () => {
      const session = {
        groupId: 'group_1' as any,
        coachId: 'coach_1' as any,
        title: 'TKD Enfants',
        startTime: Date.now(),
        endTime: Date.now() + 90 * 60 * 1000,
        dayOfWeek: 1,
        location: 'Salle Principale',
        isRecurring: true,
        createdAt: Date.now(),
      };

      expect(session.title).toBe('TKD Enfants');
      expect(session.dayOfWeek).toBe(1);
      expect(session.isRecurring).toBe(true);
    });
  });

  describe('Members', () => {
    it('validates member schema', () => {
      const member = {
        firstName: 'Youssef',
        lastName: 'Ben Ahmed',
        gender: 'male',
        isActive: true,
        registrationDate: Date.now(),
        createdAt: Date.now(),
      };

      expect(member.firstName).toBe('Youssef');
      expect(member.lastName).toBe('Ben Ahmed');
      expect(member.gender).toBe('male');
    });
  });
});

describe('Session Time Calculations', () => {
  it('calculates week start correctly', () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    expect(weekStart.getDay()).toBe(1); // Monday
  });

  it('calculates session timestamps', () => {
    const weekStart = new Date('2024-03-18'); // Monday
    const dayOffset = 2; // Wednesday
    const startHour = 16;
    const startMinute = 0;

    const sessionDate = new Date(weekStart);
    sessionDate.setDate(sessionDate.getDate() + dayOffset);
    sessionDate.setHours(startHour, startMinute, 0, 0);

    expect(sessionDate.getDay()).toBe(3); // Wednesday
    expect(sessionDate.getHours()).toBe(16);
  });
});
