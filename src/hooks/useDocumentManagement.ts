import { useState } from 'react';
import { useLocalStorage } from 'react-storage-complete';

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
  const [documents, setDocuments] = useLocalStorage<Document[]>('documents', []);

  const currentDocument = documents?.find(doc => doc.id === selectedDocId);
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