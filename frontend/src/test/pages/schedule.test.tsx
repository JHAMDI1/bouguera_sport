import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SchedulePage from '../../app/schedule/page';
import * as convexReact from 'convex/react';

// Mock data
const mockSessions = [
  {
    _id: 'session_1',
    title: 'TKD Enfants',
    groupName: 'Taekwondo - Enfants',
    coachName: 'Karim Ben Ali',
    disciplineName: 'Taekwondo',
    color: '#EF4444',
    startTime: Date.now() + 24 * 60 * 60 * 1000,
    endTime: Date.now() + 25 * 60 * 60 * 1000,
    dayOfWeek: 1,
    location: 'Salle Principale',
  },
];

const mockGroups = [
  { _id: 'group_1', name: 'Taekwondo - Enfants 6-10 ans' },
  { _id: 'group_2', name: 'Kung Fu - Adultes' },
];

const mockCoaches = [
  { _id: 'coach_1', fullName: 'Karim Ben Ali' },
  { _id: 'coach_2', fullName: 'Li Wei Chen' },
];

describe('Schedule Page', () => {
  beforeEach(() => {
    // Mock useQuery to return data sequentially
    let callCount = 0;
    vi.mocked(convexReact.useQuery).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockSessions;
      if (callCount === 2) return mockGroups;
      if (callCount === 3) return mockCoaches;
      return null;
    });

    const mockMutation = vi.fn();
    (mockMutation as any).withOptimisticUpdate = vi.fn(() => mockMutation);
    vi.mocked(convexReact.useMutation).mockReturnValue(mockMutation as any);
  });

  it('renders schedule page with title', () => {
    render(<SchedulePage />);
    expect(screen.getByText('Planning des Cours')).toBeInTheDocument();
  });

  it('displays add session button', () => {
    render(<SchedulePage />);
    expect(screen.getByText(/nouvelle séance/i)).toBeInTheDocument();
  });
});
