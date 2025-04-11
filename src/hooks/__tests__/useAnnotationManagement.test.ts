/// <reference types="@types/jest" />
import { renderHook, act } from '@testing-library/react';
import { useAnnotationManagement } from '../useAnnotationManagement';
import type { Document } from '../useDocumentManagement';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useAnnotationManagement', () => {
  const mockSetDocuments = vi.fn();
  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'test.md',
      content: 'test content',
      annotationSets: [
        {
          id: 'set1',
          name: 'Annotation Set 1',
          annotations: [{ id: 'anno1', text: 'test annotation' }]
        }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty annotation sets when no document is selected', () => {
    const { result } = renderHook(() => 
      useAnnotationManagement(mockDocuments, null, mockSetDocuments)
    );

    expect(result.current.annotationSets).toEqual([]);
    expect(result.current.selectedSetId).toBeNull();
    expect(result.current.currentAnnotations).toEqual([]);
  });

  it('should load annotation sets when a document is selected', () => {
    const { result } = renderHook(() => 
      useAnnotationManagement(mockDocuments, '1', mockSetDocuments)
    );

    expect(result.current.annotationSets).toEqual(mockDocuments[0].annotationSets);
  });

  it('should handle adding a new annotation set', () => {
    const { result } = renderHook(() => 
      useAnnotationManagement(mockDocuments, '1', mockSetDocuments)
    );

    act(() => {
      result.current.handleAddAnnotationSet();
    });

    expect(mockSetDocuments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          annotationSets: expect.arrayContaining([
            expect.objectContaining({
              name: 'Annotation Set 2'
            })
          ])
        })
      ])
    );
    expect(result.current.selectedSetId).not.toBeNull();
  });

  it('should handle removing an annotation set', () => {
    const { result } = renderHook(() => 
      useAnnotationManagement(mockDocuments, '1', mockSetDocuments)
    );

    act(() => {
      result.current.handleRemoveAnnotationSet('set1');
    });

    expect(mockSetDocuments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          annotationSets: []
        })
      ])
    );
    expect(result.current.selectedSetId).toBeNull();
  });

  it('should handle creating a new annotation', () => {
    const { result } = renderHook(() => 
      useAnnotationManagement(mockDocuments, '1', mockSetDocuments)
    );

    act(() => {
      result.current.setSelectedSetId('set1');
    });

    act(() => {
      result.current.handleAnnotationCreate({ id: 'anno2', text: 'new annotation' });
    });

    expect(mockSetDocuments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          annotationSets: expect.arrayContaining([
            expect.objectContaining({
              id: 'set1',
              annotations: expect.arrayContaining([
                { id: 'anno1', text: 'test annotation' },
                { id: 'anno2', text: 'new annotation' }
              ])
            })
          ])
        })
      ])
    );
  });

  it('should handle null documents gracefully', () => {
    const { result } = renderHook(() => 
      useAnnotationManagement(null, '1', mockSetDocuments)
    );

    expect(result.current.annotationSets).toEqual([]);
    expect(result.current.currentAnnotations).toEqual([]);
  });
}); 