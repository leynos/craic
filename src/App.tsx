import DocumentMenu from './components/DocumentMenu';
import DocumentUpload from './components/DocumentUpload';
import MarkdownAnnotator from './components/MarkdownAnnotator';
import { useDocumentManagement } from './hooks/useDocumentManagement';
import { useAnnotationManagement } from './hooks/useAnnotationManagement';
import './App.css';

function App() {
  const {
    documents,
    setDocuments,
    selectedDocId,
    setSelectedDocId,
    currentContent,
    handleFileUpload
  } = useDocumentManagement();

  const {
    annotationSets,
    selectedSetId,
    setSelectedSetId,
    currentAnnotations,
    handleAddAnnotationSet,
    handleRemoveAnnotationSet,
    handleAnnotationCreate
  } = useAnnotationManagement(documents, selectedDocId, setDocuments);

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>Documents</h2>
        <DocumentUpload onFileUpload={handleFileUpload} />
        <select 
          value={selectedDocId || ''} 
          onChange={(e) => setSelectedDocId(e.target.value || null)}
          style={{ width: '100%', marginBottom: '20px' }}
        >
          <option value="">Select a document</option>
          {documents?.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.name}</option>
          ))}
        </select>

        {selectedDocId && (
          <>
            <h2>Annotation Sets</h2>
            <DocumentMenu 
              annotationSets={annotationSets}
              selectedSetId={selectedSetId}
              onAddSet={handleAddAnnotationSet}
              onRemoveSet={handleRemoveAnnotationSet}
              onSelectSet={setSelectedSetId}
            />
          </>
        )}
      </div>
      
      <div className="main-content">
        {currentContent ? (
          <MarkdownAnnotator
            content={currentContent}
            annotations={currentAnnotations}
            onAnnotationCreate={handleAnnotationCreate}
          />
        ) : (
          <div className="empty-state">
            <p>Upload or select a document to begin annotating</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
