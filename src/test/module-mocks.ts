// src/test/module-mocks.ts
import { mock } from 'bun:test';
import { useState } from 'react';

// Export the store and a reset function
export let memoryStore: Record<string, unknown> = {}; // Use let and export

export const resetLocalStorageMock = () => {
	memoryStore = {}; // Reset the exported store
};

// Mock useLocalStorageState using bun's mock.module
mock.module('use-local-storage-state', () => {
	// Use the exported, resettable memoryStore
	const mockUseLocalStorageState = <T,>(
		key: string,
		options: { defaultValue: T }
	): [T, (newValue: T | ((prevState: T) => T)) => void] => {
		// Read from the module-level memoryStore
		const initialValue = key in memoryStore ? (memoryStore[key] as T) : options.defaultValue;
		const [value, setValue] = useState<T>(initialValue);

		const updateValue = (newValue: T | ((prevState: T) => T)) => {
			// Determine the current value reliably from the shared store
			const currentValue = key in memoryStore ? (memoryStore[key] as T) : options.defaultValue;

			const resolvedValue =
				typeof newValue === 'function'
					// Execute the updater function with the CURRENT value from the shared store
					? (newValue as (prevState: T) => T)(currentValue)
					: newValue;
			// Write the NEW value back to the store
			memoryStore[key] = resolvedValue;
			// Update the internal useState as well, so subsequent reads within the same hook instance get the latest value
			setValue(resolvedValue);
		};

		return [value, updateValue];
	};

	// The factory function for mock.module returns the exports object
	return {
		__esModule: true,
		default: mockUseLocalStorageState,
	};
});

// Add other module mocks here if needed later 