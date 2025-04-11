import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";
import { afterAll, beforeAll } from "vitest";

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Mock FileReader
class MockFileReader {
  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;

  readonly EMPTY = MockFileReader.EMPTY;
  readonly LOADING = MockFileReader.LOADING;
  readonly DONE = MockFileReader.DONE;

  onload: ((this: FileReader, ev: Event) => void) | null = null;
  onerror: ((this: FileReader, ev: Event) => void) | null = null;
  onabort: ((this: FileReader, ev: Event) => void) | null = null;
  onloadstart: ((this: FileReader, ev: Event) => void) | null = null;
  onloadend: ((this: FileReader, ev: Event) => void) | null = null;
  onprogress: ((this: FileReader, ev: Event) => void) | null = null;
  readyState: 0 | 1 | 2 = MockFileReader.EMPTY;
  error: DOMException | null = null;
  result: string | ArrayBuffer | null = null;

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {}

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {}

  dispatchEvent(event: Event): boolean {
    return true;
  }

  abort() {}
  readAsArrayBuffer(blob: Blob) {}
  readAsBinaryString(blob: Blob) {}
  readAsDataURL(blob: Blob) {}
  readAsText(blob: Blob) {
    this.readyState = MockFileReader.LOADING;
    // Use the test content
    this.result = "test content";
    if (this.onload) {
      const event = new Event("load");
      Object.defineProperty(event, "target", { value: this });
      this.onload.call(this, event);
    }
    this.readyState = MockFileReader.DONE;
    if (this.onloadend) {
      const event = new Event("loadend");
      Object.defineProperty(event, "target", { value: this });
      this.onloadend.call(this, event);
    }
  }
}

global.FileReader = MockFileReader;

// Setup jsdom
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});

// Setup global variables
global.window = dom.window as unknown as Window & typeof globalThis;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

// Cleanup after each test
afterEach(() => {
  cleanup();
});
