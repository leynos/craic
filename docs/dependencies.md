# Dependency Decisions & Rationale

This document outlines the key libraries and tools chosen for this project and the reasoning behind their selection.

## Core Framework & UI

*   **React (`react`, `react-dom`):**
    *   **Rationale:** Industry-standard library for building interactive user interfaces with a component-based architecture. Provides a robust ecosystem and strong community support.
*   **TypeScript (`typescript`):**
    *   **Rationale:** Superset of JavaScript that adds static typing. Chosen to improve code quality, catch errors early during development, enhance maintainability, and improve developer experience through better autocompletion and code understanding.

## Build & Development Environment

*   **Vite (`vite`, `@vitejs/plugin-react`):**
    *   **Rationale:** Modern and extremely fast front-end build tool and development server. Offers near-instant Hot Module Replacement (HMR) and optimized builds, significantly improving the development workflow compared to older bundlers.

## Testing

*   **Bun Test:**
    *   **Rationale:** Fast and modern test runner offering a Jest-compatible API.
*   **React Testing Library (`@testing-library/react`, `@testing-library/jest-dom`):**
    *   **Rationale:** Provides utilities for testing React components in a way that resembles how users interact with them. Encourages writing tests that focus on user behavior and accessibility rather than implementation details. `@testing-library/jest-dom` adds helpful custom matchers for DOM assertions.
*   **JSDOM (`jsdom`):**
    *   **Rationale:** A JavaScript implementation of web standards (DOM, HTML) for use within Node.js. Required by the testing environment (`vitest` configured with `environment: "jsdom"`) to simulate a browser environment, allowing DOM manipulation and component rendering tests to run outside a real browser.

## Annotation Functionality

*   **RecogitoJS (`@recogito/recogito-js`):**
    *   **Version:** `^1.8.4`
    *   **Rationale:** A specialized JavaScript library specifically designed for text annotation tasks. Chosen for its focus on annotation features, providing the core functionality needed for selecting text and associating metadata (annotations) with it.

## State Management

*   **React Hooks (Built-in):**
    *   **Rationale:** Utilized for managing component-level and shared application state (`useState`, potentially `useContext` or custom hooks like `useDocumentManagement`, `useAnnotationManagement`). Sufficient for current application complexity.
*   **use-local-storage-state (`use-local-storage-state`):**
    *   **Rationale:** A custom React hook simplifying the process of persisting state (like uploaded documents or annotations) to the browser's Local Storage. Chosen for easily adding persistence without setting up a more complex state management library.

## Linting & Formatting

*   **Biome (`@biomejs/biome`):**
    *   **Rationale:** A fast, unified toolchain component handling both linting and formatting. Chosen to enforce code style consistency and identify potential code quality issues.

## Package Management & Script Running

*   **Bun:**
    *   **Rationale:** A fast, all-in-one JavaScript runtime, bundler, test runner, and package manager. Used for package management (`bun install`), running development server (`bun run dev`), building (`bun run build`), and executing tests (`bun test`).

## Dev Dependencies

*   **Purpose:** Used to parse the specific XML structure of text files produced by the OCR process (e.g., hOCR) into a JSON format suitable for rendering and interaction within the React application.
*   **Rationale:** Chosen for its performance, maturity, and ability to handle the specific XML formats expected from OCR outputs.

### `fast-xml-parser`

*   **Purpose:** Serializing and deserializing annotation data between its original (likely XML-based) structure and a JSON format suitable for storage in `localStorage`. Specifically handles conversion according to the BadgerFish convention.
*   **Rationale:** Selected for its efficiency and specific capability to handle the attribute-centric structure defined by the BadgerFish convention, which is required for the annotation storage mechanism. Ensures compliance with the defined JSON schema for annotations.