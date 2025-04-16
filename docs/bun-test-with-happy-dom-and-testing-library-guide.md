# **Guide: Component Testing in React with bun test, Happy DOM, and React Testing Library**

## **I. Introduction**

### **A. Purpose and Scope**

This guide provides comprehensive instructions for setting up and utilizing bun test, Bun's built-in test runner, in conjunction with Happy DOM and React Testing Library (RTL) to test React components. It focuses specifically on the integration patterns, configuration steps, and common testing techniques required for this particular stack. The goal is to equip developers and agentic LLM coding tools with the necessary knowledge to effectively write and run React component tests within the Bun ecosystem.

### **B. Target Audience and Prerequisites**

This guide is intended for developers and sophisticated LLM tools already familiar with React development and the fundamentals of component testing. It assumes prior knowledge of the basic bun test API (including describe, test/it, expect, matchers, skipping/focusing tests) as covered in introductory materials.1 Familiarity with React Testing Library's core principles is beneficial but key concepts will be explained.

### **C. Overview of the Technology Stack**

* **bun test**: A fast, Jest-compatible test runner integrated directly into the Bun runtime.2 It offers native support for TypeScript and JSX, snapshot testing, mocking, and lifecycle hooks.2 Its speed is often cited as a major advantage over traditional runners like Jest.6  
* **Happy DOM**: A JavaScript implementation of web browser APIs intended for testing purposes.12 It provides a simulated DOM environment (like document, window, etc.) necessary for rendering and interacting with React components outside a real browser. It is often noted for being faster than JSDOM.12  
* **@testing-library/react**: A library providing utilities specifically for testing React components in a user-centric way, encouraging tests that resemble how users interact with the application.15  
* **@testing-library/user-event**: A companion library to RTL that simulates user interactions (clicks, typing, etc.) more realistically than lower-level event firing mechanisms.16  
* **@testing-library/jest-dom**: Extends Jest-compatible matchers (like those used by bun test) with custom assertions specific to DOM nodes (e.g., toBeInTheDocument, toHaveAttribute).15

## **II. Setup and Configuration**

Setting up the environment correctly is crucial for running React component tests with bun test. This involves installing a DOM implementation (Happy DOM), configuring bun test to use it, installing React Testing Library, and ensuring TypeScript is properly configured.

### **A. Installing and Configuring Happy DOM**

React components need a Document Object Model (DOM) environment to render into. Since bun test runs in a server-side environment, a simulated DOM is required. While Jest commonly uses jsdom, jsdom currently has compatibility issues with Bun. This incompatibility stems from jsdom's reliance on internal V8 engine APIs, whereas Bun utilizes JavaScriptCore.19 Consequently, Happy DOM is the recommended alternative for DOM testing within the Bun ecosystem.13 Happy DOM provides a high-fidelity implementation of browser APIs suitable for testing.13

1. Install Happy DOM Registrator:  
   The @happy-dom/global-registrator package provides a convenient way to inject Happy DOM's APIs (document, window, location, etc.) into the global scope of the test environment. Install it as a development dependency:  
   Bash  
   bun add \-d @happy-dom/global-registrator

   13  
2. Create Happy DOM Setup Script:  
   Create a setup file (e.g., happydom.ts or test/setup/happydom.ts) that imports and executes the registrator. This script will make the necessary browser globals available before tests run.  
   TypeScript  
   // happydom.ts  
   import { GlobalRegistrator } from '@happy-dom/global-registrator';

   // Register Happy DOM APIs globally  
   GlobalRegistrator.register();

   // Optional: Configure Happy DOM settings if needed  
   // GlobalRegistrator.register({  
   //   url: 'http://localhost:3000',  
   //   width: 1920,  
   //   height: 1080,  
   // });

   10

### **B. Integrating Happy DOM with bun test**

Unlike testing frameworks like Jest or Vitest which might have configuration options like testEnvironment 19 or built-in environment support 24, Bun requires explicit configuration to load the DOM environment before tests execute. This is achieved using Bun's preload mechanism.

1. Configure bunfig.toml:  
   Bun uses the bunfig.toml file for configuration. To ensure the Happy DOM setup script runs before any test files, add or modify the \[test\] section in your bunfig.toml file (located at the project root) to include the path to your setup script in the preload array.  
   Ini, TOML  
   \# bunfig.toml

   \[test\]  
   \# Ensure this path correctly points to your Happy DOM setup script  
   preload \= \["./happydom.ts"\]

   10  
   The preload feature is Bun's designated method for running setup code prior to test execution.2 When bun test starts, it will first execute the scripts listed in the preload array, making the Happy DOM globals available to all subsequently loaded test files.

### **C. Installing React Testing Library Packages**

Install the necessary React Testing Library packages as development dependencies:

Bash

bun add \-d @testing-library/react @testing-library/user-event @testing-library/jest-dom @testing-library/dom

15

* @testing-library/react: Core library for testing React components.  
* @testing-library/user-event: For simulating user interactions (essential for realistic testing).16 Note: user-event requires @testing-library/dom as a peer dependency, which is usually resolved correctly when using framework wrappers like @testing-library/react, but it's good practice to install @testing-library/dom explicitly or ensure it's present.28  
* @testing-library/jest-dom: Provides DOM-specific custom matchers (e.g., .toBeInTheDocument()).17  
* @testing-library/dom: Provides core DOM querying utilities used by other RTL packages.

**Setting up jest-dom Matchers:**  
The custom matchers from @testing-library/jest-dom need to be explicitly added to Bun's expect function. This is typically done in a separate preload script.

1. Create Testing Library Setup Script:  
   Create another setup file (e.g., testing-library.ts or test/setup/testing-library.ts). This script imports the matchers and uses expect.extend to make them available in tests. It's also common practice to include the RTL cleanup function here to run after each test, resetting the DOM state.  
   TypeScript  
   // testing-library.ts  
   import { afterEach, expect } from 'bun:test'; // Import from bun:test  
   import { cleanup } from '@testing-library/react';  
   import \* as matchers from '@testing-library/jest-dom/matchers';

   // Extend Bun's expect with jest-dom matchers  
   expect.extend(matchers);

   // Optional: Run cleanup after each test automatically  
   // See Caveats section regarding potential issues with global cleanup and \`screen\`  
   afterEach(() \=\> {  
     cleanup();  
   });

   17  
2. Update bunfig.toml:  
   Add the new setup script to the preload array in bunfig.toml. Ensure the Happy DOM script is loaded first.  
   Ini, TOML  
   \# bunfig.toml

   \[test\]  
   \# Preload Happy DOM first, then Testing Library setup  
   preload \= \["./happydom.ts", "./testing-library.ts"\]

   17

This manual setup contrasts with Jest's setupFilesAfterEnv or Vitest's configuration options, highlighting a key difference in how Bun handles test environment preparation.19 The preload mechanism is essential for integrating external libraries like Happy DOM and extending core functionalities like expect.

### **D. TypeScript Configuration**

When using TypeScript, additional configuration is needed to ensure the compiler recognizes DOM types and the custom Jest-DOM matchers.

1. DOM Library Reference:  
   In test files that interact with the DOM (using document, window, etc.), TypeScript might raise errors like "Cannot find name 'document'".13 This happens because the standard Node.js/Bun environment doesn't inherently include browser types. To fix this, add a triple-slash directive at the top of each relevant test file:  
   TypeScript  
   /// \<reference lib="dom" /\>

   import { test, expect } from 'bun:test';  
   //... rest of the test file

   13  
   This directive explicitly instructs the TypeScript compiler to include the standard dom library type definitions for that file, resolving the type errors.13 Alternatively, you could add "dom" to the lib array in your tsconfig.json's compilerOptions to apply it globally, but the triple-slash directive offers more granular control.  
2. Jest-DOM Matcher Types:  
   While expect.extend adds the matchers at runtime, TypeScript needs corresponding type definitions for static analysis and editor autocompletion. Create a declaration file (e.g., matchers.d.ts, global.d.ts, or any .d.ts file included by your tsconfig.json) and use declaration merging to extend Bun's Matchers interface:  
   TypeScript  
   // matchers.d.ts (or any.d.ts file included by tsconfig.json)  
   import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';  
   // Import Bun's native Matchers type  
   import type { Matchers, AsymmetricMatchers } from 'bun:test';

   declare module 'bun:test' {  
     // Extend Bun's native Matchers interface  
     interface Matchers\<T\>  
       extends TestingLibraryMatchers\<typeof expect.stringContaining, T\> {}

     // Extend Bun's native AsymmetricMatchers interface (if needed for asymmetric matchers)  
     // Adjust the generic types if more specific ones are needed for asymmetric matchers  
     interface AsymmetricMatchers extends TestingLibraryMatchers\<any, any\> {}  
   }

   17  
   This tells TypeScript that instances of expect() in bun:test now also have the methods defined in @testing-library/jest-dom/matchers. Ensure this file is picked up by your TypeScript configuration (usually automatic if placed within the source directory or explicitly included in tsconfig.json).  
3. tsconfig.json Types:  
   Depending on your project setup, you might need to explicitly include necessary types in your tsconfig.json compilerOptions. This ensures TypeScript recognizes types from Bun, the DOM, and Testing Library:  
   JSON  
   // tsconfig.json (compilerOptions section)  
   {  
     "compilerOptions": {  
       //... other options  
       "lib":, // Ensure DOM is included  
       "types":  
       //... other options  
     }  
   }

   18 Including "bun-types" is crucial for Bun projects.

## **III. Core Testing Patterns with React Testing Library**

With the environment configured, you can start writing tests using standard React Testing Library patterns.

### **A. Rendering Components**

The first step in testing a component is rendering it into the simulated DOM provided by Happy DOM.

1. **Basic Rendering:** Use the render function exported by @testing-library/react.  
   TypeScript  
   /// \<reference lib="dom" /\>  
   import { test, expect } from 'bun:test';  
   import { render } from '@testing-library/react';  
   import MyComponent from './MyComponent';

   test('should render MyComponent', () \=\> {  
     render(\<MyComponent /\>);  
     // Component is now rendered into Happy DOM's document  
     // Proceed with querying and assertions...  
   });

   10  
2. **Using screen:** RTL exports a screen object which has all query methods pre-bound to the document.body. Using screen is generally recommended as it simplifies tests by avoiding the need to destructure queries from the render result each time.32  
   TypeScript  
   /// \<reference lib="dom" /\>  
   import { test, expect } from 'bun:test';  
   import { render, screen } from '@testing-library/react'; // Import screen  
   import MyComponent from './MyComponent';

   test('should render button using screen', () \=\> {  
     render(\<MyComponent /\>);  
     const buttonElement \= screen.getByRole('button', { name: /click me/i });  
     expect(buttonElement).toBeInTheDocument();  
   });

   **Note:** Be aware of the potential conflict between using the global screen object and having afterEach(cleanup) in a preloaded setup script (see Caveats section).  
3. **Custom Render Functions:** For components requiring context (like themes, routing, or state management providers), it's common practice to create a custom render function. This function wraps the rendered UI with the necessary providers. Define this in a utility file (e.g., test-utils.tsx) and use it instead of the default render.  
   TypeScript  
   // test-utils.tsx (Conceptual Example)  
   import React, { ReactElement } from 'react';  
   import { render, RenderOptions } from '@testing-library/react';  
   import { ThemeProvider } from './ThemeProvider'; // Example provider  
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Example provider

   const queryClient \= new QueryClient();

   const AllTheProviders \= ({ children }: { children: React.ReactNode }) \=\> {  
     return (  
       \<QueryClientProvider client={queryClient}\>  
         \<ThemeProvider\>  
           {children}  
         \</ThemeProvider\>  
       \</QueryClientProvider\>  
     );  
   };

   const customRender \= (  
     ui: ReactElement,  
     options?: Omit\<RenderOptions, 'wrapper'\>  
   ) \=\> render(ui, { wrapper: AllTheProviders,...options });

   // Re-export everything from RTL  
   export \* from '@testing-library/react';  
   // Override render method  
   export { customRender as render };

   // In your test file:  
   // import { render, screen } from './test-utils'; // Import from your utility file

   10

### **B. Querying the DOM**

React Testing Library provides various queries to find elements, prioritizing methods that users would employ (like finding by role, label, or text).

1. **Query Variants:**  
   * getBy\*: Finds a matching element or throws an error if none or multiple are found. Use for asserting an element *must* exist.  
   * queryBy\*: Finds a matching element or returns null if none is found. Throws if multiple are found. Use for asserting an element does *not* exist.  
   * findBy\*: Returns a Promise that resolves when a matching element is found or rejects after a timeout if none or multiple are found. Use for elements that appear asynchronously. 23  
2. **Common Selectors (Query Priorities):**  
   * ByRole: Queries elements by their ARIA role. This is the most preferred query as it aligns closely with accessibility and how users (and assistive technologies) perceive the UI. Use the name option to query by accessible name.15 *Performance Note:* getByRole, especially with the name option, can be slower than other queries on large DOM trees.38  
   * ByLabelText: Finds form elements associated with a \<label\>.  
   * ByPlaceholderText: Finds form elements by their placeholder attribute.  
   * ByText: Finds elements by their text content. Suitable for non-interactive elements like div, span, p. Can use strings, regex, or functions.  
   * ByDisplayValue: Finds form elements (input, textarea, select) by their current displayed value.  
   * ByAltText: Finds images by their alt text.  
   * ByTitle: Finds elements by their title attribute.  
   * ByTestId: Queries by the data-testid attribute. Use this as a last resort when semantic queries are not feasible or practical.37  
3. **Example Queries:**  
   TypeScript  
   /// \<reference lib="dom" /\>  
   import { test, expect } from 'bun:test';  
   import { render, screen } from '@testing-library/react';  
   import MyForm from './MyForm'; // Assume MyForm has inputs, labels, button

   test('queries various elements in the form', () \=\> {  
     render(\<MyForm /\>);

     // Preferred: ByRole  
     const usernameInput \= screen.getByRole('textbox', { name: /username/i });  
     const submitButton \= screen.getByRole('button', { name: /submit/i });  
     expect(usernameInput).toBeInTheDocument();  
     expect(submitButton).toBeInTheDocument();

     // ByLabelText  
     const passwordInput \= screen.getByLabelText(/password/i);  
     expect(passwordInput).toBeInTheDocument();

     // ByPlaceholderText  
     const emailInput \= screen.getByPlaceholderText(/enter your email/i);  
     expect(emailInput).toBeInTheDocument();

     // ByText (for a non-interactive element maybe)  
     const formTitle \= screen.getByText(/login form/i);  
     expect(formTitle).toBeInTheDocument();

     // ByTestId (last resort)  
     const formContainer \= screen.getByTestId('login-form-container');  
     expect(formContainer).toBeInTheDocument();

     // queryBy\* for absence check  
     const errorMessage \= screen.queryByRole('alert');  
     expect(errorMessage).not.toBeInTheDocument();  
   });

### **C. Simulating User Interactions**

@testing-library/user-event is the recommended library for simulating user interactions because it more closely mimics actual browser event sequences compared to the lower-level fireEvent.16

1. **Setup:** In user-event v14 and later, it's recommended to create a user instance using userEvent.setup() before rendering the component.16  
2. **Asynchronous Nature:** **Crucially, all interaction methods in user-event v14+ (e.g., click, type, keyboard, hover) return Promises and *must* be awaited using await**.16 Forgetting to await these interactions is a frequent cause of tests failing unexpectedly or exhibiting timing issues, often leading to misleading act warnings.  
3. **Common Interactions:**  
   * **Clicking:** await user.click(element)  
   * **Typing:** await user.type(inputElement, 'text to type'). Supports special key descriptors like {enter}, {backspace}, {arrowleft}.43  
   * **Keyboard:** await user.keyboard('foo{enter}') for more complex sequences.  
   * **Hovering:** await user.hover(element) / await user.unhover(element)  
   * **Selecting Options:** await user.selectOptions(selectElement, 'value')  
4. **Example:**  
   TypeScript  
   /// \<reference lib="dom" /\>  
   import { test, expect, mock } from 'bun:test'; // Use mock from bun:test  
   import { render, screen } from '@testing-library/react';  
   import userEvent from '@testing-library/user-event';  
   import InteractiveForm from './InteractiveForm'; // Assume form with input and button

   test('submits form when button is clicked after typing', async () \=\> {  
     const user \= userEvent.setup(); // 1\. Setup user instance  
     const handleSubmit \= mock(() \=\> {}); // Use bun:test mock

     render(\<InteractiveForm onSubmit={handleSubmit} /\>);

     const input \= screen.getByRole('textbox', { name: /message/i });  
     const button \= screen.getByRole('button', { name: /send/i });

     // 2\. Await user interactions  
     await user.type(input, 'Hello Bun\!');  
     await user.click(button);

     // 3\. Assert outcome  
     expect(handleSubmit).toHaveBeenCalledTimes(1);  
     expect(handleSubmit).toHaveBeenCalledWith('Hello Bun\!');  
     expect(input).toHaveValue(''); // Assuming form clears on submit  
   });

   16

### **D. Handling Asynchronous Operations**

React components often perform asynchronous tasks like fetching data, setting timeouts, or waiting for animations. Testing Library provides utilities to handle these scenarios gracefully.

1. **Why Async Utilities are Needed:** When an interaction triggers an async operation (e.g., clicking a button fetches data), the DOM doesn't update instantly. Tests need to wait for these operations to complete and the component to re-render before making assertions.34  
2. **findBy\* Queries:** These are the preferred method for waiting for an element to *appear* in the DOM asynchronously. They combine getBy\* with waitFor logic, returning a Promise that resolves when the element is found.34  
   TypeScript  
   // Example: Wait for data to load and display  
   test('displays user data after loading', async () \=\> {  
     const user \= userEvent.setup();  
     render(\<UserProfileLoader userId="123" /\>);

     // Initially, loading state might be shown  
     expect(screen.getByText(/loading/i)).toBeInTheDocument();

     // findByRole waits for the heading to appear  
     const userNameHeading \= await screen.findByRole('heading', { name: /user name:/i });  
     expect(userNameHeading).toBeInTheDocument();  
     expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(); // Loading indicator gone  
   });  
   34  
3. **waitFor Utility:** Use waitFor when you need to wait for an expectation *other than an element appearing* to become true. It repeatedly calls the provided callback function until it no longer throws an error or the timeout is reached. Common use cases include waiting for an element to *disappear*, waiting for a mock function to be called, or waiting for a specific attribute/text content to change.17  
   TypeScript  
   // Example: Wait for mock function call after button click  
   test('calls api on submit', async () \=\> {  
       const user \= userEvent.setup();  
       const mockApiCall \= mock(async () \=\> ({ success: true }));  
       render(\<MyForm apiCall={mockApiCall} /\>);

       await user.type(screen.getByRole('textbox'), 'data');  
       await user.click(screen.getByRole('button', { name: /submit/i }));

       // Wait for the mock function to have been called  
       await waitFor(() \=\> {  
         expect(mockApiCall).toHaveBeenCalledTimes(1);  
       });

       // Example: Wait for loading spinner to disappear  
       await waitFor(() \=\> {  
           expect(screen.queryByRole('status', { name: /loading/i })).not.toBeInTheDocument();  
       });  
   });  
   21  
4. **Understanding act:**  
   * The act utility from React ensures that all updates related to rendering and effects are processed and applied to the DOM before assertions are made.46  
   * **Implicit act Wrapping:** React Testing Library's core APIs, including render, fireEvent, and importantly, the methods provided by @testing-library/user-event (like click, type), are **already wrapped in act** internally.32  
   * **Explicit act is Usually Unnecessary:** Because RTL handles the wrapping, you typically **do not** need to manually wrap render or user-event calls in act.  
   * **act Warnings:** If you encounter warnings like Warning: An update to... inside a test was not wrapped in act(...), it's often **not** because you forgot to wrap an RTL call in act. Instead, it usually indicates that an asynchronous operation (like a state update triggered by an await user.click(), a fetch call, or a setTimeout) completed *after* the test finished or between assertions, without the test properly waiting for it. The solution is typically to use await correctly with user-event methods and employ findBy\* or waitFor to wait for the expected outcome, rather than adding more act wrappers.32 Explicit act might only be needed in rare cases involving manual state updates outside of standard RTL interactions.

The combination of await for user-event interactions and the use of findBy\* / waitFor for asynchronous assertions forms the foundation for reliable testing of dynamic React components. Misunderstanding the asynchronous nature of user-event v14+ and the role of waitFor is a common pitfall.

## **IV. Caveats and Considerations**

While bun test, Happy DOM, and RTL provide a powerful testing stack, developers should be aware of certain limitations and differences compared to other environments like Jest/JSDOM.

### **A. Happy DOM vs. JSDOM Differences**

* **Implementation Variations:** Happy DOM and JSDOM are distinct implementations of web APIs. While both aim to simulate a browser, they may differ in their coverage of specific APIs, edge-case behaviors, or performance characteristics.14 Happy DOM is generally considered faster but potentially less comprehensive in its emulation compared to the more established JSDOM.12 Tests relying on niche or very specific browser behaviors might yield different results between the two environments.  
* **Recommendation:** For most component testing scenarios focused on user interaction and rendering logic, Happy DOM is sufficient and offers performance benefits. However, if absolute browser fidelity across a wide range of APIs is critical, supplementing component tests with end-to-end tests using tools like Playwright or Cypress in real browsers is advisable.14

### **B. Performance Considerations**

* **Test Runner Speed:** bun test is generally significantly faster than Jest, primarily due to its integration with the Bun runtime (written in Zig) and optimizations like native code for expect matchers.6 This can lead to much quicker feedback cycles, especially in large projects or CI environments.  
* **DOM Speed:** Happy DOM often benchmarks faster than JSDOM for common DOM operations like parsing and querying.12  
* **React Testing Library Query Speed:** Some RTL queries, notably getByRole (especially when filtering by name), can be computationally intensive and may impact test speed, particularly when used inside waitFor loops on complex component trees.38 This performance characteristic is inherent to the query's accessibility checks and DOM traversal, not specific to Bun or Happy DOM, but it's worth noting. If performance issues arise, consider using less complex queries within waitFor or exploring options like { hidden: true } for getByRole if appropriate.38 Some users have reported general slowness with RTL, potentially related to the overhead of DOM simulation.40

### **C. Known Issues & Workarounds**

* **Global cleanup and screen Conflict:** A known issue exists where using afterEach(cleanup) defined in a **preloaded setup script** (via bunfig.toml) conflicts with using the globally imported screen object from RTL. Tests using screen may fail with errors like "TypeError: For queries bound to document.body a global document has to be available...".50 This likely occurs because the global cleanup interferes with how screen is bound or re-evaluated between tests.  
  * **Workarounds:**  
    1. Avoid using the global screen. Instead, destructure the query functions directly from the result of the render call within each test: const { getByRole, findByText } \= render(\<MyComponent /\>);. 50  
    2. Define afterEach(cleanup) within individual test files or a shared utility file imported by tests, rather than relying on the global preload mechanism for cleanup.  
    3. Monitor relevant GitHub issues for official fixes (e.g., RTL \#1348 50, Bun \#16926 52, Bun \#17138 51).  
* **getByRole / getByText Interaction Issue:** There have been reports of potential conflicts when using both getByRole and getByText within the same test case when running under Bun/Happy DOM, leading to unexpected failures.36 If encountered, consider separating assertions or using alternative queries. Monitor Bun issue \#10282 36 for updates.  
* **Timer Mocking Limitations:** While Bun provides setSystemTime for mocking Date objects and the system clock 53, comprehensive Jest-style timer mocking (controlling setTimeout, setInterval using jest.useFakeTimers(), jest.runAllTimers(), etc.) has historically been limited or incomplete in bun test.8 Workarounds involve using external libraries like SinonJS (@sinonjs/fake-timers) 57 or community utilities.58 Check the latest Bun documentation (bun:test Date/Time section) for the current status of native timer mocking support, as this area is under development.  
* **act Warnings:** As previously mentioned, act warnings usually signal unawaited asynchronous operations (user-event calls, findBy\*, waitFor) rather than a need to wrap RTL utilities in act.32 Ensure all promises returned by user-event and async queries/utilities are properly awaited.

### **D. Bun Test Runner vs. Jest**

* **Compatibility:** Bun aims for Jest compatibility, allowing many Jest test suites to run with minimal changes by simply using the bun test command.1 However, compatibility is not 100%.2 Some matchers (e.g., expect().toHaveReturned() 19) or advanced Jest features might be missing or behave differently. Always consult the official Bun documentation for the latest compatibility status.19  
* **Configuration:** Bun favors CLI flags and the bunfig.toml file over Jest's comprehensive jest.config.js or package.json configuration.19 Many Jest options have direct Bun equivalents (often CLI flags), while others become obsolete due to Bun's built-in features (like native TS/JSX transpilation removing the need for transform).19  
  **Table: Jest Configuration vs. Bun Equivalents**

| Jest Option (jest.config.js) | Bun Equivalent | Notes |
| :---- | :---- | :---- |
| \`bail: number \\ | boolean\` | bun test \--bail or bun test \--bail=\<number\> |
| collectCoverage: boolean | bun test \--coverage | CLI flag 19 |
| testTimeout: number | bun test \--timeout \<milliseconds\> | CLI flag (Note: Bun docs also mention \--test-timeout) 19 |
| testEnvironment: string | Manual setup via preload in bunfig.toml (e.g., using Happy DOM) | Bun doesn't have direct testEnvironment equivalent 19 |
| setupFilesAfterEnv: string | preload array in bunfig.toml (\[test\] section) | Used for running setup scripts before tests 17 |
| transform: object | Not needed for TS/JSX (built-in). Use Bun Plugins for other file types. | Obsolete due to native transpilation 19 |
| watchman, watchPlugins | bun test \--watch | CLI flag for watch mode 19 |
| verbose: boolean | logLevel \= "debug" in bunfig.toml (\[test\] section) | Configuration file setting 19 |
| extensionsToTreatAsEsm | No direct equivalent mentioned; Bun handles ESM/CJS interop. | Potentially obsolete 19 |
| haste | Not used; Bun uses its own internal source maps. | Obsolete 19 |

* **Globals:** While Bun supports Jest-style global functions (describe, test, expect, etc.) often without explicit imports through internal transpilation, it doesn't inject them into the global scope in the same way Jest does.1 Explicitly importing these from bun:test is clearer and recommended.10  
  TypeScript  
  import { describe, test, expect, afterEach } from 'bun:test';

## **V. Complete Example**

This section provides a complete example demonstrating the setup and testing of a simple React Counter component using bun test, Happy DOM, and React Testing Library.  
**1\. Project Setup Files:**

* **package.json (Dependencies):**  
  JSON  
  {  
    "name": "bun-rtl-example",  
    "module": "index.ts",  
    "type": "module",  
    "devDependencies": {  
      "@happy-dom/global-registrator": "^14.0.0", // Use appropriate version  
      "@testing-library/dom": "^10.0.0",  
      "@testing-library/jest-dom": "^6.0.0",  
      "@testing-library/react": "^16.0.0",  
      "@testing-library/user-event": "^14.0.0",  
      "@types/react": "^18.0.0",  
      "@types/react-dom": "^18.0.0",  
      "bun-types": "latest", // Or specific version  
      "react": "^18.0.0",  
      "react-dom": "^18.0.0",  
      "typescript": "^5.0.0"  
    },  
    "peerDependencies": {  
      "typescript": "^5.0.0"  
    }  
  }

  *(Install with bun install)*  
* **tsconfig.json:**  
  JSON  
  {  
    "compilerOptions": {  
      "lib":,  
      "jsx": "react-jsx",  
      "module": "ESNext",  
      "moduleResolution": "bundler",  
      "target": "ESNext",  
      "strict": true,  
      "esModuleInterop": true,  
      "skipLibCheck": true,  
      "forceConsistentCasingInFileNames": true,  
      "types": \["bun-types", "@testing-library/jest-dom"\] // Include necessary types  
    },  
    "include": \["src", "test", "matchers.d.ts"\], // Ensure matcher types file is included  
    "exclude": \["node\_modules"\]  
  }

* **happydom.ts:** (Place in project root or adjust path in bunfig.toml)  
  TypeScript  
  import { GlobalRegistrator } from '@happy-dom/global-registrator';  
  GlobalRegistrator.register();

* **testing-library.ts:** (Place in project root or adjust path in bunfig.toml)  
  TypeScript  
  import { afterEach, expect } from 'bun:test';  
  import { cleanup } from '@testing-library/react';  
  import \* as matchers from '@testing-library/jest-dom/matchers';

  expect.extend(matchers);

  // NOTE: Using global cleanup via preload can conflict with \`screen\`.  
  // Consider removing this line and adding \`afterEach(cleanup)\` to test files  
  // or using destructured queries from \`render\` instead of \`screen\`.  
  // afterEach(() \=\> {  
  //   cleanup();  
  // });

* **bunfig.toml:** (Place in project root)  
  Ini, TOML  
  \[test\]  
  preload \= \["./happydom.ts", "./testing-library.ts"\]

* **matchers.d.ts:** (Place in project root or src)  
  TypeScript  
  import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';  
  import type { Matchers, AsymmetricMatchers } from 'bun:test';

  declare module 'bun:test' {  
    interface Matchers\<T\>  
      extends TestingLibraryMatchers\<typeof expect.stringContaining, T\> {}  
    interface AsymmetricMatchers extends TestingLibraryMatchers\<any, any\> {}  
  }

**2\. React Component (src/Counter.tsx):**

TypeScript

import React, { useState, useCallback } from 'react';

function Counter() {  
  const \[count, setCount\] \= useState(0);

  const increment \= useCallback(() \=\> {  
    setCount((c) \=\> c \+ 1);  
  },);

  const incrementAsync \= useCallback(async () \=\> {  
    // Simulate async operation  
    await new Promise(resolve \=\> setTimeout(resolve, 50));  
    setCount((c) \=\> c \+ 1);  
  },);

  return (  
    \<div\>  
      \<h1\>Counter\</h1\>  
      \<p\>Current count: {count}\</p\>  
      \<button onClick={increment}\>Increment\</button\>  
      \<button onClick={incrementAsync}\>Increment Async\</button\>  
    \</div\>  
  );  
}

export default Counter;

**3\. Test File (test/Counter.test.tsx):**

TypeScript

/// \<reference lib="dom" /\>  
import { describe, test, expect, afterEach } from 'bun:test'; // Import Bun test functions  
import { render, screen, waitFor, cleanup } from '@testing-library/react'; // Import RTL functions  
import userEvent from '@testing-library/user-event'; // Import user-event

import Counter from '../src/Counter'; // Import the component

// Add cleanup locally if not using global preload cleanup due to 'screen' conflict  
afterEach(cleanup);

describe('Counter Component', () \=\> {  
  test('should render initial count and buttons', () \=\> {  
    render(\<Counter /\>);

    // Use screen to query elements (or destructured queries if avoiding screen)  
    expect(screen.getByRole('heading', { name: /counter/i })).toBeInTheDocument();  
    expect(screen.getByText(/current count: 0/i)).toBeInTheDocument();  
    expect(screen.getByRole('button', { name: /increment$/i })).toBeInTheDocument();  
    expect(screen.getByRole('button', { name: /increment async/i })).toBeInTheDocument();  
  });

  test('should increment count when Increment button is clicked', async () \=\> {  
    const user \= userEvent.setup(); // Setup user instance  
    render(\<Counter /\>);

    const incrementButton \= screen.getByRole('button', { name: /increment$/i });

    await user.click(incrementButton); // Await the click

    // Assert the count updated  
    expect(screen.getByText(/current count: 1/i)).toBeInTheDocument();  
  });

   test('should increment count when Increment Async button is clicked', async () \=\> {  
    const user \= userEvent.setup();  
    render(\<Counter /\>);

    const incrementAsyncButton \= screen.getByRole('button', { name: /increment async/i });

    await user.click(incrementAsyncButton); // Await the async click interaction

    // Use findBy\* or waitFor to handle the asynchronous update  
    const updatedCount \= await screen.findByText(/current count: 1/i);  
    expect(updatedCount).toBeInTheDocument();

    // Alternatively, using waitFor for the assertion  
    // await waitFor(() \=\> {  
    //   expect(screen.getByText(/current count: 1/i)).toBeInTheDocument();  
    // });  
  });

  test('should increment count multiple times', async () \=\> {  
    const user \= userEvent.setup();  
    render(\<Counter /\>);

    const incrementButton \= screen.getByRole('button', { name: /increment$/i });

    await user.click(incrementButton);  
    await user.click(incrementButton);

    expect(screen.getByText(/current count: 2/i)).toBeInTheDocument();  
  });  
});

**4\. Running the Tests:**  
Execute the tests from your project root directory:

Bash

bun test

This command will use bunfig.toml to preload the setup scripts, discover the Counter.test.tsx file, and run the tests within the Happy DOM environment.

## **VI. Conclusion**

Testing React components using bun test, Happy DOM, and React Testing Library presents a modern, high-performance approach. The integration leverages Bun's speed and built-in capabilities for TypeScript/JSX, combined with the robust, user-centric testing paradigm of React Testing Library.  
The setup process requires careful configuration, particularly the manual preloading of Happy DOM via bunfig.toml due to jsdom incompatibility 19 and the need to extend Bun's expect with jest-dom matchers.17 TypeScript users must also ensure DOM library types are referenced (/// \<reference lib="dom" /\>) 13 and matcher types are declared.17  
Core testing involves standard RTL patterns: rendering components, querying the DOM using semantic selectors (getByRole, getByText, etc.), and simulating user interactions with user-event. A key consideration is the asynchronous nature of user-event v14+, necessitating the use of await for interactions 16 and findBy\* or waitFor for handling subsequent asynchronous updates.34  
Developers should remain aware of potential caveats, including subtle behavioral differences between Happy DOM and JSDOM/real browsers 14, performance characteristics of certain RTL queries 38, and known issues like the conflict between global cleanup and the screen object when using preload.50 Furthermore, while Bun aims for Jest compatibility, some features or matchers may still be missing or behave differently.10  
Overall, this stack offers significant speed advantages and a streamlined developer experience once configured correctly. By following the setup steps and understanding the core patterns and caveats outlined in this guide, developers and LLM tools can effectively implement reliable and efficient React component tests within the Bun ecosystem. It is recommended to consult the official Bun and Testing Library documentation for the latest updates and features.

#### **Works cited**

1. Writing tests – Test runner | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs/test/writing](https://bun.sh/docs/test/writing)  
2. bun test – Test runner | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs/cli/test](https://bun.sh/docs/cli/test)  
3. What is Bun? | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs](https://bun.sh/docs)  
4. Understanding Bun's testing environment \- Mastering Bun: The Ultimate Guide to the Modern JavaScript Runtime | StudyRaid, accessed on April 13, 2025, [https://app.studyraid.com/en/read/11127/344669/understanding-buns-testing-environment](https://app.studyraid.com/en/read/11127/344669/understanding-buns-testing-environment)  
5. \`bun test\` | Bun中文文档, accessed on April 13, 2025, [https://www.bunjs.cn/docs/cli/test](https://www.bunjs.cn/docs/cli/test)  
6. Bun's Test Runner: The Future of JavaScript Testing? \- The Green Report, accessed on April 13, 2025, [https://www.thegreenreport.blog/articles/buns-test-runner-the-future-of-javascript-testing/buns-test-runner-the-future-of-javascript-testing.html](https://www.thegreenreport.blog/articles/buns-test-runner-the-future-of-javascript-testing/buns-test-runner-the-future-of-javascript-testing.html)  
7. Major improvements after dropping Node+Jest in favor of Bun Test (production) \- Reddit, accessed on April 13, 2025, [https://www.reddit.com/r/node/comments/18rdwtu/major\_improvements\_after\_dropping\_nodejest\_in/](https://www.reddit.com/r/node/comments/18rdwtu/major_improvements_after_dropping_nodejest_in/)  
8. Is Bun Ready for Unit Testing in 2024? \- JS 2 brain\!, accessed on April 13, 2025, [https://js2brain.com/blog/is-bun-ready-for-unit-testing](https://js2brain.com/blog/is-bun-ready-for-unit-testing)  
9. Bun vs Node Benchmark \- no one cares about speed as much as your CI does, accessed on April 13, 2025, [https://news.ycombinator.com/item?id=35034050](https://news.ycombinator.com/item?id=35034050)  
10. How do you migrate to bun test using @testing-library/react? No docs? \#8559 \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/discussions/8559](https://github.com/oven-sh/bun/discussions/8559)  
11. Comparing Bun with Jest \- Mastering Bun: The Ultimate Guide to the Modern JavaScript Runtime | StudyRaid, accessed on April 13, 2025, [https://app.studyraid.com/en/read/11127/344668/comparing-bun-with-jest](https://app.studyraid.com/en/read/11127/344668/comparing-bun-with-jest)  
12. happy-dom \- NPM, accessed on April 13, 2025, [https://www.npmjs.com/package/happy-dom](https://www.npmjs.com/package/happy-dom)  
13. DOM testing – Test runner | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs/test/dom](https://bun.sh/docs/test/dom)  
14. jsdom vs happy-dom: Navigating the Nuances of JavaScript Testing \- Sean Coughlin's Blog, accessed on April 13, 2025, [https://blog.seancoughlin.me/jsdom-vs-happy-dom-navigating-the-nuances-of-javascript-testing](https://blog.seancoughlin.me/jsdom-vs-happy-dom-navigating-the-nuances-of-javascript-testing)  
15. Testing React components with Bun | Natt Nguyen, accessed on April 13, 2025, [https://natt.sh/blog/2024-12-09-testing-react-components-bun](https://natt.sh/blog/2024-12-09-testing-react-components-bun)  
16. Introduction | Testing Library, accessed on April 13, 2025, [https://testing-library.com/docs/user-event/intro/](https://testing-library.com/docs/user-event/intro/)  
17. Using Testing Library with Bun | Bun Examples, accessed on April 13, 2025, [https://bun.sh/guides/test/testing-library](https://bun.sh/guides/test/testing-library)  
18. Problems with Bun and Happy-DOM? TypeScript complains of Matchers? · testing-library jest-dom · Discussion \#595 \- GitHub, accessed on April 13, 2025, [https://github.com/testing-library/jest-dom/discussions/595](https://github.com/testing-library/jest-dom/discussions/595)  
19. Migrate from Jest to Bun's test runner | Bun Examples, accessed on April 13, 2025, [https://bun.sh/guides/test/migrate-from-jest](https://bun.sh/guides/test/migrate-from-jest)  
20. Support JSDOM · Issue \#3554 · oven-sh/bun \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/issues/3554](https://github.com/oven-sh/bun/issues/3554)  
21. Getting Started with Bun for React Developers \- Telerik.com, accessed on April 13, 2025, [https://www.telerik.com/blogs/getting-started-bun-react-developers](https://www.telerik.com/blogs/getting-started-bun-react-developers)  
22. Write browser DOM tests with Bun and happy-dom | Bun Examples, accessed on April 13, 2025, [https://bun.sh/guides/test/happy-dom](https://bun.sh/guides/test/happy-dom)  
23. How to Test Your NextJS 14 Applications with Bun | Antler Digital, accessed on April 13, 2025, [https://antler.digital/blog/how-to-test-your-nextjs-14-applications-with-bun](https://antler.digital/blog/how-to-test-your-nextjs-14-applications-with-bun)  
24. Setup as Test Environment · capricorn86/happy-dom Wiki \- GitHub, accessed on April 13, 2025, [https://github.com/capricorn86/happy-dom/wiki/Setup-as-Test-Environment](https://github.com/capricorn86/happy-dom/wiki/Setup-as-Test-Environment)  
25. Support for React-testing-library · Issue \#198 · oven-sh/bun \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/issues/198](https://github.com/oven-sh/bun/issues/198)  
26. 使用Bun 和happy-dom 编写浏览器DOM 测试, accessed on April 13, 2025, [https://bun.net.cn/guides/test/happy-dom](https://bun.net.cn/guides/test/happy-dom)  
27. Lifecycle hooks – Test runner | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs/test/lifecycle](https://bun.sh/docs/test/lifecycle)  
28. Installation | Testing Library, accessed on April 13, 2025, [https://testing-library.com/docs/user-event/install/](https://testing-library.com/docs/user-event/install/)  
29. testing-library/user-event \- NPM, accessed on April 13, 2025, [https://www.npmjs.com/package/@testing-library/user-event](https://www.npmjs.com/package/@testing-library/user-event)  
30. react-testing-library why is toBeInTheDocument() not a function \- Stack Overflow, accessed on April 13, 2025, [https://stackoverflow.com/questions/56547215/react-testing-library-why-is-tobeinthedocument-not-a-function](https://stackoverflow.com/questions/56547215/react-testing-library-why-is-tobeinthedocument-not-a-function)  
31. "warning " \> @testing-library/user-event@12.6.2" has unmet peer dependency "@testing-library/dom@\>=7.21.4". \#551 \- GitHub, accessed on April 13, 2025, [https://github.com/testing-library/user-event/issues/551](https://github.com/testing-library/user-event/issues/551)  
32. Common mistakes with React Testing Library \- Kent C. Dodds, accessed on April 13, 2025, [https://kentcdodds.com/blog/common-mistakes-with-react-testing-library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)  
33. Setup \- Testing Library, accessed on April 13, 2025, [https://testing-library.com/docs/react-testing-library/setup/](https://testing-library.com/docs/react-testing-library/setup/)  
34. Async Methods \- Testing Library, accessed on April 13, 2025, [https://testing-library.com/docs/dom-testing-library/api-async](https://testing-library.com/docs/dom-testing-library/api-async)  
35. Example \- Testing Library, accessed on April 13, 2025, [https://testing-library.com/docs/react-testing-library/example-intro/](https://testing-library.com/docs/react-testing-library/example-intro/)  
36. Cant use fireEvent \+ happy-dom · Issue \#10282 · oven-sh/bun \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/issues/10282](https://github.com/oven-sh/bun/issues/10282)  
37. React testing library: how to getByRole on custom role \- Stack Overflow, accessed on April 13, 2025, [https://stackoverflow.com/questions/71850026/react-testing-library-how-to-getbyrole-on-custom-role](https://stackoverflow.com/questions/71850026/react-testing-library-how-to-getbyrole-on-custom-role)  
38. waitFor \+ getByRole causing severe delays · Issue \#820 · testing-library/dom-testing-library, accessed on April 13, 2025, [https://github.com/testing-library/dom-testing-library/issues/820](https://github.com/testing-library/dom-testing-library/issues/820)  
39. bun test with react DOM shows infinite error log on expect failed · Issue \#10886 \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/issues/10886](https://github.com/oven-sh/bun/issues/10886)  
40. Struggling to see the value of RTL for integration tests in comparison to similar (sometimes faster\!) browser tests : r/reactjs \- Reddit, accessed on April 13, 2025, [https://www.reddit.com/r/reactjs/comments/1c0ng22/struggling\_to\_see\_the\_value\_of\_rtl\_for/](https://www.reddit.com/r/reactjs/comments/1c0ng22/struggling_to_see_the_value_of_rtl_for/)  
41. userEvent in React Testing Library Doesn't Cause onClick To Be Called \- Stack Overflow, accessed on April 13, 2025, [https://stackoverflow.com/questions/69300723/userevent-in-react-testing-library-doesnt-cause-onclick-to-be-called](https://stackoverflow.com/questions/69300723/userevent-in-react-testing-library-doesnt-cause-onclick-to-be-called)  
42. React Testing Library with userEvent.click wrong act() warning \- Stack Overflow, accessed on April 13, 2025, [https://stackoverflow.com/questions/71681055/react-testing-library-with-userevent-click-wrong-act-warning](https://stackoverflow.com/questions/71681055/react-testing-library-with-userevent-click-wrong-act-warning)  
43. user-event v13 \- Testing Library, accessed on April 13, 2025, [https://testing-library.com/docs/user-event/v13/](https://testing-library.com/docs/user-event/v13/)  
44. Using waitFor in React Testing Library Explained \- Testim, accessed on April 13, 2025, [https://www.testim.io/blog/react-testing-library-waitfor/](https://www.testim.io/blog/react-testing-library-waitfor/)  
45. Fixing React Testing Library 'test was not wrapped in act' warning | Chris Boakes, accessed on April 13, 2025, [https://chrisboakes.com/fixing-act-error-react-testing-library/](https://chrisboakes.com/fixing-act-error-react-testing-library/)  
46. When to use act() in jest unit tests with react-dom \- Stack Overflow, accessed on April 13, 2025, [https://stackoverflow.com/questions/60113292/when-to-use-act-in-jest-unit-tests-with-react-dom](https://stackoverflow.com/questions/60113292/when-to-use-act-in-jest-unit-tests-with-react-dom)  
47. Testing · Get Started with Nuxt, accessed on April 13, 2025, [https://nuxt.com/docs/getting-started/testing](https://nuxt.com/docs/getting-started/testing)  
48. Use Bun with Astro | Docs, accessed on April 13, 2025, [https://docs.astro.build/en/recipes/bun/](https://docs.astro.build/en/recipes/bun/)  
49. Are there still issues with react testing library and vitest? : r/reactjs \- Reddit, accessed on April 13, 2025, [https://www.reddit.com/r/reactjs/comments/1fxk7kn/are\_there\_still\_issues\_with\_react\_testing\_library/](https://www.reddit.com/r/reactjs/comments/1fxk7kn/are_there_still_issues_with_react_testing_library/)  
50. Having afterEach(cleanup) in the test setup file breaks exported screen module on Bun test \#1348 \- GitHub, accessed on April 13, 2025, [https://github.com/testing-library/react-testing-library/issues/1348](https://github.com/testing-library/react-testing-library/issues/1348)  
51. \`cleanup\` not performed automatically by test runner. · Issue \#17138 · oven-sh/bun \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/issues/17138](https://github.com/oven-sh/bun/issues/17138)  
52. afterEach not playing nicely with testing library's \`cleanup\` · Issue \#16926 · oven-sh/bun, accessed on April 13, 2025, [https://github.com/oven-sh/bun/issues/16926](https://github.com/oven-sh/bun/issues/16926)  
53. Dates and times – Test runner | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs/test/time](https://bun.sh/docs/test/time)  
54. Set the system time in Bun's test runner | Bun Examples, accessed on April 13, 2025, [https://bun.sh/guides/test/mock-clock](https://bun.sh/guides/test/mock-clock)  
55. \`bun test\` · Issue \#1825 · oven-sh/bun \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/issues/1825](https://github.com/oven-sh/bun/issues/1825)  
56. Missing jest timers, test.each, and module mocks · Issue \#3594 · oven-sh/bun \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/issues/3594](https://github.com/oven-sh/bun/issues/3594)  
57. Fake Timers in Bun Test, accessed on April 13, 2025, [https://js2brain.com/blog/fake-timers-in-bun-test](https://js2brain.com/blog/fake-timers-in-bun-test)  
58. itsmeid/bun-test-utils \- NPM, accessed on April 13, 2025, [https://www.npmjs.com/package/@itsmeid/bun-test-utils](https://www.npmjs.com/package/@itsmeid/bun-test-utils)