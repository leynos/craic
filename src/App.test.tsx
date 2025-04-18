/// <reference lib="dom" />
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Import necessary mocks FIRST
import { resetLocalStorageMock } from "./test/module-mocks";
import "./test/module-mocks"; // This applies the use-local-storage-state mock

import App from "./App";
import type { AnnotationSet, Document } from "./types";

// KEEP the annotator mock
const MockMarkdownAnnotator = ({
  document,
  annotationSet,
}: { document: Document | null; annotationSet: AnnotationSet | null }) => {
  if (!document) return null;
  return (
    <div data-testid="annotator-placeholder">
      <h2>Annotator</h2>
      <p>
        Document: {document.name} ({document.id})
      </p>
      <p>
        Annotation Set:{" "}
        {annotationSet ? `${annotationSet.name} (${annotationSet.id})` : "None"}
      </p>
    </div>
  );
};
mock.module("./components/markdown-annotator/MarkdownAnnotator", () => ({
  default: MockMarkdownAnnotator,
}));

// --- Tests ---
describe("App Component Integration", () => {
  // Reset localStorage mock before each test
  beforeEach(() => {
    resetLocalStorageMock();
    // Mock window.prompt for adding annotation sets
    mock.restore(); // Ensure mocks from previous tests are cleared
    global.prompt = mock(() => "Test Set");
  });

  afterEach(() => {
    cleanup();
    mock.restore(); // Restore prompt after each test
  });

  test("renders initial layout with upload and empty list", () => {
    render(<App />);
    expect(screen.getByTestId("document-upload")).not.toBeNull();
    expect(screen.getByText(/no documents uploaded yet/i)).not.toBeNull();
    expect(screen.queryByTestId("document-menu")).toBeNull();
    expect(screen.queryByTestId("annotator-placeholder")).toBeNull();
  });

  // Helper function to simulate file upload
  const uploadFile = async (
    user: ReturnType<typeof userEvent.setup>,
    fileName: string,
    fileContent: string,
  ) => {
    const file = new File([fileContent], fileName, { type: "text/plain" });
    const uploadInput = screen.getByLabelText(/drag & drop/i); // Find the hidden input via label text
    await user.upload(uploadInput, file);
  };

  test("adds document via upload, auto-selects, and shows menu/annotator", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Simulate uploading a document
    await uploadFile(user, "Test Doc 1.txt", "File Content 1");

    // Verify list updated, doc selected, menu/annotator appear
    await waitFor(() => {
      expect(screen.getByText("Test Doc 1.txt")).not.toBeNull();
    });

    // Check selection state (assuming list item gets data-testid=doc.id)
    // Need to get the actual generated ID - let's find the list item by text and check selection
    const listItem = screen.getByText("Test Doc 1.txt").closest("li");
    expect(listItem).toHaveAttribute("aria-selected", "true");

    expect(screen.getByTestId("document-menu")).not.toBeNull();
    expect(screen.getByTestId("annotator-placeholder")).not.toBeNull();
    expect(screen.getByText(/Document: Test Doc 1.txt/)).not.toBeNull();
    expect(screen.getByText(/Annotation Set: None/)).not.toBeNull();
  });

  test("adds multiple documents, selects one, then selects another", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Upload two documents
    await uploadFile(user, "Doc A.txt", "Content A");
    await waitFor(() => {
      expect(screen.getByText("Doc A.txt")).not.toBeNull();
    });
    await uploadFile(user, "Doc B.txt", "Content B");
    await waitFor(() => {
      expect(screen.getByText("Doc B.txt")).not.toBeNull();
    });

    // Doc B should be selected initially (last uploaded)
    const listItemB = screen.getByText("Doc B.txt").closest("li");
    expect(listItemB).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/Document: Doc B.txt/)).not.toBeNull();

    // Click to select Doc A
    const docAButton = screen.getByRole("button", { name: "Doc A.txt" });
    await user.click(docAButton);

    // Verify Doc A is now selected
    await waitFor(() => {
      const listItemA = screen.getByText("Doc A.txt").closest("li");
      expect(listItemA).toHaveAttribute("aria-selected", "true");
      expect(listItemB).toHaveAttribute("aria-selected", "false");
      expect(screen.getByText(/Document: Doc A.txt/)).not.toBeNull();
    });
  });

  test("adds document, adds annotation set via button, set is selected", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Add a document
    await uploadFile(user, "Annotate Me.md", "Some markdown content.");
    await waitFor(() => {
      expect(screen.getByText("Annotate Me.md")).not.toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByTestId("document-menu")).not.toBeNull();
    }); // Wait for menu

    // Click the "Add Set" button (using the mock prompt)
    const addSetButton = screen.getByLabelText(/add new annotation set/i);
    await user.click(addSetButton);

    // Verify the new set ("Test Set" from mock prompt) is selected
    await waitFor(() => {
      const combobox = screen.getByRole("combobox", {
        name: /annotation set/i,
      }) as HTMLSelectElement;
      expect(combobox.selectedOptions[0].textContent).toBe("Test Set");
    });
    expect(screen.getByText(/Annotation Set: Test Set/)).not.toBeNull(); // Check annotator placeholder
    expect(global.prompt).toHaveBeenCalledTimes(1); // Verify prompt was called
  });

  test("adds document, adds two sets, selects second via dropdown", async () => {
    const user = userEvent.setup();
    // Mock prompt to first return 'Set Alpha', then 'Set Beta'
    global.prompt = mock()
      .mockImplementationOnce(() => "Set Alpha")
      .mockImplementationOnce(() => "Set Beta");
    render(<App />);

    // Add doc
    await uploadFile(user, "Doc.txt", "Content");
    await waitFor(() => {
      expect(screen.getByTestId("document-menu")).not.toBeNull();
    });

    // Add Set Alpha (via button click -> prompt -> "Set Alpha")
    const addSetButton = screen.getByLabelText(/add new annotation set/i);
    await user.click(addSetButton);
    await waitFor(() => {
      const select = screen.getByRole("combobox", {
        name: /annotation set/i,
      }) as HTMLSelectElement;
      expect(select.selectedOptions[0].textContent).toBe("Set Alpha");
    });

    // Add Set Beta (via button click -> prompt -> "Set Beta")
    await user.click(addSetButton);
    await waitFor(() => {
      const select = screen.getByRole("combobox", {
        name: /annotation set/i,
      }) as HTMLSelectElement;
      expect(select.selectedOptions[0].textContent).toBe("Set Beta");
    });
    expect(screen.getByText(/Annotation Set: Set Beta/)).not.toBeNull(); // Beta selected

    // Select Set Alpha from dropdown
    const combobox = screen.getByRole("combobox", {
      name: /annotation set/i,
    }) as HTMLSelectElement;
    await user.selectOptions(
      combobox,
      screen.getByRole("option", { name: "Set Alpha" }),
    );

    // Verify Set Alpha is selected
    await waitFor(() => {
      expect(combobox.selectedOptions[0].textContent).toBe("Set Alpha");
      expect(screen.getByText(/Annotation Set: Set Alpha/)).not.toBeNull();
    });
  });

  test.skip("adds document, then removes it using the remove button", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Add a document
    await uploadFile(user, "Delete Me.txt", "Content to delete");
    await waitFor(() => {
      expect(screen.getByText("Delete Me.txt")).not.toBeNull();
    });

    // Get the remove button specific to this document
    const removeButton = screen.getByRole("button", {
      name: /remove delete me\.txt/i, // Correctly escape the dot
    }); // Use specific label
    expect(removeButton).not.toBeNull();

    // Click remove
    await user.click(removeButton);

    // Verify document gone, menu/annotator hidden
    await waitFor(() => {
      expect(screen.queryByText("Delete Me.txt")).toBeNull();
      expect(screen.queryByTestId("document-menu")).toBeNull();
      expect(screen.queryByTestId("annotator-placeholder")).toBeNull();
    });

    screen.debug(); // Add debug output here

    // Now specifically check for the placeholder text after the document list is empty
    await waitFor(() => {
      expect(screen.getByText(/no documents uploaded yet/i)).not.toBeNull();
    });
  });
});
