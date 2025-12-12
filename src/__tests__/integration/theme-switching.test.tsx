import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

// Test component to access theme context
function ThemeTestComponent() {
  const { theme, setTheme, systemPreference, prefersReducedMotion } = useTheme();

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="system-preference">{systemPreference}</span>
      <span data-testid="reduced-motion">{String(prefersReducedMotion)}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('high-contrast')}>Set High Contrast</button>
    </div>
  );
}

describe('Theme Switching Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Theme Context', () => {
    it('provides default theme', () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const themeValue = screen.getByTestId('current-theme').textContent;
      expect(['light', 'dark']).toContain(themeValue);
    });

    it('can switch to light theme', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await user.click(screen.getByText('Set Light'));

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('can switch to dark theme', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await user.click(screen.getByText('Set Dark'));

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('can switch to high-contrast theme', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await user.click(screen.getByText('Set High Contrast'));

      expect(screen.getByTestId('current-theme')).toHaveTextContent('high-contrast');
    });

    it('persists theme to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await user.click(screen.getByText('Set Dark'));

      expect(localStorage.getItem('theme-preference')).toBe('dark');
    });

    it('loads theme from localStorage on mount', () => {
      localStorage.setItem('theme-preference', 'high-contrast');

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('high-contrast');
    });

    it('updates document data-theme attribute', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await user.click(screen.getByText('Set Dark'));

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Theme Cycling', () => {
    it('can cycle through all themes', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      // Set light
      await user.click(screen.getByText('Set Light'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Set dark
      await user.click(screen.getByText('Set Dark'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      // Set high-contrast
      await user.click(screen.getByText('Set High Contrast'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('high-contrast');

      // Set back to light
      await user.click(screen.getByText('Set Light'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
  });

  describe('Reduced Motion', () => {
    it('detects reduced motion preference', () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      // The mock in jest.setup.ts sets this to false by default
      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
    });
  });
});
