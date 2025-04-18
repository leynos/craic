import { beforeEach, describe, expect, it } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { resetLocalStorageMock } from "../../test/module-mocks";
import type { Document } from "../../types";
import { useDocumentManagement } from "../useDocumentManagement";

// Ensure the mock module is evaluated by importing it
import "../../test/module-mocks";

// Helper to generate unique keys for storage isolation
const getUniqueKey = (base: string) => `${base}-${Date.now()}-${Math.random()}`;

describe("useDocumentManagement", () => {
  beforeEach(() => {
    // Reset the mock's internal state before each test
    resetLocalStorageMock();
  });

  it("should initialize with an empty documents list and no selection", () => {
    const key = getUniqueKey("documents");
    const { result } = renderHook(() => useDocumentManagement(key));
    expect(result.current.documents).toEqual([]);
    expect(result.current.selectedDocument).toBeNull();
    expect(result.current.selectedDocumentId).toBeNull();
  });

  it("should add a new document", async () => {
    const key = getUniqueKey("documents");
    const { result } = renderHook(() => useDocumentManagement(key));

    act(() => {
      result.current.addDocument("Test Doc", "Hello content");
    });

    await waitFor(() => {
      expect(result.current.documents).toHaveLength(1);
    });

    const doc = result.current.documents[0] as Document;
    expect(doc.name).toBe("Test Doc");
    expect(doc.content).toBe("Hello content");
    expect(doc.id).toBeDefined();
  });

  it("should select a document", async () => {
    const key = getUniqueKey("documents");
    const { result } = renderHook(() => useDocumentManagement(key));
    let docId = "";

    act(() => {
      result.current.addDocument("Select Me", "Content");
    });

    await waitFor(() => {
      expect(result.current.documents).toHaveLength(1);
    });
    docId = (result.current.documents[0] as Document).id;

    act(() => {
      result.current.selectDocument(docId);
    });

    await waitFor(() => {
      expect(result.current.selectedDocumentId).toBe(docId);
    });

    expect(result.current.selectedDocument).not.toBeNull();
    expect(result.current.selectedDocument?.id).toBe(docId);
    expect(result.current.selectedDocument?.name).toBe("Select Me");
  });

  it("should remove a document and deselect if it was selected", async () => {
    const key = getUniqueKey("documents");
    const { result } = renderHook(() => useDocumentManagement(key));
    let doc1Id = "";
    let doc2Id = "";

    act(() => {
      result.current.addDocument("Doc 1", "Content 1");
      result.current.addDocument("Doc 2", "Content 2");
    });

    await waitFor(() => {
      expect(result.current.documents).toHaveLength(2);
    });
    doc1Id = (result.current.documents[0] as Document).id;
    doc2Id = (result.current.documents[1] as Document).id;

    act(() => {
      result.current.selectDocument(doc1Id);
    });
    await waitFor(() => expect(result.current.selectedDocumentId).toBe(doc1Id));

    act(() => {
      result.current.removeDocument(doc1Id);
    });

    await waitFor(() => {
      expect(result.current.documents).toHaveLength(1);
      expect(result.current.selectedDocumentId).toBeNull();
    });

    expect((result.current.documents[0] as Document).id).toBe(doc2Id);
    expect(result.current.selectedDocument).toBeNull();
  });

  it("should remove a document without affecting selection if a different one is selected", async () => {
    const key = getUniqueKey("documents");
    const { result } = renderHook(() => useDocumentManagement(key));
    let doc1Id = "";
    let doc2Id = "";

    act(() => {
      result.current.addDocument("Doc 1", "Content 1");
      result.current.addDocument("Doc 2", "Content 2");
    });

    await waitFor(() => {
      expect(result.current.documents).toHaveLength(2);
    });
    doc1Id = (result.current.documents[0] as Document).id;
    doc2Id = (result.current.documents[1] as Document).id;

    act(() => {
      result.current.selectDocument(doc2Id);
    });
    await waitFor(() => expect(result.current.selectedDocumentId).toBe(doc2Id));

    act(() => {
      result.current.removeDocument(doc1Id);
    });

    await waitFor(() => {
      expect(result.current.documents).toHaveLength(1);
    });
    expect(result.current.selectedDocumentId).toBe(doc2Id);

    expect((result.current.documents[0] as Document).id).toBe(doc2Id);
    expect(result.current.selectedDocument?.id).toBe(doc2Id);
  });
});
