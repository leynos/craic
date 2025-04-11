import type React from "react";
import type { Annotation } from "../hooks/useDocumentManagement";

interface AnnotationSet {
  id: string;
  name: string;
  annotations: Annotation[];
}

interface DocumentMenuProps {
  annotationSets: AnnotationSet[];
  selectedSetId: string | null;
  onAddSet: () => void;
  onRemoveSet: (id: string) => void;
  onSelectSet: (id: string | null) => void;
}

const DocumentMenu: React.FC<DocumentMenuProps> = ({
  annotationSets,
  selectedSetId,
  onAddSet,
  onRemoveSet,
  onSelectSet,
}) => {
  return (
    <div className="document-menu">
      <div className="annotation-set-selector">
        <h3>Annotation Sets</h3>
        <select
          value={selectedSetId || ""}
          onChange={(e) => onSelectSet(e.target.value || null)}
        >
          <option value="">Select an annotation set</option>
          {annotationSets.map((set) => (
            <option key={set.id} value={set.id}>
              {set.name}
            </option>
          ))}
        </select>
        <div className="annotation-set-actions">
          <button type="button" onClick={onAddSet}>
            Add Set
          </button>
          {selectedSetId && (
            <button type="button" onClick={() => onRemoveSet(selectedSetId)}>
              Remove Set
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentMenu;
