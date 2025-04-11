import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarkdownAnnotator from '../MarkdownAnnotator';

// Mock ReactMarkdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>
}));

// Create a mock instance that we can control
const mockDestroy = vi.fn();
const mockSetAnnotations = vi.fn();
const mockOn = vi.fn();
let mockRecogitoInstance: any;

// Mock the Recogito class
vi.mock('@recogito/recogito-js', () => ({
  Recogito: vi.fn().mockImplementation(() => {
    mockRecogitoInstance = {
      destroy: mockDestroy,
      setAnnotations: mockSetAnnotations,
      on: mockOn
    };
    return mockRecogitoInstance;
  })
}));

// Mock CSS import
vi.mock('@recogito/recogito-js/dist/recogito.min.css', () => ({}));

describe('MarkdownAnnotator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders markdown content', () => {
    render(
      <MarkdownAnnotator 
        content="Test content" 
        annotations={[]} 
      />
    );
    expect(screen.getByTestId('markdown')).toHaveTextContent('Test content');
  });

  it('initializes Recogito with correct props', () => {
    const annotations = [
      {
        speaker: 'Test Speaker',
        mark: ['0', '10']
      }
    ];

    render(
      <MarkdownAnnotator 
        content="Test content" 
        annotations={annotations}
        onAnnotationCreate={() => {}}
      />
    );

    // Check if Recogito was initialized
    expect(mockSetAnnotations).toHaveBeenCalled();
    expect(mockOn).toHaveBeenCalledWith('createAnnotation', expect.any(Function));
  });

  it('cleans up Recogito on unmount', () => {
    const { unmount } = render(
      <MarkdownAnnotator 
        content="Test content" 
        annotations={[]} 
      />
    );

    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });
}); 