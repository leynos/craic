// src/test/module-mocks.ts
import { mock } from "bun:test";
import { useCallback, useEffect, useState } from "react";

// Simple in-memory store for use-local-storage-state mock
const localStorageState: Record<string, unknown> = {};

export const resetLocalStorageMock = () => {
  // Clear all stored values on the existing store object so closures see the cleared state
  for (const key of Object.keys(localStorageState)) {
    localStorageState[key] = undefined;
  }
};

// Mock implementation of useLocalStorageState
const mockUseLocalStorageState = <T>(
  key: string,
  options?: { defaultValue?: T },
): [
  T | undefined,
  (newState: T | ((prevState: T | undefined) => T)) => void,
] => {
  // Initialize state: try reading from mock store (asserting type), fallback to defaultValue
  const [state, setState] = useState<T | undefined>(() => {
    const storedValue = localStorageState[key];
    return storedValue !== undefined
      ? (storedValue as T)
      : options?.defaultValue;
  });

  const updateState = useCallback(
    (newState: T | ((prevState: T | undefined) => T)) => {
      // When updating, get the current state from the *mock store* and assert type
      const currentStoredValue = localStorageState[key] as T | undefined;
      const valueToStore =
        typeof newState === "function"
          ? (newState as (prevState: T | undefined) => T)(currentStoredValue)
          : newState;
      localStorageState[key] = valueToStore;
      setState(valueToStore);
    },
    [key],
  );

  // Effect to sync state if mock store was updated externally (less common in simple tests)
  useEffect(() => {
    if (localStorageState[key] !== undefined && state === undefined) {
      setState(localStorageState[key] as T);
    }
  }, [key, state]);

  return [state, updateState];
};

// Apply the mock
mock.module("use-local-storage-state", () => ({
  __esModule: true,
  default: mockUseLocalStorageState,
}));

// Mock for FileReader (if needed elsewhere, keep it simple)
// // ... existing FileReader mock if present ...

// Example: Simple FileReader mock if needed
// export const mockFileReader = {
//     readAsText: mock((file) => {
//         // Simulate async read completion
//         setTimeout(() => {
//             const mockEvent = { target: { result: file.content || 'mock content' } };
//             if (typeof mockFileReader.onload === 'function') {
//                 mockFileReader.onload(mockEvent);
//             }
//         }, 0);
//     }),
//     onload: null as ((event: any) => void) | null,
//     onerror: null as (() => void) | null,
// };

// // @ts-ignore
// global.FileReader = mock(() => mockFileReader);
