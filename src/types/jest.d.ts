import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any> {
      mockReturnValue: (value: T) => Mock<T, Y>;
      mockImplementation: (fn: (...args: Y) => T) => Mock<T, Y>;
      mockClear: () => void;
    }
  }
} 