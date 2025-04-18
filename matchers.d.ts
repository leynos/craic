// matchers.d.ts
// This file extends Bun's native `expect` matchers with
// the custom matchers provided by @testing-library/jest-dom.

// Import Bun's native Matchers type
import type {
  AsymmetricMatchers as BunAsymmetricMatchers,
  Matchers as BunMatchers,
} from "bun:test";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "bun:test" {
  // Extend Bun's native Matchers interface
  // Ensure the type parameter T matches the original BunMatchers signature.
  // TestingLibraryMatchers expects <MatcherResult, T>
  // Use `unknown` for MatcherResult if it's not critical, and keep T.
  interface Matchers<T> // Use the original T from BunMatchers<T>
    extends TestingLibraryMatchers<unknown, T> {}

  // Extend Bun's native AsymmetricMatchers interface
  // Use `unknown` here as well for simplicity, assuming asymmetric matchers don't rely heavily on the specific MatcherResult type.
  interface AsymmetricMatchers
    extends TestingLibraryMatchers<unknown, unknown> {}
}

// Ensure this file is included in your tsconfig.json's "include" array or
// discovered by default (e.g., by being in the root or src directory).
