import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'bun:test';
import { useAnnotationManagement } from '../useAnnotationManagement';
import type { AnnotationSet } from '../../types';
import { resetLocalStorageMock } from '../../test/module-mocks';

// The mock is defined in src/test/module-mocks.ts and preloaded

describe('useAnnotationManagement', () => {
	beforeEach(() => {
		// Reset the mock's internal state before each test
		resetLocalStorageMock();
	});

	it('should initialize with no sets for a given document ID', () => {
		const { result } = renderHook(() => useAnnotationManagement('doc1'));
		expect(result.current.annotationSets).toEqual([]);
		expect(result.current.selectedAnnotationSet).toBeNull();
		expect(result.current.selectedSetId).toBeNull();
	});

	it('should return empty sets if no document ID is provided', () => {
		const { result } = renderHook(() => useAnnotationManagement(null));
		expect(result.current.annotationSets).toEqual([]);
	});

	it('should add a new annotation set for the current document and select it', () => {
		const { result } = renderHook(() => useAnnotationManagement('doc1'));

		act(() => {
			result.current.addAnnotationSet('Set 1');
		});

		expect(result.current.annotationSets).toHaveLength(1);
		const set = result.current.annotationSets[0] as AnnotationSet;
		expect(set.name).toBe('Set 1');
		expect(set.documentId).toBe('doc1');
		expect(set.id).toBeDefined();
		// Check if selected
		expect(result.current.selectedSetId).toBe(set.id);
		expect(result.current.selectedAnnotationSet).toEqual(set);
	});

	it('should not add a set if no document ID is provided', () => {
		const { result } = renderHook(() => useAnnotationManagement(null));

		act(() => {
			result.current.addAnnotationSet('Set 1');
		});

		expect(result.current.annotationSets).toHaveLength(0);
	});

	it('should only return sets for the current document', () => {
		// Initial hook for doc1
		const { result: resultDoc1 } = renderHook(() =>
			useAnnotationManagement('doc1')
		);
		// Initial hook for doc2 (to add sets globally)
		const { result: resultDoc2 } = renderHook(() =>
			useAnnotationManagement('doc2')
		);

		// Add sets using respective hooks
		act(() => {
			resultDoc1.current.addAnnotationSet('Doc1 Set1');
			resultDoc2.current.addAnnotationSet('Doc2 Set1');
			resultDoc1.current.addAnnotationSet('Doc1 Set2');
		});

		// Check sets for doc1
		expect(resultDoc1.current.annotationSets).toHaveLength(2);
		expect(resultDoc1.current.annotationSets.map((s: AnnotationSet) => s.name)).toEqual([
			'Doc1 Set1',
			'Doc1 Set2',
		]);

		// Check sets for doc2 (re-render might be needed if state isn't shared instantly)
		// Re-rendering doc2 hook instance to ensure it sees the latest global state
		const { result: resultDoc2Again } = renderHook(() =>
			useAnnotationManagement('doc2')
		);
		expect(resultDoc2Again.current.annotationSets).toHaveLength(1);
		expect(resultDoc2Again.current.annotationSets[0].name).toBe('Doc2 Set1');
	});

	it('should select an annotation set', () => {
		const { result } = renderHook(() => useAnnotationManagement('doc1'));
		let setId = '';

		act(() => {
			result.current.addAnnotationSet('Set To Select');
		});

		setId = (result.current.annotationSets[0] as AnnotationSet).id;

		act(() => {
			result.current.selectAnnotationSet(setId);
		});

		expect(result.current.selectedSetId).toBe(setId);
		expect(result.current.selectedAnnotationSet?.id).toBe(setId);
	});

	it('should remove an annotation set and deselect if selected', () => {
		const { result } = renderHook(() => useAnnotationManagement('doc1'));
		let set1Id = '';
		let set2Id = '';

		act(() => {
			result.current.addAnnotationSet('Set 1');
			result.current.addAnnotationSet('Set 2');
		});

		set1Id = (result.current.annotationSets[0] as AnnotationSet).id;
		set2Id = (result.current.annotationSets[1] as AnnotationSet).id;

		// Select Set 1
		act(() => {
			result.current.selectAnnotationSet(set1Id);
		});
		expect(result.current.selectedSetId).toBe(set1Id);

		// Remove Set 1
		act(() => {
			result.current.removeAnnotationSet(set1Id);
		});

		expect(result.current.annotationSets).toHaveLength(1);
		expect((result.current.annotationSets[0] as AnnotationSet).id).toBe(set2Id);
		// Check deselected
		expect(result.current.selectedSetId).toBeNull();
		expect(result.current.selectedAnnotationSet).toBeNull();
	});

	it('should reset selection when documentId changes', () => {
		const initialProps = { docId: 'doc1' };
		const { result, rerender } = renderHook(({ docId }) => useAnnotationManagement(docId), {
			initialProps,
		});
		let setId = '';

		// Add and select a set for doc1
		act(() => {
			result.current.addAnnotationSet('Set For Doc1');
		});
		setId = (result.current.annotationSets[0] as AnnotationSet).id;
		act(() => {
			result.current.selectAnnotationSet(setId);
		});
		expect(result.current.selectedSetId).toBe(setId);

		// Rerender with a new documentId
		rerender({ docId: 'doc2' });

		// Selection should be reset
		expect(result.current.selectedSetId).toBeNull();
		expect(result.current.selectedAnnotationSet).toBeNull();
		// Sets for doc2 should be empty (initially)
		expect(result.current.annotationSets).toEqual([]);
	});
}); 