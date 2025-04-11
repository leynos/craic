/// <reference types="@types/jest" />
import { act, renderHook } from "@testing-library/react";
import useLocalStorageState from "use-local-storage-state";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDocumentManagement } from "../useDocumentManagement";
import type { Document } from "../useDocumentManagement";

// Mock use-local-storage-state
const mockSetDocuments = vi.fn();
let mockDocuments: Document[] | null = [];

vi.mock("use-local-storage-state", () => ({
  default: () => [mockDocuments, mockSetDocuments],
}));

describe("useDocumentManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDocuments = [];
  });

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useDocumentManagement());
    expect(result.current.documents).toEqual([]);
    expect(result.current.selectedDocId).toBeNull();
  });

  it("handles file upload", () => {
    const { result } = renderHook(() => useDocumentManagement());
    const content = "test content";
    const filename = "test.md";

    act(() => {
      result.current.handleFileUpload(content, filename);
    });

    expect(mockSetDocuments).toHaveBeenCalledWith([
      expect.objectContaining({
        name: filename,
        content: content,
        annotationSets: [],
      }),
    ]);
  });

  it("finds current document and content", () => {
    const testDoc = {
      id: "test-id",
      name: "test.md",
      content: "test content",
      annotationSets: [],
    };
    mockDocuments = [testDoc];

    const { result } = renderHook(() => useDocumentManagement());
    act(() => {
      result.current.setSelectedDocId(testDoc.id);
    });

    expect(result.current.currentDocument).toEqual(testDoc);
    expect(result.current.currentContent).toBe(testDoc.content);
  });
});
