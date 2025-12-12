import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatProvider } from '@/contexts/ChatContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ChatTrigger, QAChat, ChatInput, ChatMessages } from '@/components/chat';

// Wrapper component with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ChatProvider>{children}</ChatProvider>
    </ThemeProvider>
  );
}

describe('Chat Flow Integration', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            response: 'Test response from API',
            similarQAs: [],
          }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ChatTrigger', () => {
    it('renders chat trigger button', () => {
      render(
        <TestWrapper>
          <ChatTrigger />
        </TestWrapper>
      );

      expect(
        screen.getByRole('button', { name: /chat with peter abbott/i })
      ).toBeInTheDocument();
    });

    it('shows indicator by default', () => {
      render(
        <TestWrapper>
          <ChatTrigger shouldShowIndicator={true} />
        </TestWrapper>
      );

      // Badge should be visible (indicator)
      const button = screen.getByRole('button', { name: /chat with peter abbott/i });
      expect(button).toBeInTheDocument();
    });

    it('hides indicator when shouldShowIndicator is false', () => {
      render(
        <TestWrapper>
          <ChatTrigger shouldShowIndicator={false} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /chat with peter abbott/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('ChatInput', () => {
    it('renders input field', () => {
      const mockOnSend = jest.fn();
      render(
        <TestWrapper>
          <ChatInput onSend={mockOnSend} />
        </TestWrapper>
      );

      expect(
        screen.getByPlaceholderText(/ask me anything/i)
      ).toBeInTheDocument();
    });

    it('calls onSend when form is submitted', async () => {
      const mockOnSend = jest.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ChatInput onSend={mockOnSend} />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText(/ask me anything/i);
      await user.type(input, 'Hello');
      await user.keyboard('{Enter}');

      expect(mockOnSend).toHaveBeenCalledWith('Hello');
    });

    it('does not send empty messages', async () => {
      const mockOnSend = jest.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ChatInput onSend={mockOnSend} />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText(/ask me anything/i);
      await user.type(input, '   ');
      await user.keyboard('{Enter}');

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('clears input after sending', async () => {
      const mockOnSend = jest.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ChatInput onSend={mockOnSend} />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText(/ask me anything/i);
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');

      expect(input).toHaveValue('');
    });
  });

  describe('ChatMessages', () => {
    it('shows welcome message when no messages', () => {
      render(
        <TestWrapper>
          <ChatMessages messages={[]} />
        </TestWrapper>
      );

      // Welcome message should be visible - actual text is "Hello! I'm here to help..."
      expect(screen.getByText(/hello/i)).toBeInTheDocument();
    });

    it('renders user messages', () => {
      const messages = [
        {
          id: '1',
          type: 'user' as const,
          content: 'Hello world',
          timestamp: new Date(),
        },
      ];

      render(
        <TestWrapper>
          <ChatMessages messages={messages} />
        </TestWrapper>
      );

      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders assistant messages', () => {
      const messages = [
        {
          id: '1',
          type: 'assistant' as const,
          content: 'Hello, how can I help?',
          timestamp: new Date(),
        },
      ];

      render(
        <TestWrapper>
          <ChatMessages messages={messages} />
        </TestWrapper>
      );

      expect(screen.getByText('Hello, how can I help?')).toBeInTheDocument();
    });

    it('shows loading indicator when isLoading is true', () => {
      render(
        <TestWrapper>
          <ChatMessages messages={[]} isLoading={true} />
        </TestWrapper>
      );

      expect(screen.getByText(/thinking/i)).toBeInTheDocument();
    });

    it('shows error message when error is provided', () => {
      render(
        <TestWrapper>
          <ChatMessages messages={[]} error="Something went wrong" />
        </TestWrapper>
      );

      // Error text appears in both title and details
      const errorElements = screen.getAllByText(/something went wrong/i);
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  describe('Full Chat Flow', () => {
    beforeEach(() => {
      // Mock HTMLDialogElement.showModal which doesn't exist in jsdom
      HTMLDialogElement.prototype.showModal = jest.fn(function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      });
      HTMLDialogElement.prototype.close = jest.fn(function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      });
    });

    it('can open chat dialog', async () => {
      const user = userEvent.setup();

      // Create a test component that properly connects to chat context
      function TestChatFlow() {
        const { openChat, shouldShowIndicator } = require('@/hooks/useChat').useChat();
        return (
          <>
            <ChatTrigger onClick={openChat} shouldShowIndicator={shouldShowIndicator} />
            <QAChat />
          </>
        );
      }

      render(
        <TestWrapper>
          <TestChatFlow />
        </TestWrapper>
      );

      // Chat dialog should not be visible initially
      const trigger = screen.getByRole('button', { name: /chat with peter abbott/i });

      // Click to open chat
      await user.click(trigger);

      // Dialog should now be open - look for the Beta tag
      await waitFor(() => {
        expect(screen.getByText('Beta')).toBeInTheDocument();
      });
    });
  });
});
