import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "bun:test";
import { useDocumentManagement } from "../useDocumentManagement";
import type { Document } from "../../types";
import { resetLocalStorageMock } from "../../test/module-mocks";

describe("useDocumentManagement", () => {
  beforeEach(() => {
    // Reset the mock's internal state before each test
    resetLocalStorageMock();
  });

  it("should initialize with an empty documents list and no selection", () => {
    const { result } = renderHook(() => useDocumentManagement());
    expect(result.current.documents).toEqual([]);
    expect(result.current.selectedDocument).toBeNull();
    expect(result.current.selectedDocumentId).toBeNull();
  });

  it("should add a new document", () => {
    const { result } = renderHook(() => useDocumentManagement());

    act(() => {
      result.current.addDocument("Test Doc", "Hello content");
    });

    expect(result.current.documents).toHaveLength(1);
    // Type assertion needed because mock returns 'any'
    const doc = result.current.documents[0] as Document;
    expect(doc.name).toBe("Test Doc");
    expect(doc.content).toBe("Hello content");
    expect(doc.id).toBeDefined();
  });

  it("should select a document", () => {
    const { result } = renderHook(() => useDocumentManagement());
    let docId = "";

    act(() => {
      result.current.addDocument("Select Me", "Content");
    });

    docId = (result.current.documents[0] as Document).id;

    act(() => {
      result.current.selectDocument(docId);
    });

    expect(result.current.selectedDocumentId).toBe(docId);
    expect(result.current.selectedDocument).not.toBeNull();
    expect(result.current.selectedDocument?.id).toBe(docId);
    expect(result.current.selectedDocument?.name).toBe("Select Me");
  });

  it("should remove a document and deselect if it was selected", () => {
    const { result } = renderHook(() => useDocumentManagement());
    let doc1Id = "";
    let doc2Id = "";

    act(() => {
      result.current.addDocument("Doc 1", "Content 1");
      result.current.addDocument("Doc 2", "Content 2");
    });

    doc1Id = (result.current.documents[0] as Document).id;
    doc2Id = (result.current.documents[1] as Document).id;

    // Select Doc 1
    act(() => {
      result.current.selectDocument(doc1Id);
    });
    expect(result.current.selectedDocumentId).toBe(doc1Id);

    // Remove Doc 1
    act(() => {
      result.current.removeDocument(doc1Id);
    });

    expect(result.current.documents).toHaveLength(1);
    expect((result.current.documents[0] as Document).id).toBe(doc2Id);
    // Check if deselected
    expect(result.current.selectedDocumentId).toBeNull();
    expect(result.current.selectedDocument).toBeNull();
  });

  it("should remove a document without affecting selection if a different one is selected", () => {
    const { result } = renderHook(() => useDocumentManagement());
    let doc1Id = "";
    let doc2Id = "";

    act(() => {
      result.current.addDocument("Doc 1", "Content 1");
      result.current.addDocument("Doc 2", "Content 2");
    });

    doc1Id = (result.current.documents[0] as Document).id;
    doc2Id = (result.current.documents[1] as Document).id;

    // Select Doc 2
    act(() => {
      result.current.selectDocument(doc2Id);
    });
    expect(result.current.selectedDocumentId).toBe(doc2Id);

    // Remove Doc 1
    act(() => {
      result.current.removeDocument(doc1Id);
    });

    expect(result.current.documents).toHaveLength(1);
    expect((result.current.documents[0] as Document).id).toBe(doc2Id);
    // Check selection is still Doc 2
    expect(result.current.selectedDocumentId).toBe(doc2Id);
    expect(result.current.selectedDocument?.id).toBe(doc2Id);
  });
});
