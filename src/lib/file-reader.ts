/**
 * Reads the content of a File object as text.
 * Returns a Promise that resolves with the text content or rejects on error.
 */
export function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			const result = event.target?.result;
			if (typeof result === 'string') {
				resolve(result);
			} else {
				reject(new Error('Failed to read file content as text.'));
			}
		};

		reader.onerror = () => {
			reject(reader.error ?? new Error('Unknown error reading file.'));
		};

		try {
			reader.readAsText(file);
		} catch (error) {
			reject(error);
		}
	});
} 