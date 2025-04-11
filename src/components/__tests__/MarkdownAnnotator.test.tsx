import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Annotation } from "../../hooks/useDocumentManagement";
import MarkdownAnnotator from "../MarkdownAnnotator";

interface RecogitoInstance {
  on: (event: string, callback: (annotation: Annotation) => void) => void;
  destroy: () => void;
  setAnnotations: (annotations: Annotation[]) => void;
}

const mockSetAnnotations = vi.fn();
const mockOn = vi.fn();
const mockDestroy = vi.fn();
let mockRecogitoInstance: RecogitoInstance;

// Mock ReactMarkdown
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown">{children}</div>
  ),
}));

// Mock the Recogito class
vi.mock("@recogito/recogito-js", () => ({
  Recogito: vi.fn().mockImplementation(() => {
    mockRecogitoInstance = {
      destroy: mockDestroy,
      setAnnotations: mockSetAnnotations,
      on: mockOn,
    };
    return mockRecogitoInstance;
  }),
}));

// Mock CSS import
vi.mock("@recogito/recogito-js/dist/recogito.min.css", () => ({}));

describe("MarkdownAnnotator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders markdown content", () => {
    render(<MarkdownAnnotator content="Test content" annotations={[]} />);
    expect(screen.getByTestId("markdown")).toHaveTextContent("Test content");
  });

  it("initializes Recogito with correct props", () => {
    const annotations: Annotation[] = [
      {
        id: "1",
        text: "Test annotation",
        start: 0,
        end: 10,
      },
    ];

    render(
      <MarkdownAnnotator
        content="Test content"
        annotations={annotations}
        onAnnotationCreate={() => {}}
      />,
    );

    // Check if Recogito was initialized
    expect(mockSetAnnotations).toHaveBeenCalledWith(annotations);
    expect(mockOn).toHaveBeenCalledWith(
      "createAnnotation",
      expect.any(Function),
    );
  });

  it("cleans up Recogito on unmount", () => {
    const { unmount } = render(
      <MarkdownAnnotator content="Test content" annotations={[]} />,
    );

    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });
});
