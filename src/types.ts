/**
 * Represents an uploaded document.
 */
export interface Document {
  id: string;
  name: string;
  content: string; // Store document content directly for simplicity
}

/**
 * Represents a set of annotations for a specific document.
 */
export interface AnnotationSet {
  id: string;
  documentId: string;
  name: string;
  // In a real app, might include an array of actual annotation objects
}
