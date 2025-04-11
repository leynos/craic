import { useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';

export interface Document {
  id: string;
  name: string;
  content: string;
  annotationSets: AnnotationSet[];
}

export interface AnnotationSet {
  id: string;
  name: string;
  annotations: any[];
}

export function useDocumentManagement() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [documents, setDocuments] = useLocalStorageState<Document[]>('documents', {
    defaultValue: []
  });

  const currentDocument = documents?.find((doc: Document) => doc.id === selectedDocId);
  const currentContent = currentDocument?.content || '';

  const handleFileUpload = (content: string, filename: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: filename,
      content: content,
      annotationSets: []
    };
    setDocuments([...(documents || []), newDoc]);
    setSelectedDocId(newDoc.id);
  };

  return {
    documents,
    setDocuments,
    selectedDocId,
    setSelectedDocId,
    currentDocument,
    currentContent,
    handleFileUpload
  };
} 