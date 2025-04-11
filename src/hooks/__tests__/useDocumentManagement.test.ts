/// <reference types="@types/jest" />
import { renderHook, act } from '@testing-library/react';
import { useDocumentManagement } from '../useDocumentManagement';
import useLocalStorageState from 'use-local-storage-state';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock use-local-storage-state
const mockSetDocuments = vi.fn();
let mockDocuments: any[] | null = [];

vi.mock('use-local-storage-state', () => ({
  default: vi.fn().mockImplementation(() => {
    return [mockDocuments, mockSetDocuments, { isPersistent: true, removeItem: () => {} }];
  })
}));

describe('useDocumentManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDocuments = [];
  });

  it('should initialize with empty documents and no selected document', () => {
    const { result } = renderHook(() => useDocumentManagement());

    expect(result.current.documents).toEqual([]);
    expect(result.current.selectedDocId).toBeNull();
    expect(result.current.currentContent).toBe('');
  });

  it('should handle file upload correctly', () => {
    const { result } = renderHook(() => useDocumentManagement());

    act(() => {
      result.current.handleFileUpload('test content', 'test.md');
    });

    expect(mockSetDocuments).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        name: 'test.md',
        content: 'test content',
        annotationSets: []
      })
    ]));
    expect(result.current.selectedDocId).not.toBeNull();
  });

  it('should update current document when selection changes', () => {
    const mockDoc = {
      id: '1',
      name: 'test.md',
      content: 'test content',
      annotationSets: []
    };
    mockDocuments = [mockDoc];

    const { result } = renderHook(() => useDocumentManagement());

    act(() => {
      result.current.setSelectedDocId('1');
    });

    expect(result.current.currentDocument).toEqual(mockDoc);
    expect(result.current.currentContent).toBe('test content');
  });

  it('should handle null documents gracefully', () => {
    mockDocuments = null;

    const { result } = renderHook(() => useDocumentManagement());

    expect(result.current.currentContent).toBe('');
    expect(result.current.documents).toBeNull();
  });
}); 