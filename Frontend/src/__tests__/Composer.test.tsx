import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Composer } from '../components/chat/Composer';

describe('Composer', () => {
  it('renders input placeholder properly', () => {
    render(<Composer onSend={vi.fn()} onStop={vi.fn()} isStreaming={false} />);
    expect(
      screen.getByPlaceholderText(/Ask DeepSpring AI anything/i)
    ).toBeInTheDocument();
  });

  it('triggers onSend when clicking the send button with non-empty prompt', () => {
    const handleSend = vi.fn();
    render(<Composer onSend={handleSend} onStop={vi.fn()} isStreaming={false} />);

    const input = screen.getByPlaceholderText(/Ask DeepSpring AI anything/i);
    fireEvent.change(input, { target: { value: 'Hello DeepSpring AI' } });

    const sendBtn = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendBtn);

    expect(handleSend).toHaveBeenCalledWith('Hello DeepSpring AI');
  });

  it('does not send empty or whitespace prompts', () => {
    const handleSend = vi.fn();
    render(<Composer onSend={handleSend} onStop={vi.fn()} isStreaming={false} />);

    const sendBtn = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendBtn);

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('displays Stop button during streaming', () => {
    const handleStop = vi.fn();
    render(<Composer onSend={vi.fn()} onStop={handleStop} isStreaming={true} />);

    const stopBtn = screen.getByRole('button', { name: /stop generation/i });
    expect(stopBtn).toBeInTheDocument();

    fireEvent.click(stopBtn);
    expect(handleStop).toHaveBeenCalled();
  });
});
