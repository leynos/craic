# **A Comprehensive Guide to the bun test Framework**

## **I. Introduction to bun test**

### **A. Overview of Bun and its Integrated Test Runner**

Bun is presented as an all-in-one toolkit designed for modern JavaScript and TypeScript development, encompassing a runtime, bundler, package manager, and test runner within a single executable.4 It aims to serve as a significantly faster, drop-in replacement for Node.js, built using the Zig programming language and powered by Apple's JavaScriptCore (JSC) engine.4  
A core component of this toolkit is bun test, the built-in test runner.4 Unlike the Node.js ecosystem, which typically requires installing separate testing frameworks like Jest or Mocha, Bun includes its test runner out-of-the-box.1 This integrated approach reflects a broader design philosophy favoring built-in functionality for essential development tasks.4 The intention is to streamline project setup and reduce the dependency footprint often associated with Node.js development environments.1 This simplification comes with the trade-off of potentially less flexibility compared to choosing specialized tools, a fundamental difference in ecosystem philosophy that developers should recognize.

### **B. Core Design Goals: Speed and Jest Compatibility**

The bun test runner is explicitly designed with two primary goals: exceptional execution speed and extensive compatibility with the Jest testing framework's Application Programming Interface (API).5  
The emphasis on speed is a defining characteristic of the entire Bun project.4 For bun test, this translates into significantly faster test execution compared to established runners like Jest. Benchmarks suggest bun test can be substantially quicker, with claims of running tests up to 13 times faster than Jest in some scenarios 8 and even completing complex test suites faster than Jest can print its version information.10 This performance advantage is attributed to Bun's foundation in Zig, the use of the highly optimized JavaScriptCore engine, and native code implementations for performance-critical parts like the expect assertion library.4 Performance is positioned not merely as a feature but as the core value proposition driving Bun's development and adoption, including its test runner.  
Simultaneously, bun test aims for strong compatibility with Jest's API.5 This strategic decision is intended to lower the barrier to entry for the large community of developers already familiar with Jest, facilitating migration of existing test suites to leverage Bun's speed advantages.9 However, it is crucial to note that while compatibility is a major goal, it is an ongoing effort, and bun test does not yet implement 100% of Jest's features and behaviors.5 Understanding this focus on performance, enabled by Jest compatibility, is key to recognizing the primary motivation for users choosing bun test.

### **C. Purpose of this Guide (Reference for LLM Agent)**

This document serves as a structured, detailed technical reference guide on the bun test framework. It is specifically intended for consumption and processing by an agentic Large Language Model (LLM) coding tool or the developers integrating this knowledge. The content prioritizes accuracy, clear structure, comprehensive examples, and explicit coverage of command-line usage, test structuring, assertions, mocking, lifecycle management, timeouts, test control mechanisms, snapshot testing, DOM testing, and a comparative analysis with Jest, based on available documentation and resources.

## **II. Command-Line Interface (CLI) Usage**

The bun test command provides a range of options for discovering, filtering, and controlling test execution.

### **A. Executing Tests**

* **Basic Execution:** Running bun test without arguments initiates a recursive search within the working directory. It identifies and executes all files matching standard testing patterns: \*.test.{js,jsx,ts,tsx}, \*\_test.{js,jsx,ts,tsx}, \*.spec.{js,jsx,ts,tsx}, and \*\_spec.{js,jsx,ts,tsx}.5  
* **Specific Files/Directories:** To run tests within a particular file or directory, provide the path as an argument. It is essential to prefix the path with ./ or / (e.g., bun test./src/utils/math.test.ts or bun test./tests/) to distinguish it from a filter name.5

### **B. Filtering Tests**

Several mechanisms allow for selective test execution:

* **Path/Name Filters:** Positional arguments following bun test act as simple string filters. Only test files whose full path contains one of the provided filter strings will be executed (e.g., bun test utils math would run files containing either "utils" or "math" in their path).5 Note that glob patterns are not currently supported for these filters.15  
* **Test Name Pattern:** The \-t or \--test-name-pattern=\<regex\> flag filters tests based on the name provided in the test() or describe() function, using a regular expression.5  
* **Focusing Specific Tests:** The \--only flag restricts execution exclusively to tests or suites marked with the .only() modifier in the code.5  
* **Including Todo Tests:** The \--todo flag includes tests marked with .todo() in the test run, reporting their status.5

### **C. Watch Mode**

The \--watch flag enables watch mode. Similar to bun run \--watch, the test runner monitors test files and their dependencies for changes, automatically re-running the relevant tests upon detection.5

### **D. Code Coverage**

Code coverage analysis can be generated using the following flags:

* \--coverage: Enables coverage collection and reporting after the test run completes.5  
* \--coverage-reporter=\<val\>: Specifies the output format for the coverage report. Supported values include 'text' (default, console output), 'lcov' (for integration with coverage tools), or both ('text lcov').5  
* \--coverage-dir=\<val\>: Defines the directory where coverage report files (like lcov.info) will be saved. The default is ./coverage/.5 It's worth noting that current coverage reporting capabilities are considered somewhat basic, primarily offering line and function coverage summaries in the console output.10

### **E. Preloading Scripts**

The \--preload \<file\> flag allows specifying one or more script files to be executed *before* any test files are loaded and run.5 This is commonly used for global setup tasks, defining global lifecycle hooks, or configuring testing environments (like setting up happy-dom for DOM testing).12 Preload scripts can also be configured persistently in the bunfig.toml file under the \[test\] section.12

### **F. Output Reporters**

For integration with CI/CD systems or specific reporting needs:

* \--reporter=\<val\>: Specifies the output reporter format. The primary documented format is junit for generating JUnit XML reports.5  
* \--reporter-outfile=\<val\>: Used in conjunction with \--reporter, this flag specifies the file path where the generated report will be written (e.g., bun test \--reporter=junit \--reporter-outfile=./junit-report.xml).5 This is particularly useful for platforms like GitLab that consume JUnit reports. Bun also features automatic detection when running inside GitHub Actions, emitting annotations directly to the console without requiring specific reporter configuration.5 This indicates a deliberate effort to ensure smooth integration with common CI/CD platforms.

### **G. Execution Control**

* **Bailing:** The \--bail flag modifies the runner's behavior upon encountering failures.  
  * \--bail: Aborts the entire test run immediately after the first test failure.5  
  * \--bail=\<N\>: Aborts the test run after N test failures occur.5 This is often useful in CI environments to save resources by stopping early when numerous tests are failing.5  
* **Rerunning Tests:** The \--rerun-each=\<N\> flag instructs the runner to execute each test file N times. This can be helpful in identifying and diagnosing flaky or non-deterministic tests.5

### **H. Setting Timeouts**

* \--timeout=\<ms\>: Sets a default timeout duration in milliseconds for each individual test. If a test exceeds this duration, it fails. The default value is 5000ms (5 seconds).5 This global setting can be overridden on a per-test basis within the test code itself (See Section VII).

Compared to Jest, which often relies heavily on configuration files like jest.config.js, Bun exposes a significant amount of test execution control directly through these CLI flags.12 While bunfig.toml allows for persistent configuration (e.g., for preload), the emphasis on CLI options for common settings like timeouts, coverage, and bailing suggests a preference for command-line driven configuration, potentially simplifying setup for basic use cases and CI scripts.5

### **Table: Summary of Common bun test CLI Flags**

| Flag | Alias | Argument | Description | Default Value |
| :---- | :---- | :---- | :---- | :---- |
| \--coverage |  |  | Generate code coverage report. | false |
| \--coverage-reporter |  | \<val\> | Specify coverage report format(s) (e.g., 'text', 'lcov', 'text lcov'). | 'text' |
| \--coverage-dir |  | \<val\> | Output directory for coverage files. | 'coverage' |
| \--preload |  | \<file\> | Preload script(s) before running tests. | (none) |
| \--reporter |  | \<val\> | Specify the test reporter (e.g., 'junit'). | (default tap) |
| \--reporter-outfile |  | \<val\> | Output file path for the specified reporter. | (none) |
| \--bail |  | \[N\] | Abort after the first failure (no arg) or N failures. | false |
| \--rerun-each |  | \<N\> | Re-run each test file N times. | 1 |
| \--timeout |  | \<ms\> | Set the default per-test timeout in milliseconds. | 5000 |
| \--watch |  |  | Enable watch mode to re-run tests on file changes. | false |
| \--only |  |  | Run only tests marked with .only(). | false |
| \--todo |  |  | Include tests marked with .todo() in the run. | false |
| \--test-name-pattern | \-t | \<regex\> | Filter tests to run based on their name matching the regex. | (none) |
| \--update-snapshots | \-u |  | Update failing snapshots with the current output. | false |

## **III. Writing Tests: Structure and Syntax**

bun test utilizes a testing API designed for familiarity, closely mirroring the structure and syntax popularized by Jest.5

### **A. Defining Test Suites (describe)**

The describe(name, fn) function serves to group related test cases into logical blocks or suites.9 The name provides a descriptive label for the group, and the fn callback contains the individual tests belonging to that suite. describe blocks can be nested to create a hierarchical organization, improving the readability and maintainability of complex test files.9

### **B. Defining Test Cases (test, it)**

Individual test cases are defined using test(name, fn, timeout?) or its common alias it(name, fn, timeout?).5 The it alias is often preferred in Behavior-Driven Development (BDD) style testing.

* name: A string describing the specific behavior or condition being tested.  
* fn: The callback function containing the test logic, including code execution and assertions.  
* timeout (optional): A number specifying the maximum time (in milliseconds) this specific test is allowed to run before being marked as failed. This overrides any global timeout set via the CLI.9

### **C. Handling Asynchronous Operations**

bun test seamlessly handles asynchronous operations within tests:

* **async/await:** Tests can be defined as async functions, allowing the use of await for Promises, which is the generally preferred modern approach.9  
* **done Callback:** For compatibility or specific use cases, a test function can accept a callback argument (conventionally named done). If this argument is present in the function signature, the test runner will wait until done() is explicitly called before considering the test complete. Failure to call done in such a test will result in the test hanging and eventually timing out.9

### **D. Jest-Style Globals Behavior**

A key aspect of bun test's Jest compatibility is its handling of common testing functions like describe, test, it, expect, beforeAll, afterAll, beforeEach, and afterEach. These functions can typically be used directly within test files without needing an explicit import statement, mimicking Jest's global behavior.9  
However, there is a crucial underlying difference. Unlike Jest, which often injects these functions into the actual globalThis scope, Bun achieves this developer experience through its transpiler.9 During the transformation process, Bun automatically inserts the necessary import {... } from "bun:test" statement internally. This means that while the *syntax* feels like using globals, the actual global scope remains unpolluted (typeof globalThis.describe will evaluate to undefined).9 This approach provides the convenience familiar to Jest users while adhering to better practices by avoiding true global scope modification, thus preventing potential naming conflicts or unexpected side effects associated with global variables.

## **IV. Assertions with expect**

Assertions are the mechanism by which tests verify that the code under test behaves as intended. bun test provides an assertion library accessed primarily through the expect() function, designed for strong compatibility with Jest's assertion API.9

### **A. Using the expect() Function**

The expect(value) function is the starting point for all assertions.9 It takes a single argument: the *actual* value produced by the code being tested (e.g., the return value of a function, the state of an object). Calling expect() returns a special "expect" object that exposes a variety of chainable *matcher* functions.9

### **B. Overview of Available Matchers**

Matchers are functions called on the expect object to perform specific comparisons or checks against the actual value. bun test implements a substantial portion of Jest's extensive set of matchers, covering common assertion needs like equality, truthiness, types, exceptions, mock interactions, and snapshot comparisons.8 While the goal is high compatibility, it's important to remember that not every single Jest matcher is implemented yet.12 For instance, expect().toHaveReturned() was noted as missing at the time of documentation.12 This high degree of matcher compatibility, however, is fundamental to enabling smoother migration for projects already using Jest, as most common assertions will work without modification.

### **C. Detailed Examples of Common Matchers**

Below are examples of frequently used matchers available in bun test:

* **Equality:**  
  * .toBe(expected): Checks for strict equality (===) between the actual and expected values.5  
  * .toEqual(expected): Performs a deep equality check, suitable for comparing objects and arrays recursively.9  
* **Truthiness:**  
  * .toBeTruthy(): Asserts the actual value is truthy (evaluates to true in a boolean context).9  
  * .toBeFalsy(): Asserts the actual value is falsy (e.g., false, 0, '', null, undefined, NaN).9  
  * .toBeNull(): Asserts the actual value is strictly null.9  
  * .toBeUndefined(): Asserts the actual value is strictly undefined.9  
  * .toBeDefined(): Asserts the actual value is not undefined.9  
  * .toBeNaN(): Asserts the actual value is NaN.9  
* **Numeric Comparison:**  
  * .toBeGreaterThan(number).8  
  * .toBeGreaterThanOrEqual(number).9  
  * .toBeLessThan(number).9  
  * .toBeLessThanOrEqual(number).9  
* **Collections/Strings:**  
  * .toContain(item): Checks if an array contains a specific element or if a string contains a specific substring.9  
  * .toHaveLength(number): Asserts that an array or string has a specific length.9  
* **Objects:**  
  * .toHaveProperty(keyPath, value?): Checks if an object has a property at a given key path (dot notation supported). Optionally checks if the property has a specific value.9  
* **Exceptions:**  
  * .toThrow(error?): Asserts that a function call (passed as expect(() \=\> functionCall())) throws an error. Can optionally check for a specific error class, string message, or error object.9  
  * .toThrowErrorMatchingSnapshot() / .toThrowErrorMatchingInlineSnapshot(): Asserts that a function throws an error and snapshots the error message (See Section IX).17  
* **Mocks (See Section V):**  
  * .toHaveBeenCalled(): Asserts that a mock function was called at least once.8  
  * .toHaveBeenCalledTimes(number): Asserts that a mock function was called a specific number of times.8  
  * .toHaveBeenCalledWith(...args): Asserts that a mock function was called with specific arguments.  
* **Snapshots (See Section IX):**  
  * .toMatchSnapshot(): Compares the actual value against a stored snapshot file.5  
  * .toMatchInlineSnapshot(): Compares the actual value against a snapshot stored inline in the test file.17  
* **Types:**  
  * .toBeInstanceOf(Class): Checks if the actual value is an instance of a specific class.  
  * .toBeTypeOf(type): Checks if the typeof the actual value matches the provided string (e.g., 'string', 'number', 'function').19  
* **Custom Logic:**  
  * .toSatisfy(predicate): Asserts that the actual value satisfies a custom predicate function (a function that takes the value and returns true/false).19

### **Table: Common expect Matchers in bun test**

| Matcher | Description | Jest Equivalent | Availability Notes |
| :---- | :---- | :---- | :---- |
| .toBe(value) | Checks for strict equality (===). | Identical | Fully supported |
| .toEqual(value) | Checks for deep equality of objects/arrays. | Identical | Fully supported |
| .toBeTruthy() / .toBeFalsy() | Checks for truthiness/falsiness. | Identical | Fully supported |
| .toBeNull() / .toBeUndefined() | Checks for null / undefined. | Identical | Fully supported |
| .toBeDefined() | Checks if value is not undefined. | Identical | Fully supported |
| .toBeNaN() | Checks if value is NaN. | Identical | Fully supported |
| .toBeGreaterThan(num) | Checks if actual \> num. | Identical | Fully supported |
| .toBeGreaterThanOrEqual(num) | Checks if actual \>= num. | Identical | Fully supported |
| .toBeLessThan(num) | Checks if actual \< num. | Identical | Fully supported |
| .toBeLessThanOrEqual(num) | Checks if actual \<= num. | Identical | Fully supported |
| .toContain(item) | Checks if array/string contains item/substring. | Identical | Fully supported |
| .toHaveLength(num) | Checks array/string length. | Identical | Fully supported |
| .toHaveProperty(keyPath, value?) | Checks if object has property (optionally with value). | Identical | Fully supported |
| .toThrow(error?) | Checks if function throws an error. | Identical | Fully supported |
| .toHaveBeenCalled() | Checks if mock function was called. | Identical | Fully supported |
| .toHaveBeenCalledTimes(num) | Checks mock function call count. | Identical | Fully supported |
| .toHaveBeenCalledWith(...args) | Checks mock function call arguments. | Identical | Fully supported |
| .toMatchSnapshot() | Compares value against external snapshot file. | Identical | Fully supported |
| .toMatchInlineSnapshot(snapshot?) | Compares value against inline snapshot string. | Identical | Fully supported |
| .toThrowErrorMatchingSnapshot() | Snapshots error message to external file. | Identical | Fully supported |
| .toThrowErrorMatchingInlineSnapshot() | Snapshots error message inline. | Identical | Fully supported |
| .toBeInstanceOf(Class) | Checks instanceof Class. | Identical | Fully supported |
| .toBeTypeOf(type) | Checks typeof actual \=== type. | Identical | Fully supported |
| .toSatisfy(predicate) | Checks if value passes custom predicate function. | Identical | Fully supported |
| .toHaveReturned() | Checks the number of times a mock function returned successfully. | Identical | Missing 12 |

## **V. Mocking**

Mocking is a technique used in unit testing to isolate the code under test by replacing its dependencies with controlled substitutes, known as mocks. bun test provides built-in mocking capabilities, again drawing heavily from the Jest API.8

### **A. Mocking Functions**

The primary way to create a mock function is using mock(implementation?), imported from "bun:test".5 An optional implementation function can be provided to define the mock's behavior. For Jest compatibility, jest.fn(implementation?) is also available and behaves identically.15  
These functions return a special mock function object that, in addition to executing the (optional) implementation, records information about its calls, such as the arguments passed (mock.calls), the this context (mock.instances), and return values or thrown errors (mock.results).18

TypeScript

import { test, expect, mock } from "bun:test";

const mockCallback \= mock((x) \=\> x \* 2);

test("mock function usage", () \=\> {  
  const result \= mockCallback(5);  
  expect(result).toBe(10);  
  expect(mockCallback).toHaveBeenCalled();  
  expect(mockCallback).toHaveBeenCalledTimes(1);  
  expect(mockCallback).toHaveBeenCalledWith(5);  
  expect(mockCallback.mock.calls).toEqual(\[1\]);  
  expect(mockCallback.mock.results.value).toBe(10);  
});

### **B. Spying on Existing Functions**

Sometimes, it's desirable to track calls to a real function without replacing its implementation, perhaps to verify it was called while still allowing its original logic to execute. This is achieved using spyOn(object, methodName).18

TypeScript

import { test, expect, spyOn } from "bun:test";

const calculator \= {  
  add: (a, b) \=\> a \+ b,  
};

const addSpy \= spyOn(calculator, "add");

test("spying on add method", () \=\> {  
  const sum \= calculator.add(3, 4); // Original method still executes  
  expect(sum).toBe(7);  
  expect(addSpy).toHaveBeenCalledTimes(1);  
  expect(addSpy).toHaveBeenCalledWith(3, 4);

  addSpy.mockRestore(); // Clean up spy  
});

### **C. Mock Function Inspection and Manipulation API**

Mock functions created by mock() or spyOn() expose a .mock property containing utilities to inspect calls and control behavior 18:

* **Inspection:** .calls, .results, .instances, .contexts, .lastCall.  
* **Behavior Control:**  
  * .mockImplementation(fn): Replace the mock's implementation.  
  * .mockImplementationOnce(fn): Replace implementation for the next call only.  
  * .mockReturnValue(value): Set a fixed return value.  
  * .mockReturnValueOnce(value): Set a fixed return value for the next call only.  
  * .mockResolvedValue(value) / .mockResolvedValueOnce(value): Make the mock return a Promise resolving to value.  
  * .mockRejectedValue(error) / .mockRejectedValueOnce(error): Make the mock return a Promise rejecting with error.  
  * .mockReturnThis(): Make the mock return this.  
* **State Management:**  
  * .mockClear(): Resets call/instance/result history but keeps the implementation.  
  * .mockReset(): Clears history and removes any defined implementation (resets to a basic mock).  
  * .mockRestore(): Resets history and restores the original implementation (only applicable to spies created with spyOn).

### **D. Mocking Modules**

To replace an entire module with a mock version, use mock.module(modulePath, factory).10

* modulePath: The path to the module to be mocked (relative or absolute).  
* factory: A function that returns the mock module exports.

TypeScript

// utils.ts  
export const greet \= (name) \=\> \`Hello, ${name}\!\`;  
export const PI \= 3.14;

// utils.test.ts  
import { test, expect, mock } from "bun:test";  
import { greet, PI } from "./utils"; // Original import

test("module mocking", async () \=\> {  
  // Mock the module before dynamic import or require  
  mock.module("./utils", () \=\> {  
    console.log("Mock factory executing"); // Executes lazily on first use  
    return {  
      greet: mock((name) \=\> \`Mock greeting for ${name}\`), // Mock specific export  
      PI: 999, // Override other exports  
    };  
  });

  // Need to re-import or require \*after\* the mock is defined  
  const mockedUtils \= await import("./utils");

  expect(mockedUtils.greet("Bun")).toBe("Mock greeting for Bun");  
  expect(mockedUtils.PI).toBe(999);  
  expect(mockedUtils.greet).toHaveBeenCalledWith("Bun");

  // Note: Original 'greet' and 'PI' bindings might update for ESM  
  // depending on timing and how Bun handles live binding updates.  
  // Safest to use the dynamically imported module 'mockedUtils'.  
});

This works for both ES Modules (import) and CommonJS (require).18 For ESM, Bun attempts to update live bindings.  
A critical difference from Jest's jest.mock() is that **mock.module() is not automatically hoisted**.18 This means the mock.module() call must execute *before* any code imports or requires the module you intend to mock. If the module is imported at the top level of your test file, the mock definition won't apply in time. The standard solution is to place mock.module() calls in a separate setup file (e.g., tests/setup.ts) and load this file using the \--preload CLI flag or the test.preload setting in bunfig.toml.18 This ensures the mocks are registered before any test files start importing modules. This difference in behavior is a significant adaptation required when migrating from Jest.  
Additionally, automatic mocking based on finding files in a \_\_mocks\_\_ directory is not currently supported.18

### **E. Mocking Classes**

Classes are typically mocked by mocking the module that exports them using mock.module(). The factory function provided to mock.module can return an object where the class export is replaced with a mock class (which could be a simplified version or a function) or a mock instance.18

### **F. Mocking Time and Dates**

bun test provides specific mechanisms for controlling time within tests:

* **Date Mocking:** The setSystemTime(dateOrTimestamp?) function allows setting a fixed point in time that affects Date.now(), new Date(), and Intl.DateTimeFormat.21 Calling setSystemTime() without arguments resets the clock to the real system time. This is often used within beforeAll or beforeEach hooks.22  
* **Jest Compatibility (useFakeTimers):** To ease migration, bun test supports jest.useFakeTimers() and jest.useRealTimers(). These internally call setSystemTime.21 When fake timers are enabled, jest.now() can be used to get the current mocked timestamp.21 A notable difference from Jest is that jest.useFakeTimers() in Bun *does not* replace the global Date constructor object itself, only its behavior, avoiding potential type inconsistencies (Date\!== OriginalDate) sometimes seen in Jest.21  
* **Timer Function Mocking (Limitation):** A significant current limitation is the **lack of built-in support for mocking timer functions** like setTimeout, setInterval, clearTimeout, and clearInterval.21 This means functions like Jest's jest.runAllTimers(), jest.advanceTimersByTime(), or Vitest's equivalents, which allow controlling the execution flow of scheduled callbacks in tests, are not available natively.10 This is explicitly noted as being on the roadmap but not yet implemented.21 This gap is arguably the most substantial functional difference compared to Jest and Vitest and can be a major blocker for migrating tests that rely heavily on controlling asynchronous timer-based logic.10  
* **Workaround (External Library):** The recommended workaround involves using a third-party library like @sinonjs/fake-timers.24 This library can be installed via Bun and provides functions (clock.tick(), clock.next(), etc.) analogous to Jest/Vitest timer controls. However, this introduces an external dependency and requires careful setup (often within a helper function using lifecycle hooks).24 There might also be incompatibilities with Bun-specific timer APIs like Bun.sleep().24

### **Table: Timer/Date Mocking Capabilities: Bun vs. Jest/Vitest**

| Feature | Bun Support (bun:test) | Jest Support | Vitest Support | Bun Workaround |
| :---- | :---- | :---- | :---- | :---- |
| Mock Date.now(), new Date() | Yes (setSystemTime, jest.useFakeTimers) 21 | Yes | Yes | N/A |
| Mock setTimeout, setInterval, etc. | No (Built-in) 21 | Yes | Yes | @sinonjs/fake-timers 24 |
| Advance timers (runAllTimers, tick, etc.) | No (Built-in) 21 | Yes | Yes | @sinonjs/fake-timers 24 |
| Get mocked time (jest.now()) | Yes (when using fake timers) 21 | Yes | Yes (vi.getMockedSystemTime()) | N/A |
| Date constructor replacement | No (Avoids Jest issue) 21 | Yes (Can cause issues) | Yes | N/A |

### **G. Managing Mocks**

To manage the state of mocks across tests:

* mock.clearAllMocks(): Clears the call history (.mock.calls, etc.) of *all* defined mocks. Useful in an afterEach hook to ensure mocks don't retain state from previous tests.18  
* mock.restore(): Restores the original implementation of functions that were spied on using spyOn. Importantly, this does *not* undo module mocks created with mock.module().18

The lack of fully automatic test isolation 10 makes diligent use of these cleanup functions (especially mockClear() in afterEach) more critical in Bun than in frameworks with stronger default isolation, to prevent mock state from leaking between tests within the same file or potentially across files if mocks are defined globally via preload.

### **H. Vitest Mocking API Compatibility**

To further aid migration, Bun provides a vi global object that aliases several key mocking functions to their bun:test / Jest equivalents: vi.fn (-\> mock), vi.spyOn, vi.mock (-\> mock.module), vi.restoreAllMocks (-\> mock.restore), and vi.clearAllMocks (-\> mock.clearAllMocks).18

## **VI. Test Lifecycle Management**

bun test provides lifecycle hooks, analogous to those in Jest and other xUnit-style frameworks, allowing code execution at specific points during the test run for setup and teardown purposes.5

### **A. Setup and Teardown Hooks**

The available hooks are 16:

* beforeAll(fn, timeout?): Runs once before any tests within its scope (a describe block or the entire file).  
* afterAll(fn, timeout?): Runs once after all tests within its scope have completed.  
* beforeEach(fn, timeout?): Runs before each individual test or it within its scope.  
* afterEach(fn, timeout?): Runs after each individual test or it within its scope.

Each hook function (fn) can be synchronous or asynchronous (using async/await). They also accept an optional timeout argument (in milliseconds) to limit their execution time.16

### **B. Execution Order**

The hooks execute in a predictable order relative to tests and nested scopes:

1. Outer beforeAll  
2. Outer beforeEach  
3. Inner beforeAll  
4. Inner beforeEach  
5. test / it  
6. Inner afterEach  
7. Inner afterAll  
8. Outer afterEach  
9. Outer afterAll

This nesting allows for layered setup and teardown logic.

### **C. Defining Global Hooks using \--preload**

A powerful feature is the ability to define hooks that apply across the entire test suite execution, not just within a single file or describe block. This is achieved by defining the hooks in a separate script and loading that script using the \--preload CLI flag or the test.preload array in bunfig.toml.5

* beforeAll defined in a preloaded script runs *once* at the very beginning of the bun test command, before any test files are processed.16  
* afterAll defined in a preloaded script runs *once* at the very end, after all test files have finished execution.16  
* beforeEach and afterEach defined in a preloaded script will run before and after *every single test case* across *all* test files in the run.16 This should be used judiciously due to the potential performance impact.

This preload mechanism provides a clean and explicit way to manage true global setup and teardown logic (e.g., initializing a database connection pool, starting a shared test server, setting up global mocks) that needs to span the entire duration of the test run, a task that can sometimes be awkward to manage in frameworks lacking such a dedicated feature.

## **VII. Timeouts**

Controlling test execution time is crucial for preventing hung tests and ensuring efficient CI runs.

### **A. Default Test Timeout**

By default, each individual test case in bun test has a timeout of **5000 milliseconds (5 seconds)**.5 If a test function takes longer than this to complete (including asynchronous operations), it will be considered a failure.

### **B. Configuring Timeouts Per-Test**

The default timeout can be overridden for a specific test by providing a timeout value (in milliseconds) as the third argument to the test() or it() function definition.9

TypeScript

import { test } from "bun:test";

test("potentially slow database query", async () \=\> {  
  //... database logic  
}, 15000); // Allow up to 15 seconds for this specific test

### **C. Configuring Timeouts Globally**

A global default timeout, applying to all tests unless overridden individually, can be set using the \--timeout \<ms\> CLI flag when invoking bun test.5

Bash

\# Set default timeout to 10 seconds for all tests  
bun test \--timeout 10000

This CLI flag corresponds to the testTimeout option often found in Jest configurations.12

### **D. Behavior on Timeout**

bun test implements a particularly robust mechanism for handling timeouts:

1. **Uncatchable Exception:** When a test exceeds its allotted time, the runner throws an *uncatchable* exception.9 This ensures the test's execution is forcefully terminated immediately.  
2. **Zombie Process Killing:** Critically, Bun actively identifies and terminates any child processes that were spawned *within the timed-out test* using APIs like Bun.spawn, Bun.spawnSync, or Node.js's child\_process module.9

This combination of forceful termination and automatic cleanup of child processes demonstrates a focus on reliability. It prevents timed-out tests from leaving orphaned "zombie" processes running in the background, which could consume resources or interfere with subsequent tests, enhancing the overall stability of the test runner, especially in automated environments or when testing code involving subprocess management.

## **VIII. Controlling Test Execution**

Beyond simple execution, bun test offers several modifiers and syntaxes to control which tests run and under what conditions, providing flexibility during development and debugging.

### **A. Skipping Tests and Suites (.skip)**

To temporarily disable a test or an entire suite (describe block), append the .skip modifier to the test, it, or describe function.9 Skipped tests are typically marked as 'skipped' in the test report and do not affect the overall pass/fail status.

TypeScript

test.skip("this test is currently skipped", () \=\> { /\*... \*/ });  
describe.skip("this entire suite is skipped", () \=\> { /\*... \*/ });

### **B. Focusing Tests and Suites (.only)**

To run *only* specific tests or suites, ignoring all others in the project, append the .only modifier.9 This is extremely useful for isolating failures or iterating quickly on a small subset of tests during development.

TypeScript

test.only("run only this test", () \=\> { /\*... \*/ });  
describe.only("run only tests in this suite", () \=\> { /\*... \*/ });

The same effect can be achieved globally by running bun test \--only.5

### **C. Conditional Execution (.if, .skipIf)**

For more dynamic control, Bun provides conditional execution modifiers:

* test.if(condition) / describe.if(condition): The test or suite will only execute if the provided condition evaluates to a truthy value at runtime.9  
* test.skipIf(condition) / describe.skipIf(condition): The test or suite will be skipped if the condition evaluates to truthy.9

The condition can be any JavaScript expression, commonly involving checks against environment variables (process.env), operating system (process.platform), or architecture (process.arch).9

TypeScript

const isWindows \= process.platform \=== "win32";  
const runNetworkTests \= process.env.RUN\_NETWORK\_TESTS \=== 'true';

test.if(\!isWindows)("test specific to non-Windows", () \=\> { /\*... \*/ });  
test.skipIf(\!runNetworkTests)("skip network test if env var not set", () \=\> { /\*... \*/ });  
describe.if(isWindows)("Windows-specific suite", () \=\> { /\*... \*/ });

This built-in conditional logic is significantly more expressive than static .skip or .only, allowing test suites to adapt dynamically to their execution environment without requiring complex custom setup or external libraries.

### **D. Todo Tests (.todo, .todoIf)**

* test.todo(name): Marks a test as a placeholder without requiring an implementation function. It serves as a reminder for a test that needs to be written.9 Todo tests are skipped by default.  
* test.todoIf(condition) / describe.todoIf(condition): Conditionally marks a test or suite as TODO if the condition is truthy.9

To explicitly run and check the status of TODO tests (e.g., to find any that might now be passing unintentionally), use the bun test \--todo CLI flag.5

### **E. Marking Tests as Expected to Fail (.failing)**

The .failing() modifier inverts the outcome of a test 9:

* If a test marked .failing() actually fails, the test runner reports it as a *pass*.  
* If a test marked .failing() unexpectedly passes, the test runner reports it as a *failure*, often with a message indicating that the .failing() modifier should be removed.

This is useful for tracking known bugs that have tests written for them but are not yet fixed, or for explicitly testing error conditions where failure is the expected outcome.

### **F. Parameterized Tests (.each)**

To run the same test logic with multiple sets of input data, use the .each() modifier with test or describe.9

* test.each(table)(name, fn) / describe.each(table)(name, fn)  
* table: An array where each element represents a set of arguments for one run of the test/suite. Elements can be arrays (passed as individual arguments to fn) or objects (passed as a single argument).9  
* name: Can use printf-style formatting (%s, %d, %p for pretty-print) or template literals with object keys to create descriptive names for each iteration.9

TypeScript

const cases \= \[2, 3, 1\],  
  \[-1, 1, 0\],  
  ;

test.each(cases)("add(%p, %p) should equal %p", (a, b, expected) \=\> {  
  expect(a \+ b).toBe(expected);  
});

const objectCases \= \[  
  { input: { a: 1 }, expected: true },  
  { input: { b: 2 }, expected: false },  
\];

test.each(objectCases)("input $input has property 'a': $expected", ({ input, expected }) \=\> {  
  expect(input.hasOwnProperty('a')).toBe(expected);  
});

Together, these modifiers (.skip, .only, .if, .skipIf, .todo, .todoIf, .failing, .each) provide a comprehensive toolkit for managing test execution status, conditionality, and parameterization directly within the test framework, facilitating clear communication of test intent and status during development and in CI reports.

## **IX. Snapshot Testing**

Snapshot testing is a technique used to assert that a complex or large output (like a UI component's rendered structure or a large data object) remains consistent across code changes. bun test provides built-in support for snapshot testing, closely mirroring Jest's implementation.17

### **A. Concept and Use Cases**

The core idea is to take a "snapshot" of a serializable value during an initial test run and store it. On subsequent runs, the test generates the value again and compares it to the stored snapshot. If they differ, the test fails, alerting the developer to either an unintended change (a regression) or an intentional change that requires updating the snapshot.13 Common use cases include testing React component output, API response structures, complex configuration objects, or any scenario where verifying a large, stable output is necessary.17

### **B. Creating Basic Snapshots**

The primary matcher for basic snapshot testing is .toMatchSnapshot().5

TypeScript

import { test, expect } from "bun:test";

test("user object snapshot", () \=\> {  
  const user \= { id: 1, name: "Bun User", createdAt: new Date("2023-01-01T12:00:00Z") };  
  // Mock date for deterministic snapshot  
  user.createdAt \= new Date("2023-01-01T12:00:00Z");  
  expect(user).toMatchSnapshot();  
});

When this test runs for the first time, Bun serializes the user object and saves it to a file named user.test.ts.snap (assuming the test file is user.test.ts) inside a \_\_snapshots\_\_ directory located next to the test file.17

### **C. Creating Inline Snapshots**

For smaller, more readable snapshots, .toMatchInlineSnapshot() can be used.17

TypeScript

import { test, expect } from "bun:test";

test("simple config inline snapshot", () \=\> {  
  const config \= { theme: "dark", fontSize: 14 };  
  expect(config).toMatchInlineSnapshot(); // Leave empty on first run  
});

On the first run, Bun generates the snapshot and *automatically modifies the test file* to insert the serialized snapshot as a string literal argument to the matcher 17:

TypeScript

// After first run:  
import { test, expect } from "bun:test";

test("simple config inline snapshot", () \=\> {  
  const config \= { theme: "dark", fontSize: 14 };  
  expect(config).toMatchInlineSnapshot(\`  
    {  
      "theme": "dark",  
      "fontSize": 14,  
    }  
  \`);  
});

This keeps the expected output directly alongside the test code, improving readability and portability for simple cases.17

### **D. Snapshotting Errors**

Error messages can also be snapshotted using .toThrowErrorMatchingSnapshot() for external snapshots or .toThrowErrorMatchingInlineSnapshot() for inline snapshots.17

TypeScript

import { test, expect } from "bun:test";

function riskyOperation(input) {  
  if (typeof input\!== 'number') {  
    throw new TypeError("Input must be a number");  
  }  
  //...  
}

test("error message snapshot", () \=\> {  
  expect(() \=\> riskyOperation("abc")).toThrowErrorMatchingSnapshot();  
});

test("inline error message snapshot", () \=\> {  
  expect(() \=\> riskyOperation(null)).toThrowErrorMatchingInlineSnapshot(  
    \`\` // Inserted after first run  
  );  
});

### **E. Snapshot File Structure**

As mentioned, basic snapshots are stored in .snap files within a \_\_snapshots\_\_ directory.17 These files typically contain JavaScript code that exports the serialized snapshot values, often keyed by the test name.28 It is standard practice to commit these snapshot files to version control alongside the test code.27

### **F. Updating Snapshots**

If a test fails due to a snapshot mismatch, and the change in output is intentional and correct, the stored snapshot needs to be updated. This is done by running the tests with the \--update-snapshots (or \-u) CLI flag.5

Bash

bun test \--update-snapshots

This command tells Bun to regenerate the snapshot files (or update inline snapshots) for any tests that failed due to a snapshot mismatch, using the newly generated output as the new baseline.17 It is crucial to review the changes made to snapshots during code review to ensure only intended updates are committed.27  
The implementation of snapshot testing in Bun closely aligns with Jest's established patterns, making this feature familiar and straightforward for developers migrating from Jest.17

## **X. DOM Testing**

Testing UI components or code that interacts with the Document Object Model (DOM) often requires simulating a browser environment within the test runner.

### **A. Compatibility with UI Testing Libraries**

bun test is designed to be compatible with popular libraries used for testing DOM interactions and UI components.5 Libraries explicitly mentioned as compatible include HappyDOM, DOM Testing Library, and React Testing Library.8 This allows developers to leverage existing testing patterns and tools when using bun test for frontend projects.

### **B. Current Incompatibility with jsdom**

A significant point of divergence from the typical Jest setup is that **jsdom currently does not work correctly within the Bun runtime**.12 jsdom is a widely used Node.js library that simulates a web browser environment and is the default testEnvironment in many Jest configurations. The incompatibility stems from jsdom's internal dependencies on APIs specific to the V8 JavaScript engine (used by Node.js), whereas Bun utilizes the JavaScriptCore (JSC) engine.12 While support for jsdom is being tracked as a potential future enhancement 12, it is not currently a viable option.

### **C. Recommended Setup using happy-dom**

The recommended alternative for DOM simulation within bun test is **happy-dom**.12 happy-dom is another library that provides an implementation of web APIs, often considered lighter-weight than jsdom.  
To use happy-dom with bun test, the following setup is required:

1. **Install happy-dom:** Add happy-dom as a development dependency to your project (bun add \-d happy-dom).  
2. **Create a Setup Script:** Create a setup file (e.g., dom-setup.ts) that imports and configures happy-dom to inject necessary browser APIs (like window, document, navigator, etc.) into the global scope. Packages like @happy-dom/global-registrator can simplify this.29  
   TypeScript  
   // Example dom-setup.ts  
   import { GlobalRegistrator } from '@happy-dom/global-registrator';

   GlobalRegistrator.register();

3. **Preload the Setup Script:** Configure bun test to run this setup script *before* any tests execute. This is done using the \--preload flag or the test.preload setting in bunfig.toml.12  
   Bash  
   bun test \--preload./dom-setup.ts  
   Or in bunfig.toml:  
   Ini, TOML  
   \[test\]  
   preload \= \["./dom-setup.ts"\]

This explicit setup using \--preload makes happy-dom's APIs available globally for all tests in the run.  
The incompatibility with jsdom represents a notable migration hurdle for projects heavily reliant on Jest's default testEnvironment: 'jsdom'.12 Migrating requires switching the DOM simulation library to happy-dom and implementing the preload configuration. While happy-dom aims to provide similar functionality, developers should be aware that subtle differences in implementation compared to jsdom might exist, potentially requiring minor adjustments to existing tests.

## **XI. Comparison: bun test vs. Jest**

Choosing a test runner involves weighing various factors. Here's a comparison between bun test and the widely adopted Jest framework:

### **A. Performance**

* **Bun:** Speed is bun test's most prominent advantage.6 Significantly faster test execution times are consistently reported, attributed to its Zig foundation, JavaScriptCore engine, native implementations of core components like expect, and tight integration with the Bun runtime.4 Startup times are also dramatically reduced compared to Node.js/Jest.4  
* **Jest:** Generally exhibits slower startup and execution, particularly when dealing with TypeScript transpilation (via ts-jest or Babel) unless specific optimizations (like using SWC/esbuild transforms) are configured.30 The default type-checking performed by ts-jest adds noticeable overhead.7

### **B. API Syntax Compatibility and Differences**

* **Compatibility:** bun test deliberately mirrors Jest's API for core functions (describe, test, expect) and most common matchers, aiming for a familiar developer experience and easing migration.5 The "global" function usage pattern is also syntactically similar.9 Many Jest test suites can run on bun test with minimal or no code changes.12  
* **Differences:** Key divergences exist:  
  * **Module Mocking:** Jest's jest.mock uses hoisting; Bun's mock.module requires preloading for mocks needed before import.18  
  * **Timer Mocking:** Bun lacks built-in support for controlling timer functions (setTimeout/setInterval) like Jest's runAllTimers.21  
  * **DOM Environment:** Jest commonly uses jsdom; Bun requires happy-dom due to runtime differences.12  
  * **Matchers:** While compatibility is high, some specific Jest matchers may be missing in Bun (e.g., toHaveReturned()).12  
  * **Globals:** Bun simulates globals via transpilation, not actual global scope injection.9

### **C. Feature Parity Analysis**

* **TypeScript/JSX:** Bun supports TS/JSX natively and performs transpilation very quickly.4 Jest requires external configuration (e.g., ts-jest, Babel transforms).30  
* **Mocking:** Both offer robust function, spy, and module mocking. Jest has superior built-in timer control.18  
* **Snapshots:** Functionality appears largely equivalent.17  
* **DOM Environment:** Different libraries required (happy-dom for Bun, jsdom for Jest).12  
* **Watch Mode:** Both provide effective watch modes.5  
* **Coverage:** Both support coverage reporting, though Bun's current reporting might be less feature-rich.5  
* **Concurrency:** Jest supports various concurrency models. bun test currently runs tests serially within a single process, which can be a limitation for very large test suites compared to parallel execution.5 Vitest is often cited as having more advanced concurrency features than Jest.31  
* **Test Isolation:** Jest generally provides stronger test isolation by default. Bun tests may exhibit state leakage (e.g., from mocks) between files/suites if not carefully managed, as noted in some community analyses.10

### **D. Configuration Approaches**

* **Bun:** Leans towards CLI flags for common configurations (timeout, coverage, bail), supplemented by bunfig.toml for persistent settings like preloading.5 This can lead to simpler initial setup.  
* **Jest:** Primarily configured via a dedicated JavaScript or JSON configuration file (jest.config.js), offering more centralized and potentially more powerful configuration options, but with a steeper initial learning curve.12

### **E. Migration Guide from Jest to bun test**

Migrating involves these potential steps 12:

1. **Command:** Replace npx jest... with bun test....  
2. **Imports:** Optionally change import {... } from "@jest/globals" to import {... } from "bun:test".  
3. **Configuration:** Map Jest config options (bail, collectCoverage, testTimeout, etc.) to bun test CLI flags or bunfig.toml. Remove Jest-specific configs (e.g., transform, haste).  
4. **DOM:** If using jsdom, switch to happy-dom and configure it via \--preload.  
5. **Module Mocks:** Adapt mocks relying on Jest's hoisting to use mock.module within a \--preload script.  
6. **Timer Mocks:** Implement workarounds (e.g., SinonJS) if using Jest's timer control functions. Assess feasibility if reliance is heavy.  
7. **Check Features:** Verify usage of any potentially missing Jest matchers or APIs against Bun's documentation.

### **F. Summary of Trade-offs**

The choice often boils down to a trade-off between performance and maturity:

* **Choose bun test if:** Prioritizing raw test speed is critical; starting a new project; working primarily with TS/JSX (simpler setup); the project doesn't rely heavily on Jest's advanced timer mocking or jsdom; the potential migration effort for existing projects is acceptable.8  
* **Choose Jest if:** Maximum feature completeness and stability are required; the project depends heavily on jsdom or advanced timer mocking; the extensive Jest ecosystem (plugins, reporters, tooling) is beneficial; migration from Bun's current feature gaps is too costly.6

### **G. Community Perspectives**

Discussions within the development community reflect this trade-off:

* Many users report significant and welcome speed improvements when switching to bun test.11  
* There's acknowledgment that Bun, being newer, is less mature and lacks the full feature set of Jest or Vitest.8  
* The integrated nature of Bun (bundler, runner, package manager in one) is often seen as a positive user experience improvement over the Node.js ecosystem's need to combine multiple tools.7  
* Some debate exists regarding the implications of testing on JavaScriptCore (Bun) versus V8 (Node/Jest), particularly for code not targeting browsers, though for standard JavaScript, the engine difference is often considered minor for unit tests.32 However, this engine difference is the root cause of concrete incompatibilities like the jsdom issue.12

### **Table: Feature Comparison Matrix: bun test vs. Jest**

| Feature | bun test Details | Jest Details | Key Differences/Notes |
| :---- | :---- | :---- | :---- |
| **Speed (Execution)** | Very fast (Zig, JSC, native code) 8 | Slower (V8, JS implementations, transpilation overhead) 30 | Bun is significantly faster. |
| **Speed (Startup)** | Very fast 4 | Slower 30 | Bun starts much faster. |
| **TS/JSX Support** | Built-in, fast transpilation 4 | Requires configuration (ts-jest, Babel) 30 | Bun setup is simpler and faster for TS/JSX. |
| **Basic Syntax** | Highly Jest-compatible (describe, test, expect) 9 | Standard Jest API | Very similar developer experience. |
| **Matcher Coverage** | High compatibility, most common matchers implemented 12 | Extensive set of matchers | Bun may miss some less common Jest matchers (e.g., toHaveReturned()).12 |
| **Module Mocking** | mock.module, requires \--preload for hoisting equivalent 18 | jest.mock, automatic hoisting | Different mechanism; Bun requires explicit preloading for pre-import mocks. |
| **Timer Mocking (Control)** | **Missing** built-in timer control (runAllTimers, etc.) 21 | Comprehensive timer control built-in | Major feature gap in Bun; requires workarounds (e.g., SinonJS).24 |
| **Date Mocking** | Supported (setSystemTime, jest.useFakeTimers) 21 | Supported (useFakeTimers) | Bun avoids Date constructor replacement issue.21 |
| **DOM Environment** | Requires happy-dom setup via \--preload 12 | Commonly uses jsdom via testEnvironment config | jsdom incompatible with Bun; requires migration to happy-dom. |
| **Snapshot Testing** | Supported (external & inline) 17 | Supported (external & inline) | High feature parity. |
| **Concurrency** | Runs tests serially in one process 5 | Supports concurrent test execution | Jest can run tests in parallel; Bun currently does not. |
| **Configuration** | Favors CLI flags; bunfig.toml for persistence 5 | Primarily via jest.config.js file | Bun can be simpler for basic setup; Jest offers more centralized config. |
| **Ecosystem Maturity** | Newer, smaller ecosystem, less tooling/integration 8 | Mature, large ecosystem, extensive tooling & community support 6 | Jest is more established and battle-tested. |
| **Test Isolation** | Potential for state leakage without careful management 10 | Generally stronger default isolation | Bun may require more explicit cleanup in afterEach. |

## **XII. Conclusion**

### **A. Summary of bun test Capabilities**

bun test emerges as a modern, integrated test runner built directly into the Bun toolkit. It offers a compelling feature set including:

* Exceptional execution speed leveraging Bun's runtime architecture.  
* A familiar, Jest-compatible API for defining suites, tests, and assertions.  
* Native, high-performance support for TypeScript and JSX.  
* Robust mocking capabilities for functions, spies, and modules.  
* Built-in snapshot testing (both file-based and inline).  
* Standard lifecycle hooks (beforeAll, afterAll, beforeEach, afterEach) with global scope via preloading.  
* Flexible test execution control via CLI flags and code modifiers (.skip, .only, .if, .skipIf, .todo, .failing, .each).  
* Configurable timeouts with robust handling, including automatic child process cleanup.

### **B. Key Advantages**

The primary advantages of adopting bun test are its significant **performance improvements** over traditional runners like Jest, its **seamless integration** within the Bun ecosystem (reducing setup complexity, especially for TypeScript/JSX projects), and its adherence to a **familiar Jest-like API**, which lowers the learning curve for many developers.

### **C. Current Limitations**

Despite its strengths, bun test is still evolving and has limitations compared to the more mature Jest framework. Notable gaps include:

* Lack of built-in **timer function mocking** (controlling setTimeout/setInterval).  
* Incompatibility with **jsdom**, requiring the use of happy-dom for DOM testing.  
* Potentially less comprehensive **matcher coverage** for niche scenarios.  
* Absence of built-in **concurrent test execution**.  
* A smaller **ecosystem** and potentially less robust **test isolation** without careful manual management.

### **D. Positioning**

bun test represents a high-performance, developer-friendly testing solution tightly integrated with the Bun runtime. Its speed and ease of use for common testing patterns, particularly with TypeScript/JSX, make it an attractive option, especially for new projects or teams prioritizing rapid feedback cycles. While its Jest compatibility facilitates migration, the existing feature gaps (primarily timer mocking and jsdom support) mean it's not yet a universal drop-in replacement for all Jest use cases. It is best viewed as a rapidly developing, powerful alternative whose suitability depends on the specific requirements and constraints of a given project.

#### **Works cited**

1. bun/README.md at main · oven-sh/bun \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/blob/main/README.md](https://github.com/oven-sh/bun/blob/main/README.md)  
2. Use Bun with Astro | Docs, accessed on April 13, 2025, [https://docs.astro.build/en/recipes/bun/](https://docs.astro.build/en/recipes/bun/)  
3. Bun Runtime: Speed Tests and Key Features \- Codemotion, accessed on April 13, 2025, [https://www.codemotion.com/magazine/frontend/bun-runtime-speed-tests-and-key-features/](https://www.codemotion.com/magazine/frontend/bun-runtime-speed-tests-and-key-features/)  
4. What is Bun? | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs](https://bun.sh/docs)  
5. bun test – Test runner | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs/cli/test](https://bun.sh/docs/cli/test)  
6. Bun's Test Runner: The Future of JavaScript Testing? \- The Green Report, accessed on April 13, 2025, [https://www.thegreenreport.blog/articles/buns-test-runner-the-future-of-javascript-testing/buns-test-runner-the-future-of-javascript-testing.html](https://www.thegreenreport.blog/articles/buns-test-runner-the-future-of-javascript-testing/buns-test-runner-the-future-of-javascript-testing.html)  
7. Any evidence that Bun is actually faster for practical tasks than node.js? \- Reddit, accessed on April 13, 2025, [https://www.reddit.com/r/node/comments/16f3422/any\_evidence\_that\_bun\_is\_actually\_faster\_for/](https://www.reddit.com/r/node/comments/16f3422/any_evidence_that_bun_is_actually_faster_for/)  
8. Comparing Bun with Jest \- Mastering Bun: The Ultimate Guide to the ..., accessed on April 13, 2025, [https://app.studyraid.com/en/read/11127/344668/comparing-bun-with-jest](https://app.studyraid.com/en/read/11127/344668/comparing-bun-with-jest)  
9. Writing tests – Test runner | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs/test/writing](https://bun.sh/docs/test/writing)  
10. Is Bun Ready for Unit Testing in 2024? \- JS 2 brain\!, accessed on April 13, 2025, [https://js2brain.com/blog/is-bun-ready-for-unit-testing](https://js2brain.com/blog/is-bun-ready-for-unit-testing)  
11. Bun vs Node Benchmark \- no one cares about speed as much as your CI does, accessed on April 13, 2025, [https://news.ycombinator.com/item?id=35034050](https://news.ycombinator.com/item?id=35034050)  
12. Migrate from Jest to Bun's test runner | Bun Examples, accessed on April 13, 2025, [https://bun.sh/guides/test/migrate-from-jest](https://bun.sh/guides/test/migrate-from-jest)  
13. Understanding Bun's testing environment \- Mastering Bun: The Ultimate Guide to the Modern JavaScript Runtime | StudyRaid, accessed on April 13, 2025, [https://app.studyraid.com/en/read/11127/344669/understanding-buns-testing-environment](https://app.studyraid.com/en/read/11127/344669/understanding-buns-testing-environment)  
14. bun/test/README.md at main · oven-sh/bun \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/blob/main/test/README.md](https://github.com/oven-sh/bun/blob/main/test/README.md)  
15. \`bun test\` | Bun中文文档, accessed on April 13, 2025, [https://www.bunjs.cn/docs/cli/test](https://www.bunjs.cn/docs/cli/test)  
16. Lifecycle hooks – Test runner | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs/test/lifecycle](https://bun.sh/docs/test/lifecycle)  
17. Snapshots – Test runner | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs/test/snapshots](https://bun.sh/docs/test/snapshots)  
18. Mocks – Test runner | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs/test/mocks](https://bun.sh/docs/test/mocks)  
19. \`bun test\` · Issue \#1825 · oven-sh/bun \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/issues/1825](https://github.com/oven-sh/bun/issues/1825)  
20. Mocking "fs" with Bun's test/mock \- node.js \- Stack Overflow, accessed on April 13, 2025, [https://stackoverflow.com/questions/77869048/mocking-fs-with-buns-test-mock](https://stackoverflow.com/questions/77869048/mocking-fs-with-buns-test-mock)  
21. Dates and times – Test runner | Bun Docs, accessed on April 13, 2025, [https://bun.sh/docs/test/time](https://bun.sh/docs/test/time)  
22. Set the system time in Bun's test runner | Bun Examples, accessed on April 13, 2025, [https://bun.sh/guides/test/mock-clock](https://bun.sh/guides/test/mock-clock)  
23. Missing jest timers, test.each, and module mocks · Issue \#3594 · oven-sh/bun \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/issues/3594](https://github.com/oven-sh/bun/issues/3594)  
24. Fake Timers in Bun Test, accessed on April 13, 2025, [https://js2brain.com/blog/fake-timers-in-bun-test](https://js2brain.com/blog/fake-timers-in-bun-test)  
25. Fake Timers in Bun Test \- YouTube, accessed on April 13, 2025, [https://www.youtube.com/watch?v=K80XVtPCpaE](https://www.youtube.com/watch?v=K80XVtPCpaE)  
26. Add snapshot testing · Issue \#1642 · oven-sh/bun \- GitHub, accessed on April 13, 2025, [https://github.com/oven-sh/bun/issues/1642](https://github.com/oven-sh/bun/issues/1642)  
27. Snapshot Testing \- Jest, accessed on April 13, 2025, [https://jestjs.io/docs/snapshot-testing](https://jestjs.io/docs/snapshot-testing)  
28. Use snapshot testing in bun test, accessed on April 13, 2025, [https://bun.sh/guides/test/snapshot](https://bun.sh/guides/test/snapshot)  
29. itsmeid/bun-test-utils \- NPM, accessed on April 13, 2025, [https://www.npmjs.com/package/@itsmeid/bun-test-utils](https://www.npmjs.com/package/@itsmeid/bun-test-utils)  
30. Major improvements after dropping Node+Jest in favor of Bun Test (production) \- Reddit, accessed on April 13, 2025, [https://www.reddit.com/r/node/comments/18rdwtu/major\_improvements\_after\_dropping\_nodejest\_in/](https://www.reddit.com/r/node/comments/18rdwtu/major_improvements_after_dropping_nodejest_in/)  
31. Best node.js test framework, with benchmarks \- Roman's blog, accessed on April 13, 2025, [https://romeerez.hashnode.dev/best-nodejs-test-framework-with-benchmarks](https://romeerez.hashnode.dev/best-nodejs-test-framework-with-benchmarks)  
32. Vitest vs. Jest \- Hacker News, accessed on April 13, 2025, [https://news.ycombinator.com/item?id=42245442](https://news.ycombinator.com/item?id=42245442)  
33. Master Snapshot Testing with Vite, Vitest, and Jest in TypeScript \- Sean Coughlin's Blog, accessed on April 13, 2025, [https://blog.seancoughlin.me/mastering-snapshot-testing-with-vite-vitest-or-jest-in-typescript](https://blog.seancoughlin.me/mastering-snapshot-testing-with-vite-vitest-or-jest-in-typescript)