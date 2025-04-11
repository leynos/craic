import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DocumentUpload from "../DocumentUpload";

// Define proper types for FileReader
interface FileReaderEventTarget extends EventTarget {
  result: string;
}

interface FileReaderEvent extends Event {
  target: FileReaderEventTarget;
}

describe("DocumentUpload", () => {
  const mockOnFileUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upload area", () => {
    const { container } = render(
      <DocumentUpload onFileUpload={mockOnFileUpload} />,
    );
    const uploadButton = container.querySelector(".document-upload");
    expect(uploadButton).toBeDefined();
    expect(uploadButton).toHaveTextContent(/Click or drag a document here/i);
    expect(uploadButton).toHaveTextContent(/Supported formats/i);
  });

  it("handles file input change", async () => {
    const file = new File(["test content"], "test.md", {
      type: "text/markdown",
    });
    const { container } = render(
      <DocumentUpload onFileUpload={mockOnFileUpload} />,
    );

    const input = container.querySelector("input[type='file']");
    expect(input).toBeDefined();

    if (input) {
      Object.defineProperty(input, "files", {
        value: [file],
      });

      await fireEvent.change(input);

      expect(mockOnFileUpload).toHaveBeenCalledWith("test content", "test.md");
    }
  });

  it("handles file drop", async () => {
    const file = new File(["test content"], "test.md", {
      type: "text/markdown",
    });
    const { container } = render(
      <DocumentUpload onFileUpload={mockOnFileUpload} />,
    );

    const dropZone = container.querySelector(".document-upload");
    expect(dropZone).toBeDefined();

    if (dropZone) {
      const dropEvent = createDropEvent([file]);
      await fireEvent.drop(dropZone, dropEvent);

      expect(mockOnFileUpload).toHaveBeenCalledWith("test content", "test.md");
    }
  });
});

// Helper function to create a drop event with files
function createDropEvent(files: File[]) {
  return {
    dataTransfer: {
      files,
      items: files.map((file) => ({
        kind: "file",
        type: file.type,
        getAsFile: () => file,
      })),
      types: ["Files"],
    },
  };
}
