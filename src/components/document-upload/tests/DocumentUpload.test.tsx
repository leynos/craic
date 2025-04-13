import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, mock } from 'bun:test';
import { DocumentUpload } from '../DocumentUpload';

describe('DocumentUpload', () => {
	it('should render upload area and supported formats', () => {
		const mockAddDocument = mock(() => {});
		render(<DocumentUpload addDocument={mockAddDocument} />);

		// Check for accessible elements
		const label = screen.getByText(/Upload Document/i);
		expect(label).toBeInTheDocument();
		const input = screen.getByLabelText(/Upload Document/i);
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('type', 'file');
		expect(input).toHaveAttribute('accept', '.md,.txt');

		// Check for format hint
		expect(screen.getByText(/Supported formats: \.md, \.txt/i)).toBeInTheDocument();
	});

	it('should call addDocument with file content on valid file selection', async () => {
		const mockAddDocument = mock(() => {});
		render(<DocumentUpload addDocument={mockAddDocument} />);

		const input = screen.getByLabelText(/Upload Document/i);
		const fileContent = '# Markdown Content';
		const file = new File([fileContent], 'test.md', { type: 'text/markdown' });

		// Get the globally mocked FileReader constructor and instance
		const MockFileReaderConstructor = FileReader as ReturnType<typeof mock>;
		const mockFileReaderInstance = MockFileReaderConstructor.mock.results[0]?.value;

		// Need to ensure the instance used by the component is the one we manipulate.
		// This interaction with the global mock might be tricky.
		if (!mockFileReaderInstance) {
			throw new Error("Mock FileReader instance not found. Check setup.ts mock.");
		}

		// Simulate file reader load event on the specific instance
		mockFileReaderInstance.readAsText.mockImplementationOnce(() => {
			mockFileReaderInstance.result = fileContent;
			// Manually call onload for this instance
			setTimeout(() => mockFileReaderInstance.onload(), 0);
		});

		// Simulate file selection
		await act(async () => {
			fireEvent.change(input, { target: { files: [file] } });
		});

		// Verify the instance's readAsText was called
		expect(mockFileReaderInstance.readAsText).toHaveBeenCalledWith(file);

		// Verify addDocument was called with correct arguments
		expect(mockAddDocument).toHaveBeenCalledTimes(1);
		expect(mockAddDocument).toHaveBeenCalledWith('test.md', fileContent);
	});

	it('should not call addDocument for unsupported file types (though accept attribute should prevent this)', async () => {
		const mockAddDocument = mock(() => {});
		render(<DocumentUpload addDocument={mockAddDocument} />);

		const input = screen.getByLabelText(/Upload Document/i);
		const file = new File(['binary content'], 'test.jpg', { type: 'image/jpeg' });

		// Get the globally mocked FileReader constructor and instance
		const MockFileReaderConstructor = FileReader as ReturnType<typeof mock>;
		const mockFileReaderInstance = MockFileReaderConstructor.mock.results[0]?.value;

		// Simulate file selection
		await act(async () => {
			fireEvent.change(input, { target: { files: [file] } });
		});

		// Verify addDocument was NOT called
		if (mockFileReaderInstance) { // Only check if instance was potentially created
			expect(mockFileReaderInstance.readAsText).not.toHaveBeenCalledWith(file);
		}
		expect(mockAddDocument).not.toHaveBeenCalled();
	});
}); 