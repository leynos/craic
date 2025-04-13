// src/components/document-upload/DocumentUpload.tsx
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
// Import the function for default usage
import { readFileAsText as defaultReadFileAsText } from '../../lib/file-reader';

interface DocumentUploadProps {
	addDocument: (name: string, content: string) => void;
	// Prop for injecting the utility function during tests
	fileReader?: typeof defaultReadFileAsText;
}

const ACCEPTED_FILE_TYPES = '.md,.txt';
const ACCEPTED_MIME_TYPES = ['text/markdown', 'text/plain'];

export function DocumentUpload({
	addDocument,
	fileReader,
}: DocumentUploadProps) {
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Use injected function or default import
	const readFileToUse = fileReader ?? defaultReadFileAsText;

	const handleFileChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			// Basic client-side validation (redundant with 'accept' but good practice)
			if (
				!ACCEPTED_MIME_TYPES.includes(file.type) &&
				!ACCEPTED_FILE_TYPES.split(',').some((ext) => file.name.endsWith(ext))
			) {
				setError(`Unsupported file type. Please upload ${ACCEPTED_FILE_TYPES}.`);
				// Reset the input field value so the same invalid file can be selected again
				if (inputRef.current) {
					inputRef.current.value = '';
				}
				return;
			}

			setError(null); // Clear previous errors

			try {
				// Use the selected function (injected or default)
				const content = await readFileToUse(file);
				addDocument(file.name, content);
			} catch (err) {
				console.error('Error reading file:', err);
				setError(err instanceof Error ? err.message : 'Error reading file.');
			} finally {
				// Reset input value after processing (success or failure to read as string)
				if (inputRef.current) {
					inputRef.current.value = '';
				}
			}
		},
		[addDocument, readFileToUse] // Depend on the function being used
	);

	// Basic styling with Tailwind classes (adjust as needed)
	return (
		<div className="p-4 border border-gray-400 border-dashed rounded-md text-center">
			<label
				htmlFor="document-upload"
				className="text-blue-600 hover:text-blue-800 cursor-pointer"
			>
				Upload Document
			</label>
			<input
				id="document-upload"
				ref={inputRef}
				type="file"
				accept={ACCEPTED_FILE_TYPES}
				onChange={handleFileChange}
				role="button"
				className="hidden"
				aria-label="Upload Document"
			/>
			<p className="mt-2 text-gray-500 text-sm">
				Supported formats: {ACCEPTED_FILE_TYPES}
			</p>
			{error && <p className="mt-1 text-red-600 text-sm">{error}</p>}
		</div>
	);
} 