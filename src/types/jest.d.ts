import "@testing-library/jest-dom";

declare global {
  namespace jest {
    interface Mock<TReturn = unknown, TArgs extends unknown[] = unknown[]> {
      mockReturnValue: (value: TReturn) => Mock<TReturn, TArgs>;
      mockImplementation: (
        fn: (...args: TArgs) => TReturn,
      ) => Mock<TReturn, TArgs>;
      mockClear: () => void;
    }
  }
}
