import React from "react";
import type { ChangeEvent } from "react";
import type { AnnotationSet } from "../../types";

interface DocumentMenuProps {
  documentId: string | null;
  annotationSets: AnnotationSet[];
  selectedSetId: string | null;
  onAddSet: () => void;
  onSelectSet: (setId: string) => void;
  onRemoveSet: () => void;
}

/**
 * Component for managing annotation sets (selecting, adding, removing)
 * for a specific document.
 */
function DocumentMenu({
  documentId,
  annotationSets,
  selectedSetId,
  onAddSet,
  onSelectSet,
  onRemoveSet,
}: DocumentMenuProps) {
  // Don't render if no document is selected
  if (!documentId) {
    return null;
  }

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onSelectSet(event.target.value);
  };

  return (
    <div className="flex items-center space-x-2 p-2 border-gray-200 border-b">
      <label htmlFor="annotation-set-select" className="font-medium text-sm">
        Annotation Set:
      </label>
      <select
        id="annotation-set-select"
        value={selectedSetId ?? ""} // Ensure controlled component behavior
        onChange={handleSelectChange}
        className="block focus:ring-opacity-50 shadow-sm p-1 border-gray-300 focus:border-indigo-300 rounded-md focus:ring focus:ring-indigo-200 w-full max-w-xs text-sm"
      >
        <option value="" disabled>
          Select a set...
        </option>
        {annotationSets.map((set) => (
          <option key={set.id} value={set.id}>
            {set.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onAddSet}
        className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 shadow-sm px-2.5 py-1.5 border border-transparent rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium text-white text-xs"
        aria-label="Add new annotation set"
      >
        +
      </button>
      {selectedSetId && (
        <button
          type="button"
          onClick={onRemoveSet}
          className="inline-flex items-center bg-white hover:bg-gray-50 shadow-sm px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium text-gray-700 text-xs"
          aria-label="Remove selected annotation set"
        >
          Remove
        </button>
      )}
    </div>
  );
}

export default DocumentMenu; 