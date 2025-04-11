import * as React from "react";
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "text/markdown" || file.type === "text/plain") {
        const content = await readFileContent(file);
        onFileUpload(content, file.name);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "text/markdown" || file.type === "text/plain") {
        const content = await readFileContent(file);
        onFileUpload(content, file.name);
      }
    }
  };

  return (
    <button
      type="button"
      className="document-upload"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      aria-label="Upload document"
      style={{
        border: "2px dashed #ccc",
        borderRadius: "4px",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
        width: "100%",
        marginBottom: "20px",
        background: "none",
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".md,.txt"
        style={{ display: "none" }}
      />
      <p>Click or drag a document here to upload</p>
      <p style={{ fontSize: "0.8em", color: "#666" }}>
        Supported formats: .md, .txt
      </p>
    </button>
  );
};

export default DocumentUpload;
