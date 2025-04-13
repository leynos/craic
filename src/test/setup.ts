import '@testing-library/jest-dom'; // Add this back for DOM matchers
import { mock } from 'bun:test'; // Import Bun's mock function

// --- Happy DOM Setup ---
import { GlobalRegistrator } from '@happy-dom/global-registrator';
// Removed manual setup
GlobalRegistrator.register(); // Use the registrator
// --- End Happy DOM Setup ---

// Removed FileReader Mock section

// Add any other global mocks or setup needed for tests below 