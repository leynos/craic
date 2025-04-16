/// <reference lib="dom" />
import { describe, test, expect, mock, afterEach } from "bun:test";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Document } from "../../../types"; // Assuming type location
import DocumentList from "../DocumentList"; // Import the actual component

// Placeholder component for testing
// interface DocumentListProps {
// 	documents: Document[];
// 	selectedDocumentId: string | null;
// 	onSelectDocument: (id: string) => void;
// 	onRemoveDocument: (id: string) => void;
// }
//
// // biome-ignore lint/suspicious/noExplicitAny: Placeholder component
// const DocumentList = ({ documents, selectedDocumentId, onSelectDocument, onRemoveDocument }: DocumentListProps): any => {
// 	if (documents.length === 0) {
// 		return <p>No documents uploaded yet.</p>;
// 	}
//
// 	return (
// 		<ul>
// 			{documents.map((doc) => (
// 				<li
// 					key={doc.id}
// 					aria-selected={doc.id === selectedDocumentId}
// 					data-testid={doc.id} // Corrected: Use doc.id directly
// 				>
// 					<button type="button" onClick={() => onSelectDocument(doc.id)}>
// 						{doc.name}
// 					</button>
// 					<button
// 						type="button"
// 						onClick={() => onRemoveDocument(doc.id)}
// 						aria-label={`Remove ${doc.name}`}
// 					>
// 						X
// 					</button>
// 				</li>
// 			))}
// 		</ul>
// 	);
// };
// // --- End Placeholder ---

// Mock data for testing
const mockDocuments: Document[] = [
	{ id: "doc-1", name: "Document Alpha.md", content: "" },
	{ id: "doc-2", name: "Document Beta.txt", content: "" },
	{ id: "doc-3", name: "Document Gamma.md", content: "" },
];

describe("DocumentList Component", () => {
	afterEach(cleanup);

	test("should render 'No documents' message when the list is empty", () => {
		render(
			<DocumentList
				documents={[]}
				selectedDocumentId={null}
				onSelectDocument={mock(() => {})}
				onRemoveDocument={mock(() => {})}
			/>,
		);
		expect(screen.getByText(/no documents uploaded yet/i)).not.toBeNull();
	});

	test("should render a list of documents", () => {
		render(
			<DocumentList
				documents={mockDocuments}
				selectedDocumentId={null}
				onSelectDocument={mock(() => {})}
				onRemoveDocument={mock(() => {})}
			/>,
		);

		const listItems = screen.getAllByRole("listitem");
		expect(listItems.length).toBe(mockDocuments.length);
		expect(screen.getByText("Document Alpha.md")).not.toBeNull();
		expect(screen.getByText("Document Beta.txt")).not.toBeNull();
		expect(screen.getByText("Document Gamma.md")).not.toBeNull();
	});

	test("should highlight the selected document", () => {
		render(
			<DocumentList
				documents={mockDocuments}
				selectedDocumentId="doc-2"
				onSelectDocument={mock(() => {})}
				onRemoveDocument={mock(() => {})}
			/>,
		);

		const selectedItem = screen.getByTestId("doc-2");
		expect(selectedItem.getAttribute("aria-selected")).toBe("true");

		const nonSelectedItem = screen.getByTestId("doc-1");
		expect(nonSelectedItem.getAttribute("aria-selected")).toBe("false");
	});

	test("should call onSelectDocument with the correct ID when a document name is clicked", async () => {
		const user = userEvent.setup();
		const handleSelect = mock((id: string) => {
			expect(id).toBe("doc-1");
		});

		render(
			<DocumentList
				documents={mockDocuments}
				selectedDocumentId={null}
				onSelectDocument={handleSelect}
				onRemoveDocument={mock(() => {})}
			/>,
		);

		const docButton = screen.getByRole("button", { name: "Document Alpha.md" });
		await user.click(docButton);
		expect(handleSelect).toHaveBeenCalledTimes(1);
	});

	test("should call onRemoveDocument with the correct ID when the remove button is clicked", async () => {
		const user = userEvent.setup();
		const handleRemove = mock((id: string) => {
			expect(id).toBe("doc-3");
		});

		render(
			<DocumentList
				documents={mockDocuments}
				selectedDocumentId={null}
				onSelectDocument={mock(() => {})}
				onRemoveDocument={handleRemove}
			/>,
		);

		const removeButton = screen.getByRole("button", {
			name: /remove document gamma\.md/i,
		});
		await user.click(removeButton);
		expect(handleRemove).toHaveBeenCalledTimes(1);
	});
}); 