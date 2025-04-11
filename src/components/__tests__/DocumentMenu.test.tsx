import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DocumentMenu from '../DocumentMenu';

describe('DocumentMenu', () => {
  const mockAnnotationSets = [
    {
      id: 'set-1',
      name: 'Annotation Set 1',
      annotations: []
    },
    {
      id: 'set-2',
      name: 'Annotation Set 2',
      annotations: []
    }
  ];

  const mockProps = {
    annotationSets: mockAnnotationSets,
    selectedSetId: null,
    onAddSet: vi.fn(),
    onRemoveSet: vi.fn(),
    onSelectSet: vi.fn()
  };

  it('renders annotation sets dropdown', () => {
    render(<DocumentMenu {...mockProps} />);
    expect(screen.getByText('Select an annotation set')).toBeDefined();
    expect(screen.getByText('Annotation Set 1')).toBeDefined();
    expect(screen.getByText('Annotation Set 2')).toBeDefined();
  });

  it('calls onSelectSet when selecting an annotation set', () => {
    render(<DocumentMenu {...mockProps} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'set-1' } });
    expect(mockProps.onSelectSet).toHaveBeenCalledWith('set-1');
  });

  it('calls onAddSet when clicking add button', () => {
    render(<DocumentMenu {...mockProps} />);
    fireEvent.click(screen.getByText('Add Set'));
    expect(mockProps.onAddSet).toHaveBeenCalled();
  });

  it('shows remove button only when a set is selected', () => {
    const { rerender } = render(<DocumentMenu {...mockProps} />);
    expect(screen.queryByText('Remove Set')).toBeNull();

    rerender(<DocumentMenu {...mockProps} selectedSetId="set-1" />);
    expect(screen.getByText('Remove Set')).toBeDefined();
  });

  it('calls onRemoveSet when clicking remove button', () => {
    render(<DocumentMenu {...mockProps} selectedSetId="set-1" />);
    fireEvent.click(screen.getByText('Remove Set'));
    expect(mockProps.onRemoveSet).toHaveBeenCalledWith('set-1');
  });
}); 