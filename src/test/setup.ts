import '@testing-library/jest-dom'; // Add this back for DOM matchers
import { mock } from 'bun:test'; // Need mock again for FileReader

// --- Happy DOM Setup ---
import { GlobalRegistrator } from '@happy-dom/global-registrator';
// Removed manual setup
GlobalRegistrator.register(); // Use the registrator
// --- End Happy DOM Setup ---

// --- Global FileReader Mock ---
// Define the shape needed by tests
interface MockFileReaderInstance {
	readAsText: ReturnType<typeof mock>;
	result: string | ArrayBuffer | null;
	onload: (() => void) | null;
	onerror: (() => void) | null;
	addEventListener: ReturnType<typeof mock>;
	// Add other methods if needed, ensuring they are mocks
	removeEventListener: ReturnType<typeof mock>;
	abort: ReturnType<typeof mock>;
	readAsArrayBuffer: ReturnType<typeof mock>;
	readAsBinaryString: ReturnType<typeof mock>;
	readAsDataURL: ReturnType<typeof mock>;
	readyState: number;
	dispatchEvent: ReturnType<typeof mock>;
}

// Create a single instance shape used by the mock constructor
const simpleMockInstance: MockFileReaderInstance = {
	readAsText: mock(() => {}),
	result: '',
	onload: null,
	onerror: null,
	addEventListener: mock((event: string, callback: () => void) => {
		if (event === 'load') simpleMockInstance.onload = callback;
		if (event === 'error') simpleMockInstance.onerror = callback;
	}),
	removeEventListener: mock(() => {}),
	abort: mock(() => {}),
	readAsArrayBuffer: mock(() => {}),
	readAsBinaryString: mock(() => {}),
	readAsDataURL: mock(() => {}),
	readyState: 0,
	dispatchEvent: mock(() => {}),
};

// Assign a simple mock constructor to globalThis
globalThis.FileReader = mock(() => {
	// Return a *new copy* each time to help isolation if possible,
	// though tests might still need to access the one instance created
	// If tests *need* to manipulate the instance, this global mock is hard to work with.
	return { ...simpleMockInstance }; // Return a shallow copy
}) as any; // Use any to bypass constructor signature check
// --- End Global FileReader Mock ---

// Add any other global mocks or setup needed for tests below 