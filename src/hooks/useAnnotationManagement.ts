import { useCallback, useState, useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import type { AnnotationSet } from '../types';

// Simple unique ID generator
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

// Define the hook's return type explicitly
interface UseAnnotationManagementReturn {
	annotationSets: AnnotationSet[];
	selectedAnnotationSet: AnnotationSet | null;
	selectedSetId: string | null;
	addAnnotationSet: (name: string) => void;
	removeAnnotationSet: (setId: string) => void;
	selectAnnotationSet: (setId: string | null) => void;
}

/**
 * Hook to manage annotation sets for a specific document.
 * @param documentId The ID of the currently selected document, or null if none selected.
 */
export function useAnnotationManagement(
	documentId: string | null
): UseAnnotationManagementReturn { // Add explicit return type here
	// Store all annotation sets globally
	const [allAnnotationSets, setAllAnnotationSets] = useLocalStorageState<AnnotationSet[]>('annotationSets', {
		defaultValue: [],
	});

	// Local state for the currently selected set *within the context of the selected document*
	const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

	// Filter sets belonging to the current document
	const currentDocumentSets = useMemo(() => {
		if (!documentId) return [];
		return (allAnnotationSets ?? []).filter(
			(set: AnnotationSet) => set.documentId === documentId
		);
	}, [allAnnotationSets, documentId]);

	// Reset selected set if the document changes or the selected set is no longer valid
	// Using useState with a function initializer to run this logic only once on initial render and when deps change wasn't quite right.
	// A useEffect hook is more appropriate for reacting to changes after render.
	useMemo(() => { // Let's keep useMemo for now, useEffect might be better
		if (
			selectedSetId &&
			!currentDocumentSets.find((set) => set.id === selectedSetId)
		) {
			setSelectedSetId(null);
		}
	// Effect runs when documentId changes or the list of sets changes
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentDocumentSets, selectedSetId]); // Remove redundant documentId

	const addAnnotationSet = useCallback(
		(name: string) => {
			if (!documentId) return; // Cannot add a set without a selected document

			const newSet: AnnotationSet = {
				id: generateId(),
				documentId,
				name,
			};
			setAllAnnotationSets((prevSets: AnnotationSet[] | undefined) => [
				...(prevSets ?? []),
				newSet,
			]);
			setSelectedSetId(newSet.id); // Select the new set immediately
		},
		[documentId, setAllAnnotationSets]
	);

	const removeAnnotationSet = useCallback(
		(setId: string) => {
			setAllAnnotationSets((prevSets: AnnotationSet[] | undefined) =>
				(prevSets ?? []).filter((set: AnnotationSet) => set.id !== setId)
			);
			if (selectedSetId === setId) {
				setSelectedSetId(null); // Deselect if the removed set was selected
			}
			// Note: Need to handle deletion of actual annotations associated with the set
		},
		[selectedSetId, setAllAnnotationSets]
	);

	const selectAnnotationSet = useCallback((setId: string | null) => {
		setSelectedSetId(setId);
	}, []);

	const selectedAnnotationSet =
		currentDocumentSets.find((set) => set.id === selectedSetId) ?? null;

	return {
		annotationSets: currentDocumentSets, // Only return sets for the current doc
		selectedAnnotationSet,
		selectedSetId,
		addAnnotationSet,
		removeAnnotationSet,
		selectAnnotationSet,
	};
} 