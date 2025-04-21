# Architecture & Design Decisions

This document outlines the key architectural patterns and design decisions made for this project.

## 1. Overall Architecture

*   **Client-Side Application:** The application is designed as a single-page application (SPA) running entirely in the user's browser. There is currently no dedicated backend component; all data (documents, annotations) is managed and persisted client-side.
*   **Framework:** React is used as the primary UI library for building the user interface declaratively using a component-based model.

## 2. Component Design

*   **Modular Components:** The UI is broken down into distinct, reusable components with specific responsibilities:
    *   `App.tsx`: The main application shell, responsible for overall layout, state management integration, and orchestrating the interaction between other major components.
    *   `DocumentUpload.tsx`: Handles the user interface and logic for uploading new documents.
    *   `DocumentMenu.tsx`: Manages the UI for selecting, adding, and removing annotation sets associated with a document.
    *   `MarkdownAnnotator.tsx`: Responsible for displaying document content (Markdown) and integrating the annotation functionality using `@recogito/recogito-js`.
*   **Separation of Concerns:** Components aim to encapsulate specific pieces of functionality (e.g., upload, annotation set management, annotation rendering).

## 3. State Management

*   **React Hooks:** The primary mechanism for state management relies on built-in React Hooks (`useState`) and custom hooks.
*   **Custom Hooks for Logic:** Business logic related to managing documents and annotations is encapsulated within custom hooks (`useDocumentManagement`, `useAnnotationManagement`). This promotes reusability and separates stateful logic from the UI components.
*   **Top-Level State:** Core application state (list of documents, selected document ID, annotation sets) is managed within the main `App.tsx` component and passed down as props to child components.
*   **Client-Side Persistence:** `use-local-storage-state` is employed to persist document and annotation data directly in the browser's Local Storage, providing data retention across sessions without a backend.

## 4. Annotation Handling

*   **External Library Integration:** The core text annotation functionality is delegated to the external library `@recogito/recogito-js`. This avoids reinventing complex annotation UI logic.
*   **Dedicated Component:** Integration with `@recogito/recogito-js` is localized within the `MarkdownAnnotator` component.
*   **Annotation Sets:** Annotations are organized into distinct "sets" per document, managed via the `useAnnotationManagement` hook and the `DocumentMenu` component.

## 5. Data Management

*   **State Management:** Zustand is used for managing global application state. Stores are organised by feature (`src/stores/`) and provide actions for state manipulation and selectors for accessing state slices.
*   **Client-Side Storage:**
    *   **User Settings:** Simple user preferences (like theme) are stored directly in `localStorage`.
    *   **Annotation Storage:**
        *   User-generated annotations are persisted in browser `localStorage` to ensure data retention across sessions and enable offline access.
        *   The storage format is JSON, specifically adhering to the BadgerFish convention. This conversion from the original annotation format (implied XML) is handled by the `fast-xml-parser` library using the options: `{ ignoreAttributes: false, attributeNamePrefix: '@', textNodeName: '$' }`.
        *   This approach was chosen to efficiently store potentially complex, attribute-heavy annotation structures within the limitations of JSON and `localStorage` while adhering to a defined schema (RecogitoJS Web Annotation BadgerFish subset).
        *   A dedicated module (`src/lib/annotation-storage.ts` - *to be created*) will encapsulate the logic for saving, loading, and parsing annotations to/from `localStorage`.
*   **API Interaction:** (If applicable) Data fetching and mutations involving a backend API will be handled using standard `fetch` or a dedicated library like `axios` or `tanstack-query`, with clear separation of concerns.

## 6. Testing Strategy

*   **Component Testing Focus:** Testing efforts primarily target individual components using `bun test` and `React Testing Library`.
*   **User-Centric Queries:** Tests prioritize querying the DOM using methods that simulate user interaction and rely on accessibility attributes (`getByRole`, `getByLabelText`, `getByText`) where possible.
*   **DOM Simulation:** Tests run in a simulated DOM environment (`happy-dom`) to allow rendering and interaction testing outside a real browser.
*   **Mocking:** Dependencies or browser APIs (like `FileReader`) are mocked as needed within the test setup (`src/test/setup.ts`).
*   **Test Execution:** `bun test` is the designated command for running the test suite.

## 7. Accessibility

*   **Semantic HTML & ARIA:** Emphasis is placed on using appropriate HTML elements and ARIA attributes (`aria-label`, `role`, `htmlFor`) to ensure components are accessible to assistive technologies.
*   **Testing Library Queries:** Utilizing Testing Library's accessibility-focused queries helps verify that components are perceivable and operable.

## 8. Build & Code Quality

*   **Build System:** Vite is used for its fast development server and optimized production builds.
*   **Static Typing:** TypeScript is used throughout the project to enhance code reliability and maintainability.
*   **Linting/Formatting:** Biome enforces code style and quality standards.

*   **`fast-xml-parser`:** Chosen for its ability to convert XML/JSON structures according to the specific BadgerFish convention required for serialising annotation data into `localStorage`. See [Annotation Storage](#annotation-storage) for details. 