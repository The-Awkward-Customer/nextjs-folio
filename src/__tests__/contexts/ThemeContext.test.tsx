import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme, type Theme } from '@/contexts/ThemeContext';

// Test component that uses the hook
function TestComponent() {
  const { theme, setTheme, toggleTheme, prefersReducedMotion } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="motion">{prefersReducedMotion ? 'reduced' : 'normal'}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('high-contrast')}>Set High Contrast</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme');
  });

  it('provides default theme value', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Default should be light (or system preference, but matchMedia is mocked to return false)
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('allows setting theme to dark', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('allows setting theme to high-contrast', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set High Contrast'));
    expect(screen.getByTestId('theme')).toHaveTextContent('high-contrast');
  });

  it('toggles through all themes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Start at light
    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    // Toggle to dark
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    // Toggle to high-contrast
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('theme')).toHaveTextContent('high-contrast');

    // Toggle back to light
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('persists theme to localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set Dark'));
    expect(localStorage.getItem('theme-preference')).toBe('dark');
  });

  it('updates data-theme attribute on document', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set Dark'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('throws error when useTheme is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });

  it('loads stored theme from localStorage on mount', () => {
    // Set a stored preference before mounting
    localStorage.setItem('theme-preference', 'high-contrast');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should load the stored preference
    expect(screen.getByTestId('theme')).toHaveTextContent('high-contrast');
  });
});
