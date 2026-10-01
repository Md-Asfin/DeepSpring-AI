import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThinkingSection } from '../components/chat/ThinkingSection';

describe('ThinkingSection', () => {
  it('renders nothing when thinking text is empty', () => {
    const { container } = render(<ThinkingSection thinking="" isStreaming={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders thinking content and toggle accordion', () => {
    render(<ThinkingSection thinking="Step 1: Parse input\nStep 2: Calculate" isStreaming={false} />);

    expect(screen.getByText(/DeepSeek Reasoning Process/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1: Parse input/i)).toBeInTheDocument();

    // Toggle collapse
    const toggleBtn = screen.getByRole('button', { name: /DeepSeek Reasoning Process/i });
    fireEvent.click(toggleBtn);

    expect(screen.queryByText(/Step 1: Parse input/i)).not.toBeInTheDocument();
  });
});
