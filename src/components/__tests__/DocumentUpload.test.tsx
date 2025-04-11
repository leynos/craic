import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocumentUpload from '../DocumentUpload';

describe('DocumentUpload', () => {
  const mockOnFileUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock FileReader
    (window as any).FileReader = vi.fn().mockImplementation(() => ({
      readAsText: function(file: File) {
        this.onload({ target: { result: 'test content' } });
      },
      onload: null as any,
      onerror: null as any
    }));
  });

  it('renders upload area', () => {
    render(<DocumentUpload onFileUpload={mockOnFileUpload} />);
    expect(screen.getByText(/Click or drag a document here/i)).toBeDefined();
    expect(screen.getByText(/Supported formats/i)).toBeDefined();
  });

  it('handles file input change', async () => {
    const file = new File(['test content'], 'test.md', { type: 'text/markdown' });
    const { container } = render(<DocumentUpload onFileUpload={mockOnFileUpload} />);
    
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeDefined();

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file]
      });

      await fireEvent.change(input);
      
      expect(mockOnFileUpload).toHaveBeenCalledWith('test content', 'test.md');
    }
  });

  it('handles file drop', async () => {
    const file = new File(['test content'], 'test.md', { type: 'text/markdown' });
    const { container } = render(<DocumentUpload onFileUpload={mockOnFileUpload} />);
    
    const dropZone = container.querySelector('.document-upload');
    expect(dropZone).toBeDefined();

    if (dropZone) {
      const dropEvent = createDropEvent([file]);
      await fireEvent.drop(dropZone, dropEvent);
      
      expect(mockOnFileUpload).toHaveBeenCalledWith('test content', 'test.md');
    }
  });
});

// Helper function to create a drop event with files
function createDropEvent(files: File[]) {
  return {
    dataTransfer: {
      files,
      items: files.map(file => ({
        kind: 'file',
        type: file.type,
        getAsFile: () => file
      })),
      types: ['Files']
    }
  };
} 