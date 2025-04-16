/// <reference lib="dom" />
import { describe, test, expect, mock, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Assume the component will be created here later
// import DocumentUpload from '../DocumentUpload';

// Mock component until it exists
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const MockDocumentUpload = ({ onUpload }: { onUpload: (content: string, fileName: string) => void }): any => {
	// A basic placeholder that simulates the upload area structure
	return (
		<div>
			<label htmlFor="file-upload">
				<span>Upload Area (.md, .txt)</span>
				<input
					id="file-upload"
					type="file"
					accept=".md,.txt"
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					onChange={(e: any) => {
						const file = e.target.files?.[0];
						if (file) {
							// Simulate reading - assumes FileReader mock in setup
							const reader = new FileReader();
							reader.onload = () => {
								onUpload(reader.result as string, file.name);
							};
							reader.readAsText(file);
						}
					}}
					style={{ display: 'none' }} // Hide default input visually
				/>
			</label>
			{/* Placeholder for drag/drop zone if visually distinct */}
			<div data-testid="drop-zone" style={{ border: '1px dashed grey', padding: '20px' }}>
				Drag and drop here
			</div>
		</div>
	);
};

// Replace MockDocumentUpload with the real one once created
const DocumentUpload = MockDocumentUpload;


describe('DocumentUpload Component', () => {
	// Clean up the DOM after each test
	afterEach(cleanup);

	test('should render the upload area and display supported formats', () => {
		const handleUpload = mock(() => {});
		render(<DocumentUpload onUpload={handleUpload} />);

		// Check for an accessible element acting as the upload trigger
		// This might be a button, a label linked to a hidden input, etc.
		// We'll use a label text for this example, assuming the label wraps the input
		// or uses htmlFor. Adjust query as needed based on actual implementation.
		const uploadLabel = screen.getByText(/upload area/i);
		expect(uploadLabel).toBeInTheDocument();

		// Check if supported formats are mentioned
		expect(screen.getByText(/\(\.md, \.txt\)/i)).toBeInTheDocument();

		// Check accessibility: Ensure the input itself is linked correctly
		const fileInput = screen.getByLabelText(/upload area/i);
		expect(fileInput).toBeInTheDocument();
		expect(fileInput).toHaveAttribute('type', 'file');
		expect(fileInput).toHaveAttribute('accept', '.md,.txt');
	});

	test('should call onUpload with file content and name when a file is selected via click', async () => {
		const user = userEvent.setup();
		const handleUpload = mock((content: string, fileName: string) => {
			expect(content).toBe('## Test Markdown Content');
			expect(fileName).toBe('test.md');
		});

		render(<DocumentUpload onUpload={handleUpload} />);

		const fileInput = screen.getByLabelText(/upload area/i); // Find the hidden input
		const testFile = new File(['## Test Markdown Content'], 'test.md', { type: 'text/markdown' });

		// userEvent.upload is designed for this
		await user.upload(fileInput, testFile);

		// Verify the mock was called (implicitly checked by assertions inside mock)
		expect(handleUpload).toHaveBeenCalledTimes(1);
	});

	test('should call onUpload with file content and name when a file is dropped', async () => {
		// Note: Simulating drag and drop with user-event requires careful event setup.
		// userEvent doesn't have a direct `drop` utility like `upload`.
		// We need to manually dispatch events.
		// Bun/HappyDOM support for DataTransfer might have limitations.

		userEvent.setup(); // Though not directly used for drop simulation here
		const handleUpload = mock((content: string, fileName: string) => {
			expect(content).toBe('Plain text content.');
			expect(fileName).toBe('document.txt');
		});

		render(<DocumentUpload onUpload={handleUpload} />);

		const dropZone = screen.getByTestId('drop-zone'); // Assuming a distinct drop zone element
		const testFile = new File(['Plain text content.'], 'document.txt', { type: 'text/plain' });

		// Simulate the drop event
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(testFile);
		// dataTransfer.files = dataTransfer.items; // Important step - REMOVED as files is readonly

		// Manually dispatching drop event - this might need refinement depending
		// on how HappyDOM handles DataTransfer and how the component implements drop
		// We are skipping dragenter/dragover for simplicity here, but real implementation
		// often requires preventing default on those for drop to work.
		dropZone.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true }));


		// Because the mock FileReader is synchronous in setup, the result should be immediate.
		// If FileReader were async, we'd need waitFor here.
		expect(handleUpload).toHaveBeenCalledTimes(1);

	});

	test('should only accept specified file types', async () => {
		const user = userEvent.setup();
		const handleUpload = mock(() => {}); // Should not be called

		render(<DocumentUpload onUpload={handleUpload} />);

		const fileInput = screen.getByLabelText(/upload area/i);
		const invalidFile = new File(['<xml>content</xml>'], 'invalid.xml', { type: 'application/xml' });

		// Attempt to upload an invalid file type
		await user.upload(fileInput, invalidFile);

		// Assert that onUpload was NOT called because the type is wrong
		// (This assumes the component or the browser's input[accept] handles this)
		// Note: Browser behaviour for 'accept' isn't perfectly replicated in tests.
		// The component might need explicit logic to check the file type.
		// For this test, we assume the mock component's basic onChange logic
		// doesn't prevent the upload based on type, so this test might *fail*
		// with the mock implementation and pass only with the real one.
		// A more robust test would involve checking for an error message or state.
		expect(handleUpload).not.toHaveBeenCalled();

		// We can also assert the input still reflects the 'accept' attribute
		expect(fileInput).toHaveAttribute('accept', '.md,.txt');
	});

}); 