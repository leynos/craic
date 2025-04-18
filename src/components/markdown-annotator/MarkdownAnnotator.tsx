import type { AnnotationSet, Document } from "../../types";

interface MarkdownAnnotatorProps {
  document: Document | null;
  annotationSet: AnnotationSet | null;
  // Placeholder for actual annotation props
}

/**
 * Placeholder component for displaying document content and annotations.
 * The actual implementation will integrate with @recogito/recogito-js.
 */
function MarkdownAnnotator({
  document,
  annotationSet,
}: MarkdownAnnotatorProps) {
  if (!document) {
    return <p>No document selected.</p>;
  }

  return (
    <div data-testid="annotator-placeholder">
      <h2>Annotator Placeholder</h2>
      <p>Displaying: {document.name}</p>
      <p>Current Set: {annotationSet ? annotationSet.name : "None"}</p>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f4f4f4",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        {document.content}
      </pre>
      {/* RecogitoJS integration will go here */}
    </div>
  );
}

export default MarkdownAnnotator;
