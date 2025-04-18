import { useCallback, useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import type { Document } from "../types";

const DEFAULT_DOCUMENTS_KEY = "documents";

// Simple unique ID generator (replace with more robust solution if needed)
const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

export function useDocumentManagement(storageKey: string = DEFAULT_DOCUMENTS_KEY) {
  const [documents, setDocuments] = useLocalStorageState<Document[]>(
    storageKey,
    {
      defaultValue: [],
    },
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );

  const addDocument = useCallback(
    (name: string, content: string) => {
      const newDocument: Document = {
        id: generateId(),
        name,
        content,
      };
      setDocuments((prevDocs: Document[] | undefined) => [
        ...(prevDocs ?? []),
        newDocument,
      ]);
      // Auto-select the new document
      setSelectedDocumentId(newDocument.id);
    },
    [setDocuments],
  );

  const removeDocument = useCallback(
    (id: string) => {
      setDocuments((prevDocs: Document[] | undefined) =>
        (prevDocs ?? []).filter((doc: Document) => doc.id !== id),
      );
      if (selectedDocumentId === id) {
        setSelectedDocumentId(null); // Deselect if the removed doc was selected
      }
      // Note: Need to handle associated annotation sets deletion elsewhere
    },
    [selectedDocumentId, setDocuments],
  );

  const selectDocument = useCallback((id: string | null) => {
    setSelectedDocumentId(id);
  }, []);

  const selectedDocument =
    documents?.find((doc: Document) => doc.id === selectedDocumentId) ?? null;

  return {
    documents: documents ?? [],
    selectedDocument,
    selectedDocumentId,
    addDocument,
    removeDocument,
    selectDocument,
  };
}
