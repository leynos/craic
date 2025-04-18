import type { Document } from "../../types";

interface DocumentListProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onRemoveDocument: (id: string) => void;
}

/**
 * Renders a list of uploaded documents, allowing selection and removal.
 */
function DocumentList({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onRemoveDocument,
}: DocumentListProps) {
  if (documents.length === 0) {
    return <p className="p-4 text-gray-500">No documents uploaded yet.</p>;
  }

  return (
    <ul className="m-0 p-0 border-gray-200 border-r h-full overflow-y-auto list-none">
      {documents.map((doc) => {
        const isSelected = doc.id === selectedDocumentId;
        return (
          <li
            key={doc.id}
            data-testid={doc.id}
            aria-selected={isSelected}
            className={`
              flex justify-between items-center p-2 border-b border-gray-100 
              ${isSelected ? "bg-indigo-100" : "hover:bg-gray-50"}
            `}
          >
            <button
              type="button"
              onClick={() => onSelectDocument(doc.id)}
              className={`text-left text-sm flex-grow truncate mr-2 ${isSelected ? "font-semibold text-indigo-800" : "text-gray-700"}`}
            >
              {doc.name}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering onSelectDocument
                onRemoveDocument(doc.id);
              }}
              aria-label={`Remove ${doc.name}`}
              title={`Remove ${doc.name}`} // Tooltip for clarity
              className="flex-shrink-0 hover:bg-red-100 p-1 rounded focus:outline-none focus:ring-1 focus:ring-red-300 text-red-500 hover:text-red-700 text-xs"
            >
              &times; {/* Use a multiplication sign for 'X' */}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default DocumentList;
