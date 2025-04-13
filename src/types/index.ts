/**
 * Represents an uploaded text document.
 */
export interface Document {
	id: string; // Unique identifier (e.g., generated hash or timestamp)
	name: string; // Original filename
	content: string; // The text content of the document
}

/**
 * Represents a collection of annotations for a specific document.
 */
export interface AnnotationSet {
	id: string; // Unique identifier for the set
	documentId: string; // ID of the document this set belongs to
	name: string; // User-defined name for the annotation set (e.g., "Initial Pass", "Reviewed")
	// annotations will be stored separately, likely managed by Recogito/local storage
}

/**
 * Represents a single annotation within an AnnotationSet.
 * This structure might be based on or compatible with RecogitoJS's format.
 * For now, a placeholder.
 */
export interface Annotation {
	id: string; // Usually provided by the annotation tool (Recogito)
	// Other properties depend on RecogitoJS structure (target, body, etc.)
	[key: string]: unknown; // Use unknown instead of any for better type safety
} 