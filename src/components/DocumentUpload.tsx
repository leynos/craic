import * as React from 'react';
const { useRef } = React;

interface DocumentUploadProps {
  onFileUpload: (content: string, filename: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileContent(file);
      onFileUpload(content, file.name);
      
      // Reset the input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    try {
      const content = await readFileContent(file);
      onFileUpload(content, file.name);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  return (
    <div 
      className="document-upload"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        marginBottom: '20px'
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".md,.txt"
        style={{ display: 'none' }}
      />
      <p>Click or drag a document here to upload</p>
      <p style={{ fontSize: '0.8em', color: '#666' }}>
        Supported formats: .md, .txt
      </p>
    </div>
  );
};

export default DocumentUpload; 