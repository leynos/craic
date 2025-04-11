import React, { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import MarkdownAnnotator from './components/MarkdownAnnotator';
import { useDocumentManagement } from './hooks/useDocumentManagement';
import { useAnnotationManagement } from './hooks/useAnnotationManagement';
import './App.css';

function App() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const { documents, setDocuments, handleFileUpload } = useDocumentManagement();
  const { annotationSets, handleAddAnnotationSet, handleRemoveAnnotationSet, handleAnnotationCreate } = useAnnotationManagement(documents, selectedDocId, setDocuments);

  const onFileUpload = (content: string, filename: string) => {
    handleFileUpload(content, filename);
  };

  const selectedDoc = documents?.find(doc => doc.id === selectedDocId);

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>Documents</h2>
        <DocumentUpload onFileUpload={onFileUpload} />
        <ul>
          {documents?.map(doc => (
            <li key={doc.id}>
              <button
                onClick={() => setSelectedDocId(doc.id)}
                className={selectedDocId === doc.id ? 'selected' : ''}
              >
                {doc.name}
              </button>
              <button 
                className="remove"
                onClick={() => {
                  const newDocs = documents.filter(d => d.id !== doc.id);
                  setDocuments(newDocs);
                  if (selectedDocId === doc.id) {
                    setSelectedDocId(null);
                  }
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content">
        {selectedDoc ? (
          <div className="markdown-content">
            <MarkdownAnnotator
              content={selectedDoc.content}
              annotations={annotationSets?.flatMap(set => set.annotations) || []}
              onAnnotationCreate={handleAnnotationCreate}
            />
          </div>
        ) : (
          <div className="empty-state">
            <p>Select a document to view</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
