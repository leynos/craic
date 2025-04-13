# Project Requirements

This document outlines the functional and technical requirements identified during development.

## 1. Core Functionality

*   **Document Management:**
    *   Users should be able to upload documents (supported formats: .md, .txt).
    *   Users should be able to view a list of uploaded documents.
    *   Users should be able to select a document to view its content.
    *   Users should be able to remove uploaded documents.
*   **Annotation Management:**
    *   Users should be able to create and manage sets of annotations for each document.
    *   Users should be able to add new annotation sets.
    *   Users should be able to select an active annotation set.
    *   Users should be able to remove an existing annotation set.
    *   Users should be able to create annotations on the selected document within the context of the selected annotation set.

## 2. Component Requirements

*   **`DocumentUpload.tsx`:**
    *   Provide a clear area for users to click or drag-and-drop files.
    *   Display supported file formats.
    *   Handle file upload logic.
    *   Ensure the upload trigger area is fully accessible to screen readers and keyboard navigation.
*   **`DocumentMenu.tsx`:**
    *   Display available annotation sets for the selected document in a dropdown/select list.
    *   Allow users to select an annotation set from the list.
    *   Provide a button to add a new annotation set.
    *   Provide a button to remove the currently selected annotation set (visible only when a set is selected).
    *   Ensure all interactive elements (select list, buttons) are fully accessible (correct roles, labels, keyboard navigation).
*   **`MarkdownAnnotator.tsx`:**
    *   Display the content of the selected Markdown document.
    *   Allow users to select text within the document content.
    *   Provide a mechanism to create an annotation associated with the selected text and the currently active annotation set (integration with `@recogito/recogito-js`).
    *   Visually display existing annotations on the document content.
*   **`App.tsx`:**
    *   Integrate the `DocumentUpload`, `DocumentMenu`, and `MarkdownAnnotator` components.
    *   Manage the overall application state, including the list of documents, the currently selected document, annotation sets, and the currently selected annotation set.
    *   Conditionally render the `DocumentMenu` and `MarkdownAnnotator` only when a document is selected.

## 3. Technical & Testing Requirements

*   **State Management:** Implement robust state management for documents and annotations (e.g., using React hooks, potentially `use-local-storage-state` for persistence).
*   **Styling:** Utilize Tailwind CSS (v4) for utility-first styling to ensure consistency and rapid UI development.
*   **Testing Environment:**
    *   Configure a testing environment (using `vitest` and `jsdom`) capable of testing React components that interact with the DOM.
    *   Ensure tests accurately reflect component behavior and accessibility requirements.
    *   Resolve persistent failures in `DocumentMenu.test.tsx` related to querying elements via Testing Library (`getByRole`, `getByLabelText`), despite `screen.debug()` showing correct rendering.
    *   Use `bun test` (which delegates to `vitest`) for running tests
*   **Accessibility:** All interactive components must adhere to accessibility best practices (WCAG guidelines), including proper ARIA attributes, keyboard navigation, and screen reader compatibility.
*   **Build & Linting:** Maintain a consistent code style (using Biome) and ensure the project builds correctly (using Vite and TypeScript). Use `bun run lint` to run the linter on all files.
*   **Mocking:** Implement necessary mocks for testing, such as the `FileReader` interface in `src/test/setup.ts`, ensuring constants behave correctly as static and instance properties.