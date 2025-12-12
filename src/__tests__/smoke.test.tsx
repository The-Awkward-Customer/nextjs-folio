import { render, screen } from '@testing-library/react';

// Simple smoke test to verify Jest setup
describe('Jest Setup', () => {
  it('renders a simple component', () => {
    render(<div data-testid="smoke">Hello World</div>);
    expect(screen.getByTestId('smoke')).toHaveTextContent('Hello World');
  });

  it('jest-dom matchers work', () => {
    render(<button disabled>Click me</button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
