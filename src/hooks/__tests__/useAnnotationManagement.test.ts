/// <reference types="@types/jest" />
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAnnotationManagement } from "../useAnnotationManagement";
import type { Document } from "../useDocumentManagement";

describe("useAnnotationManagement", () => {
  const mockSetDocuments = vi.fn();
  const testDoc: Document = {
    id: "doc1",
    name: "test.md",
    content: "test content",
    annotationSets: [
      {
        id: "set1",
        name: "Set 1",
        annotations: [],
      },
    ],
  };
  const testDocs: Document[] = [testDoc];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with empty annotation sets when no document is selected", () => {
    const { result } = renderHook(() =>
      useAnnotationManagement(null, null, mockSetDocuments),
    );

    expect(result.current.annotationSets).toEqual([]);
    expect(result.current.selectedSetId).toBeNull();
  });

  it("loads annotation sets when a document is selected", () => {
    const { result } = renderHook(() =>
      useAnnotationManagement(testDocs, testDoc.id, mockSetDocuments),
    );

    expect(result.current.annotationSets).toEqual(testDoc.annotationSets);
  });

  it("handles adding a new annotation set", () => {
    const { result } = renderHook(() =>
      useAnnotationManagement(testDocs, testDoc.id, mockSetDocuments),
    );

    act(() => {
      result.current.handleAddAnnotationSet();
    });

    expect(mockSetDocuments).toHaveBeenCalledWith([
      {
        ...testDoc,
        annotationSets: [
          ...testDoc.annotationSets,
          expect.objectContaining({
            id: expect.any(String),
            name: expect.stringContaining("Annotation Set"),
            annotations: [],
          }),
        ],
      },
    ]);
  });

  it("handles removing an annotation set", () => {
    const { result } = renderHook(() =>
      useAnnotationManagement(testDocs, testDoc.id, mockSetDocuments),
    );

    act(() => {
      result.current.handleRemoveAnnotationSet(testDoc.annotationSets[0].id);
    });

    expect(mockSetDocuments).toHaveBeenCalledWith([
      {
        ...testDoc,
        annotationSets: [],
      },
    ]);
  });

  it("handles creating a new annotation", () => {
    const { result } = renderHook(() =>
      useAnnotationManagement(testDocs, testDoc.id, mockSetDocuments),
    );

    act(() => {
      result.current.setSelectedSetId(testDoc.annotationSets[0].id);
    });

    const newAnnotation = {
      id: "anno1",
      text: "Test annotation",
      start: 0,
      end: 10,
    };

    act(() => {
      result.current.handleAnnotationCreate(newAnnotation);
    });

    expect(mockSetDocuments).toHaveBeenCalledWith([
      {
        ...testDoc,
        annotationSets: [
          {
            ...testDoc.annotationSets[0],
            annotations: [newAnnotation],
          },
        ],
      },
    ]);
  });
});
