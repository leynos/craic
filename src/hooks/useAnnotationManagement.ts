import { useState, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { Document, AnnotationSet } from './useDocumentManagement';

export function useAnnotationManagement(
  documents: Document[] | null | undefined,
  selectedDocId: string | null,
  setDocuments: (value: Document[]) => void
) {
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [annotationSets, setAnnotationSets] = useLocalStorageState<AnnotationSet[]>('annotationSets', {
    defaultValue: []
  });

  const currentAnnotations = documents?.find(doc => doc.id === selectedDocId)
    ?.annotationSets.find(set => set.id === selectedSetId)
    ?.annotations || [];

  const handleAddAnnotationSet = () => {
    if (!selectedDocId || !documents) return;

    const newSet: AnnotationSet = {
      id: Date.now().toString(),
      name: `Annotation Set ${annotationSets.length + 1}`,
      annotations: []
    };

    setDocuments(documents.map(doc => 
      doc.id === selectedDocId 
        ? { ...doc, annotationSets: [...doc.annotationSets, newSet] }
        : doc
    ));
    setAnnotationSets([...(annotationSets || []), newSet]);
    setSelectedSetId(newSet.id);
  };

  const handleRemoveAnnotationSet = (id: string) => {
    if (!selectedDocId || !documents) return;

    setDocuments(documents.map(doc => 
      doc.id === selectedDocId 
        ? { ...doc, annotationSets: doc.annotationSets.filter(set => set.id !== id) }
        : doc
    ));
    setAnnotationSets((annotationSets || []).filter(set => set.id !== id));
    if (selectedSetId === id) {
      setSelectedSetId(null);
    }
  };

  const handleAnnotationCreate = (annotation: any) => {
    if (selectedDocId && selectedSetId && documents) {
      setDocuments(documents.map(doc => 
        doc.id === selectedDocId 
          ? {
              ...doc,
              annotationSets: doc.annotationSets.map(set => 
                set.id === selectedSetId 
                  ? { ...set, annotations: [...set.annotations, annotation] }
                  : set
              )
            }
          : doc
      ));
    }
  };

  useEffect(() => {
    if (selectedDocId && documents) {
      const doc = documents.find(d => d.id === selectedDocId);
      setAnnotationSets(doc?.annotationSets || []);
      setSelectedSetId(null);
    } else {
      setAnnotationSets([]);
      setSelectedSetId(null);
    }
  }, [selectedDocId, documents]);

  return {
    annotationSets,
    selectedSetId,
    setSelectedSetId,
    currentAnnotations,
    handleAddAnnotationSet,
    handleRemoveAnnotationSet,
    handleAnnotationCreate
  };
} 