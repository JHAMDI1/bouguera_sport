import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Mock Convex client
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useConvex: vi.fn(),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({ user: null, isLoaded: true })),
  useAuth: vi.fn(() => ({ isSignedIn: false, isLoaded: true })),
  SignIn: vi.fn(() => null),
  SignUp: vi.fn(() => null),
  UserButton: vi.fn(() => null),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock Toast
vi.mock('@/components/Toast', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  })),
  useToastHelpers: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  })),
  ToastProvider: vi.fn(({ children }) => children),
}));

// Mock ConfirmModal
vi.mock('@/components/ConfirmModal', () => ({
  useConfirmModal: vi.fn(() => ({
    confirm: vi.fn(() => Promise.resolve(true)),
    modalProps: {},
  })),
  ConfirmModalProvider: vi.fn(({ children }) => children),
  ConfirmModal: vi.fn(() => null),
}));
