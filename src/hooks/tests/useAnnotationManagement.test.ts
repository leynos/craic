import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "bun:test";
import { useAnnotationManagement } from "../useAnnotationManagement";
import type { AnnotationSet } from "../../types";
import { resetLocalStorageMock } from "../../test/module-mocks";

// Ensure the mock module is evaluated by importing it
import "../../test/module-mocks";

// The mock is defined in src/test/module-mocks.ts and preloaded

// Helper to generate unique keys for storage isolation
const getUniqueKey = (base: string) => `${base}-${Date.now()}-${Math.random()}`;

describe("useAnnotationManagement", () => {
  beforeEach(() => {
    // Reset the mock's internal state before each test
    resetLocalStorageMock();
  });

  it("should initialize with no sets for a given document ID", () => {
    const key = getUniqueKey("annotationSets");
    const { result } = renderHook(() => useAnnotationManagement("doc1", key));
    expect(result.current.annotationSets).toEqual([]);
    expect(result.current.selectedAnnotationSet).toBeNull();
    expect(result.current.selectedSetId).toBeNull();
  });

  it("should return empty sets if no document ID is provided", () => {
    const key = getUniqueKey("annotationSets");
    const { result } = renderHook(() => useAnnotationManagement(null, key));
    expect(result.current.annotationSets).toEqual([]);
  });

  it("should add a new annotation set for the current document and select it", async () => {
    const key = getUniqueKey("annotationSets");
    const { result } = renderHook(() => useAnnotationManagement("doc1", key));

    act(() => {
      result.current.addAnnotationSet("Set 1");
    });

    // Wait for state update
    let set: AnnotationSet | undefined;
    await waitFor(() => {
        expect(result.current.annotationSets).toHaveLength(1);
        set = result.current.annotationSets[0] as AnnotationSet;
        expect(set).toBeDefined();
        expect(result.current.selectedSetId).toBe(set.id);
    });

    expect(set?.name).toBe("Set 1");
    expect(set?.documentId).toBe("doc1");
    expect(set?.id).toBeDefined();
    if (set) {
        expect(result.current.selectedAnnotationSet).toEqual(set);
    } else {
        throw new Error("Set should be defined after waitFor");
    }
  });

  it("should not add a set if no document ID is provided", () => {
    const key = getUniqueKey("annotationSets");
    const { result } = renderHook(() => useAnnotationManagement(null, key));

    act(() => {
      result.current.addAnnotationSet("Set 1");
    });

    expect(result.current.annotationSets).toHaveLength(0);
  });

  it("should only return sets for the current document", async () => {
    const key = getUniqueKey("annotationSets");
    const { result: resultDoc1, rerender: rerenderDoc1 } = renderHook(
      ({ docId }) => useAnnotationManagement(docId, key),
      { initialProps: { docId: "doc1" } },
    );
    const { result: resultDoc2, rerender: rerenderDoc2 } = renderHook(
      ({ docId }) => useAnnotationManagement(docId, key),
      { initialProps: { docId: "doc2" } },
    );

    // Add sets using respective hooks
    act(() => {
      resultDoc1.current.addAnnotationSet("Doc1 Set1");
      resultDoc2.current.addAnnotationSet("Doc2 Set1");
      resultDoc1.current.addAnnotationSet("Doc1 Set2");
    });

    // Check sets for doc1 after waiting for updates
    await waitFor(() => {
        expect(resultDoc1.current.annotationSets).toHaveLength(2);
    });
     expect(
      resultDoc1.current.annotationSets.map((s: AnnotationSet) => s.name),
    ).toEqual(["Doc1 Set1", "Doc1 Set2"]);

    // Check sets for doc2 after waiting for updates
    // We might need to explicitly trigger a re-render or wait for the mock state to propagate
    rerenderDoc2({ docId: "doc2" }); // Re-render to ensure it picks up latest global state
    await waitFor(() => {
        expect(resultDoc2.current.annotationSets).toHaveLength(1);
    });
    expect(resultDoc2.current.annotationSets[0].name).toBe("Doc2 Set1");
  });

  it("should select an annotation set", async () => {
    const key = getUniqueKey("annotationSets");
    const { result } = renderHook(() => useAnnotationManagement("doc1", key));
    let setId = "";

    act(() => {
      result.current.addAnnotationSet("Set To Select");
    });

    // Wait for set to be added
    await waitFor(() => {
        expect(result.current.annotationSets).toHaveLength(1);
    });
    setId = (result.current.annotationSets[0] as AnnotationSet).id;

    act(() => {
      result.current.selectAnnotationSet(setId);
    });

    // Wait for selection
    await waitFor(() => {
        expect(result.current.selectedSetId).toBe(setId);
    });
    expect(result.current.selectedAnnotationSet?.id).toBe(setId);
  });

  it("should remove an annotation set and deselect if selected", async () => {
    const key = getUniqueKey("annotationSets");
    const { result } = renderHook(() => useAnnotationManagement("doc1", key));
    let set1Id = "";
    let set2Id = "";

    act(() => {
      result.current.addAnnotationSet("Set 1");
      result.current.addAnnotationSet("Set 2");
    });

    // Wait for sets to be added
    await waitFor(() => {
        expect(result.current.annotationSets).toHaveLength(2);
    });
    set1Id = (result.current.annotationSets[0] as AnnotationSet).id;
    set2Id = (result.current.annotationSets[1] as AnnotationSet).id;

    // Select Set 1
    act(() => {
      result.current.selectAnnotationSet(set1Id);
    });
    await waitFor(() => expect(result.current.selectedSetId).toBe(set1Id));

    // Remove Set 1
    act(() => {
      result.current.removeAnnotationSet(set1Id);
    });

    // Wait for removal and deselection
    await waitFor(() => {
        expect(result.current.annotationSets).toHaveLength(1);
        expect(result.current.selectedSetId).toBeNull();
    });

    expect((result.current.annotationSets[0] as AnnotationSet).id).toBe(set2Id);
    expect(result.current.selectedAnnotationSet).toBeNull();
  });

  it("should reset selection when documentId changes", async () => {
    const key = getUniqueKey("annotationSets");
    const initialProps = { docId: "doc1", storageKey: key };
    const { result, rerender } = renderHook(
      ({ docId, storageKey }) => useAnnotationManagement(docId, storageKey),
      { initialProps },
    );
    let setId = "";

    // Add and select a set for doc1
    act(() => {
      result.current.addAnnotationSet("Set For Doc1");
    });
     await waitFor(() => {
        expect(result.current.annotationSets).toHaveLength(1);
    });
    setId = (result.current.annotationSets[0] as AnnotationSet).id;
    act(() => {
      result.current.selectAnnotationSet(setId);
    });
    await waitFor(() => expect(result.current.selectedSetId).toBe(setId));

    // Rerender with a new documentId
    rerender({ docId: "doc2", storageKey: key });

    // Wait for selection to reset (should be quick after rerender)
     await waitFor(() => {
        expect(result.current.selectedSetId).toBeNull();
        expect(result.current.annotationSets).toEqual([]); // Check sets for doc2
     });

    expect(result.current.selectedAnnotationSet).toBeNull();
  });
});
