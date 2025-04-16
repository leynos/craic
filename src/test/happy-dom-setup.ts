import "@testing-library/jest-dom"; // Add this back for DOM matchers

// --- Happy DOM Setup ---
import { GlobalRegistrator } from "@happy-dom/global-registrator";
// Removed manual setup
GlobalRegistrator.register(); // Use the registrator
// --- End Happy DOM Setup ---

// Add any other global mocks or setup needed for tests below
