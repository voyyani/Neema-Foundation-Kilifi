import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock framer-motion to avoid animation-related test issues
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: new Proxy(actual.motion, {
      get: (_target, prop) => {
        // Return a simple forwardRef component for any HTML element
        if (typeof prop === 'string') {
          return ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => {
            // Filter out motion-specific props
            const filtered = Object.fromEntries(
              Object.entries(props).filter(
                ([key]) =>
                  !['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'whileInView', 'layout'].includes(key),
              ),
            );
            const Tag = prop as keyof JSX.IntrinsicElements;
            return <Tag {...(filtered as Record<string, unknown>)}>{children}</Tag>;
          };
        }
        return undefined;
      },
    }),
    useReducedMotion: () => false,
  };
});

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    MODE: 'test',
    DEV: true,
    PROD: false,
  },
});
