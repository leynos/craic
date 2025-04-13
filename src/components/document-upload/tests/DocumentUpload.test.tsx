/// <reference types="vitest/globals" />
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, mock, afterEach } from 'bun:test';
import { cleanup } from '@testing-library/react';
import { DocumentUpload } from '../DocumentUpload.tsx';
// Removed import of readFileAsText

afterEach(cleanup);

describe('DocumentUpload', () => {
	it('should render upload area and supported formats', () => {
		const mockAddDocument = mock(() => {});
		render(<DocumentUpload addDocument={mockAddDocument} />);

		const label = screen.getByText(/Upload Document/i);
		expect(label).toBeInTheDocument();
		const input = screen.getByTestId('document-upload-input');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('type', 'file');
		expect(input).toHaveAttribute('accept', '.md,.txt');

		const formatHint = screen.getByText(/Supported formats:/i);
		expect(formatHint).toBeInTheDocument();
	});

	// Skip tests involving file change + mock due to bun test/happy-dom issue
	// causing multiple renders and failing queries.
	it('should call addDocument with file content on valid file selection', async () => {
		const mockAddDocument = mock(() => {});
		const fileContent = '# Markdown Content';
		const file = new File([fileContent], 'test.md', { type: 'text/markdown' });

		// Create a mock for the utility function specifically for this test
		const mockReadFileUtil = mock(async (_f: File): Promise<string> => {
			return fileContent;
		});

		// Render the component, injecting the mock utility function
		render(
			<DocumentUpload
				addDocument={mockAddDocument}
				fileReader={mockReadFileUtil}
			/>
		);

		const input = screen.getByTestId('document-upload-input');

		// Simulate file selection
		await act(async () => {
			fireEvent.change(input, { target: { files: [file] } });
			// Allow promises to resolve
			await new Promise(res => setTimeout(res, 0));
		});

		// Verify the mock utility was called
		expect(mockReadFileUtil).toHaveBeenCalledWith(file);

		// Verify addDocument was called
		expect(mockAddDocument).toHaveBeenCalledTimes(1);
		expect(mockAddDocument).toHaveBeenCalledWith('test.md', fileContent);
	});

	it('should show error if file reading fails', async () => {
		const mockAddDocument = mock(() => {});
		const file = new File(['content'], 'test.txt', { type: 'text/plain' });
		const error = new Error('Read failed!');

		// Create a mock for the utility function that rejects
		const mockReadFileUtil = mock(async (_f: File): Promise<string> => {
			throw error;
		});

		// Render with the injected mock
		render(
			<DocumentUpload
				addDocument={mockAddDocument}
				fileReader={mockReadFileUtil}
			/>
		);
		const input = screen.getByTestId('document-upload-input');

		await act(async () => {
			fireEvent.change(input, { target: { files: [file] } });
			await new Promise(res => setTimeout(res, 0));
		});

		// Verify the mock utility was called
		expect(mockReadFileUtil).toHaveBeenCalledWith(file);
		// Check that the error message is displayed
		const errorElement = await screen.findByText(error.message);
		expect(errorElement).toBeInTheDocument();
		expect(mockAddDocument).not.toHaveBeenCalled();
	});

	it('should not call addDocument for unsupported file types', async () => {
		const mockAddDocument = mock(() => {});
		// Create a mock utility function (although it shouldn't be called)
		const mockReadFileUtil = mock(async (_f: File): Promise<string> => "");

		render(
			<DocumentUpload
				addDocument={mockAddDocument}
				fileReader={mockReadFileUtil} // Inject it
			/>
		);

		const input = screen.getByTestId('document-upload-input');
		const file = new File(['binary'], 'test.jpg', { type: 'image/jpeg' });

		await act(async () => {
			fireEvent.change(input, { target: { files: [file] } });
			await new Promise(res => setTimeout(res, 0));
		});

		// Verify the utility was NOT called
		expect(mockReadFileUtil).not.toHaveBeenCalled();
		expect(mockAddDocument).not.toHaveBeenCalled();
	});
}); 