```markdown
[![Marek Rozmus](https://archive.ph/LzZX3/4bdb2db2fa567a557c0e19f5b2e149016294ebab.jpg)](https://archive.ph/o/LzZX3/https://marek-rozmus.medium.com/)

![Photo for the article](https://archive.ph/LzZX3/4177137748aa9f25543176c6ce2d48f1c598d0dd.webp)
Photo by [Lia Trevarthen](https://archive.ph/o/LzZX3/https://unsplash.com/@melodi2) on [Unsplash](https://archive.ph/o/LzZX3/https://unsplash.com/)

# How should we test the component that is using local storage?

Here is a simple component that is using local storage.

```typescript
// filename: localstoragecomponent.tsx
const MyComponent = () => {
  const handleGetData = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    localStorage.getItem('mydata');
  };

  const handleSetData = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    localStorage.setItem('mydata', 'myvalue');
  };

  const handleRemoveData = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    localStorage.removeItem('mydata');
  };

  return (
    <div>
      <button onClick={handleGetData}>Get data</button>
      <button onClick={handleSetData}>Set data</button>
      <button onClick={handleRemoveData}>Remove data</button>
    </div>
  );
};
```

To test such component we should mock the local storage methods that we are using. There is no point in testing the local storage functionality itself (unless we are writing unit tests for local storage functionality).

We don’t need to test if local storage actually wrote some data, we want to test if our component called the locale storage’s method and that it called it with expected parameters.

We can mock it as any other property of window object. I wrote about mocking window object here: [Mocking window object with Jest](https://archive.ph/o/LzZX3/https://marek-rozmus.medium.com/mocking-window-object-d316050ae7a5).

```typescript
// filename: mocklocalstorage.ts
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: (...args: string[]) => mockGetItem(...args),
    setItem: (...args: string[]) => mockSetItem(...args),
    removeItem: (...args: string[]) => mockRemoveItem(...args),
  },
});
```

And the tests:

```typescript
// filename: localstoragecomponent.spec.ts
describe('Testing component', () => {
  beforeEach(() => {
    mockSetItem.mockClear();
    // Note: Original had mockSetItem.mockClear() twice. Assuming it should clear all mocks:
    mockGetItem.mockClear();
    mockRemoveItem.mockClear();
    // If the original's double mockSetItem clear was intentional, use this instead:
    // mockSetItem.mockClear();
    // mockSetItem.mockClear();
  })

  it('should call local storage setItem method when button clicked', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button', { name: /set data/i });

    await userEvent.click(button);
    expect(mockSetItem).toHaveBeenCalledTimes(1);
    expect(mockSetItem).toHaveBeenCalledWith('mydata', 'myvalue');
  });

  it('should call local storage getItem method when button clicked', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button', { name: /get data/i });

    await userEvent.click(button);
    expect(mockGetItem).toHaveBeenCalledTimes(1);
    expect(mockGetItem).toHaveBeenCalledWith('mydata');
  });

  it('should call local storage removeItem method when button clicked', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button', { name: /remove data/i });

    await userEvent.click(button);
    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith('mydata');
  });
});
```

## spyOn usage to mock local storage

We can also achieve same setup but with `spyOn` method.

```typescript
// filename: mocksetitemwithspy.ts (Example within a test)
it('should call local storage setItem method when button clicked', async () => {
  render(<MyComponent />);
  const button = screen.getByRole('button', { name: /set data/i });

  const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');

  await userEvent.click(button);
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(mockSetItem).toHaveBeenCalledWith('mydata', 'myvalue');

  // Important: Restore original implementation after test if needed elsewhere
  mockSetItem.mockRestore();
});
```

In this case the original implementation of local storage method will be executed. But we can easily fix it with mocking the implementation:

```typescript
// filename: mocksetitemwithspyimpl.ts (Example within a test)
it('should call local storage setItem method when button clicked', async () => {
  render(<MyComponent />);
  const button = screen.getByRole('button', { name: /set data/i });

  const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
  mockSetItem.mockImplementation(() => {}); // Provide a mock implementation

  await userEvent.click(button);
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(mockSetItem).toHaveBeenCalledWith('mydata', 'myvalue');

  // Important: Restore original implementation after test
  mockSetItem.mockRestore();
});
```

Simpler and cleaner approach than the first one with mocking.

## The code

[![Buy Me A Coffee](https://archive.ph/LzZX3/b89379e20fcb43beec496547d8dc8fd80c0c90c4.webp)](https://archive.ph/o/LzZX3/https://www.buymeacoffee.com/froostrat)
```
