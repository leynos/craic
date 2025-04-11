/// <reference types="@types/jest" />
import { renderHook, act } from '@testing-library/react';
import { useDocumentManagement } from '../useDocumentManagement';
import { useLocalStorage } from 'react-storage-complete';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react-storage-complete
const mockUseLocalStorage = vi.fn();
vi.mock('react-storage-complete', () => ({
  useLocalStorage: () => mockUseLocalStorage()
}));

describe('useDocumentManagement', () => {
  const mockSetDocuments = vi.fn();
  const mockDocuments: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocalStorage.mockReturnValue([mockDocuments, mockSetDocuments]);
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

    expect(mockSetDocuments).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'test.md',
        content: 'test content',
        annotationSets: []
      })
    ]);
    expect(result.current.selectedDocId).not.toBeNull();
  });

  it('should update current document when selection changes', () => {
    const mockDoc = {
      id: '1',
      name: 'test.md',
      content: 'test content',
      annotationSets: []
    };

    mockUseLocalStorage.mockReturnValue([[mockDoc], mockSetDocuments]);

    const { result } = renderHook(() => useDocumentManagement());

    act(() => {
      result.current.setSelectedDocId('1');
    });

    expect(result.current.currentDocument).toEqual(mockDoc);
    expect(result.current.currentContent).toBe('test content');
  });

  it('should handle null documents gracefully', () => {
    mockUseLocalStorage.mockReturnValue([null, mockSetDocuments]);

    const { result } = renderHook(() => useDocumentManagement());

    expect(result.current.currentContent).toBe('');
    expect(result.current.documents).toBeNull();
  });
}); 