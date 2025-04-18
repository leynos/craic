import DocumentList from "./components/document-list/DocumentList";
import DocumentMenu from "./components/document-menu/DocumentMenu";
import DocumentUpload from "./components/document-upload/DocumentUpload";
import MarkdownAnnotator from "./components/markdown-annotator/MarkdownAnnotator"; // Will use the mock initially
import { useAnnotationManagement } from "./hooks/useAnnotationManagement";
import { useDocumentManagement } from "./hooks/useDocumentManagement";

function App() {
  const {
    documents,
    selectedDocumentId,
    selectedDocument,
    addDocument,
    selectDocument,
    removeDocument,
  } = useDocumentManagement();

  const {
    annotationSets,
    selectedAnnotationSet,
    selectedSetId,
    addAnnotationSet,
    removeAnnotationSet,
    selectAnnotationSet,
  } = useAnnotationManagement(selectedDocumentId);

  // Handler to prompt for a new annotation set name
  const handleAddAnnotationSet = () => {
    const name = prompt(
      "Enter name for new annotation set:",
      `Set ${annotationSets.length + 1}`,
    );
    if (name) {
      addAnnotationSet(name);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      <header className="bg-gray-800 shadow-md p-4 font-semibold text-white text-xl">
        Craic - Annotation Tool
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Upload + Document List */}
        <aside className="flex flex-col bg-gray-50 border-gray-200 border-r w-1/4 max-w-xs">
          <div
            data-testid="document-upload"
            className="p-4 border-gray-200 border-b"
          >
            <DocumentUpload onUpload={addDocument} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <DocumentList
              documents={documents}
              selectedDocumentId={selectedDocumentId}
              onSelectDocument={selectDocument}
              onRemoveDocument={removeDocument}
            />
          </div>
        </aside>

        {/* Main Area: Menu + Annotator */}
        <main className="flex flex-col flex-1 overflow-hidden">
          {selectedDocument && (
            <div
              data-testid="document-menu"
              className="bg-white border-gray-200 border-b"
            >
              <DocumentMenu
                documentId={selectedDocumentId}
                annotationSets={annotationSets}
                selectedSetId={selectedSetId}
                onAddSet={handleAddAnnotationSet} // Use wrapped handler
                onSelectSet={selectAnnotationSet}
                onRemoveSet={() =>
                  selectedSetId && removeAnnotationSet(selectedSetId)
                }
              />
            </div>
          )}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedDocument ? (
              <MarkdownAnnotator
                document={selectedDocument} // Pass the full document object
                annotationSet={selectedAnnotationSet} // Pass the selected set object
                // annotations={[]} // Placeholder for actual annotations
                // onAnnotationsChange={() => {}} // Placeholder
              />
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                <p>Please select a document to view and annotate.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
