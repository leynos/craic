import React, { useState, useCallback } from "react";
// Use 'import type' for types used only in annotations
import type { DragEvent, ChangeEvent } from "react";

interface DocumentUploadProps {
  /**
   * Callback function triggered when a valid document is uploaded.
   * Receives the file content as a string and the file name.
   */
  onUpload: (content: string, fileName: string) => void;
}

const ALLOWED_MIME_TYPES = ["text/plain", "text/markdown"];
const ALLOWED_EXTENSIONS = [".txt", ".md"];

/**
 * A component that allows users to upload documents (.txt, .md)
 * either by clicking or by dragging and dropping.
 */
function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      setError(null); // Clear previous errors
      if (!file) {
        return;
      }

      // Basic client-side validation (MIME type or extension)
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();
      if (
        !ALLOWED_MIME_TYPES.includes(file.type) &&
        !ALLOWED_EXTENSIONS.includes(fileExtension)
      ) {
        setError(
          `Invalid file type. Please upload ${ALLOWED_EXTENSIONS.join(" or ")}.`,
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const content = loadEvent.target?.result;
        if (typeof content === "string") {
          onUpload(content, file.name);
        } else {
          setError("Could not read file content.");
        }
      };
      reader.onerror = () => {
        setError("Error reading file.");
      };
      reader.readAsText(file);
    },
    [onUpload],
  );

  const handleDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      event.relatedTarget &&
      event.currentTarget.contains(event.relatedTarget as Node)
    ) {
      return;
    }
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        handleFile(file);
        event.dataTransfer.clearData();
      }
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        handleFile(event.target.files[0]);
        event.target.value = "";
      }
    },
    [handleFile],
  );

  const acceptString = [...ALLOWED_EXTENSIONS, ...ALLOWED_MIME_TYPES].join(",");

  // Use a div as the drop zone, containing a label that triggers the input
  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8 text-center
        transition-colors duration-200 ease-in-out
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      aria-label="Document upload area" // Keep label for drop zone context
    >
      {/* Label now acts as the clickable area */}
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center cursor-pointer"
      >
        <input
          id="file-upload"
          type="file"
          accept={acceptString}
          onChange={handleInputChange}
          className="hidden" // Visually hide the default input
          tabIndex={-1} // Remove from focus order
        />
        {/* Content moved inside the label */}
        <p className="mb-2 text-gray-600">
          Drag & drop your document here, or click to select file.
        </p>
        <p className="text-gray-500 text-sm">
          Supported formats: {ALLOWED_EXTENSIONS.join(", ")}
        </p>
      </label>
      {error && (
        <p className="mt-4 text-red-500 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default DocumentUpload;
