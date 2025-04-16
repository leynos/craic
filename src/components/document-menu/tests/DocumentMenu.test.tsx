/// <reference lib="dom" />
import { describe, test, expect, mock, afterEach } from "bun:test";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Assuming component path and props - Adjust if needed
import DocumentMenu from "../DocumentMenu"; // Import the actual component
import type { AnnotationSet } from "../../../types"; // Corrected import path

// Placeholder component for testing
// interface DocumentMenuProps {
// 	documentId: string | null;
// 	annotationSets: AnnotationSet[];
// 	selectedSetId: string | null;
// 	onAddSet: () => void;
// 	onSelectSet: (setId: string) => void;
// 	onRemoveSet: () => void;
// }
//
// // biome-ignore lint/suspicious/noExplicitAny: Placeholder component
// const DocumentMenu = ({ documentId, annotationSets, selectedSetId, onAddSet, onSelectSet, onRemoveSet }: DocumentMenuProps): any => {
// 	if (!documentId) {
// 		return null;
// 	}
//
// 	return (
// 		<div>
// 			<label htmlFor="annotation-set-select">Annotation Set:</label>
// 			<select
// 				id="annotation-set-select"
// 				value={selectedSetId ?? ""}
// 				onChange={(e) => onSelectSet(e.target.value)}
// 			>
// 				<option value="" disabled>Select a set...</option>
// 				{annotationSets.map(set => (
// 					<option key={set.id} value={set.id}>{set.name}</option>
// 				))}
// 			</select>
// 			<button type="button" onClick={onAddSet}>Add Annotation Set</button>
// 			{selectedSetId && (
// 				<button type="button" onClick={onRemoveSet}>Remove Annotation Set</button>
// 			)}
// 		</div>
// 	);
// };
//
// // --- End Placeholder ---

const mockAnnotationSets: AnnotationSet[] = [
	{ id: "set-1", name: "Set Alpha", documentId: "doc-1" },
	{ id: "set-2", name: "Set Beta", documentId: "doc-1" },
	{ id: "set-3", name: "Set Gamma", documentId: "doc-1" },
];

describe("DocumentMenu Component", () => {
	afterEach(cleanup);

	test("should render nothing if documentId is null", () => {
		const props = {
			documentId: null,
			annotationSets: [],
			selectedSetId: null,
			onAddSet: mock(() => {}),
			onSelectSet: mock(() => {}),
			onRemoveSet: mock(() => {}),
		};
		const { container } = render(<DocumentMenu {...props} />);
		expect(container.firstChild).toBeNull();
	});

	test("should render the select dropdown and add button when documentId is provided", () => {
		const props = {
			documentId: "doc-1",
			annotationSets: [],
			selectedSetId: null,
			onAddSet: mock(() => {}),
			onSelectSet: mock(() => {}),
			onRemoveSet: mock(() => {}),
		};
		render(<DocumentMenu {...props} />);

		expect(
			screen.getByRole("combobox", { name: /annotation set/i }),
		).not.toBeNull();
		expect(
			screen.getByLabelText(/add new annotation set/i),
		).not.toBeNull();
	});

	test("should display annotation sets in the dropdown", () => {
		const props = {
			documentId: "doc-1",
			annotationSets: mockAnnotationSets,
			selectedSetId: null,
			onAddSet: mock(() => {}),
			onSelectSet: mock(() => {}),
			onRemoveSet: mock(() => {}),
		};
		render(<DocumentMenu {...props} />);

		const select = screen.getByRole("combobox", { name: /annotation set/i });
		expect(select).not.toBeNull();

		// Check for options (use queryAllByRole for multiple)
		const options = screen.getAllByRole("option");
		// Expect options corresponding to the sets + potentially a default/placeholder
		expect(options.length).toBeGreaterThanOrEqual(mockAnnotationSets.length);
		expect(screen.getByRole("option", { name: "Set Alpha" })).not.toBeNull();
		expect(screen.getByRole("option", { name: "Set Beta" })).not.toBeNull();
		expect(screen.getByRole("option", { name: "Set Gamma" })).not.toBeNull();
	});

	test("should call onSelectSet when a set is selected from the dropdown", async () => {
		const user = userEvent.setup();
		const handleSelectSet = mock((id: string) => {
			expect(id).toBe("set-2");
		});
		const props = {
			documentId: "doc-1",
			annotationSets: mockAnnotationSets,
			selectedSetId: null,
			onAddSet: mock(() => {}),
			onSelectSet: handleSelectSet,
			onRemoveSet: mock(() => {}),
		};
		render(<DocumentMenu {...props} />);

		const select = screen.getByRole("combobox", { name: /annotation set/i });
		await user.selectOptions(select, "set-2");

		expect(handleSelectSet).toHaveBeenCalledTimes(1);
	});

	test("should call onAddSet when the add button is clicked", async () => {
		const user = userEvent.setup();
		const handleAddSet = mock(() => {});
		const props = {
			documentId: "doc-1",
			annotationSets: [],
			selectedSetId: null,
			onAddSet: handleAddSet,
			onSelectSet: mock(() => {}),
			onRemoveSet: mock(() => {}),
		};
		render(<DocumentMenu {...props} />);

		const addButton = screen.getByLabelText(/add new annotation set/i);
		await user.click(addButton);

		expect(handleAddSet).toHaveBeenCalledTimes(1);
	});

	test("should show remove button only when a set is selected", () => {
		const propsBase = {
			documentId: "doc-1",
			annotationSets: mockAnnotationSets,
			onAddSet: mock(() => {}),
			onSelectSet: mock(() => {}),
			onRemoveSet: mock(() => {}),
		};

		// Case 1: No set selected
		const { rerender } = render(
			<DocumentMenu {...propsBase} selectedSetId={null} />,
		);
		expect(
			screen.queryByLabelText(/remove selected annotation set/i),
		).toBeNull();

		// Case 2: A set is selected
		rerender(<DocumentMenu {...propsBase} selectedSetId="set-1" />);
		expect(
			screen.getByLabelText(/remove selected annotation set/i),
		).not.toBeNull();
	});

	test("should call onRemoveSet when the remove button is clicked", async () => {
		const user = userEvent.setup();
		const handleRemoveSet = mock(() => {});
		const props = {
			documentId: "doc-1",
			annotationSets: mockAnnotationSets,
			selectedSetId: "set-1", // A set must be selected to show the button
			onAddSet: mock(() => {}),
			onSelectSet: mock(() => {}),
			onRemoveSet: handleRemoveSet,
		};
		render(<DocumentMenu {...props} />);

		const removeButton = screen.getByLabelText(/remove selected annotation set/i);
		await user.click(removeButton);

		expect(handleRemoveSet).toHaveBeenCalledTimes(1);
	});

	test("should display the correct set as selected in the dropdown", () => {
		const props = {
			documentId: "doc-1",
			annotationSets: mockAnnotationSets,
			selectedSetId: "set-3", // Pre-select Set Gamma
			onAddSet: mock(() => {}),
			onSelectSet: mock(() => {}),
			onRemoveSet: mock(() => {}),
		};
		render(<DocumentMenu {...props} />);

		const select = screen.getByRole("combobox", { name: /annotation set/i }) as HTMLSelectElement;
		expect(select.value).toBe("set-3");

		// Check which option is marked as selected
		const selectedOption = screen.getByRole("option", { name: "Set Gamma" }) as HTMLOptionElement;
		expect(selectedOption.selected).toBe(true);
	});
}); 