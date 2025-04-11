import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DocumentMenu from "../DocumentMenu";

describe("DocumentMenu", () => {
  const mockAnnotationSets = [
    {
      id: "set-1",
      name: "Annotation Set 1",
      annotations: [],
    },
    {
      id: "set-2",
      name: "Annotation Set 2",
      annotations: [],
    },
  ];

  const mockProps = {
    annotationSets: mockAnnotationSets,
    selectedSetId: null,
    onAddSet: vi.fn(),
    onRemoveSet: vi.fn(),
    onSelectSet: vi.fn(),
  };

  it("renders annotation sets dropdown", () => {
    render(<DocumentMenu {...mockProps} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeDefined();
    expect(screen.getByText("Annotation Set 1")).toBeDefined();
    expect(screen.getByText("Annotation Set 2")).toBeDefined();
  });

  it("calls onSelectSet when selecting an annotation set", () => {
    render(<DocumentMenu {...mockProps} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, {
      target: { value: "set-1" },
    });
    expect(mockProps.onSelectSet).toHaveBeenCalledWith("set-1");
  });

  it("calls onAddSet when clicking add button", () => {
    render(<DocumentMenu {...mockProps} />);
    const addButton = screen.getByRole("button", { name: "Add Set" });
    fireEvent.click(addButton);
    expect(mockProps.onAddSet).toHaveBeenCalled();
  });

  it("shows remove button only when a set is selected", () => {
    const { rerender } = render(<DocumentMenu {...mockProps} />);
    expect(screen.queryByRole("button", { name: "Remove Set" })).toBeNull();

    rerender(<DocumentMenu {...mockProps} selectedSetId="set-1" />);
    expect(screen.getByRole("button", { name: "Remove Set" })).toBeDefined();
  });

  it("calls onRemoveSet when clicking remove button", () => {
    render(<DocumentMenu {...mockProps} selectedSetId="set-1" />);
    const removeButton = screen.getByRole("button", { name: "Remove Set" });
    fireEvent.click(removeButton);
    expect(mockProps.onRemoveSet).toHaveBeenCalledWith("set-1");
  });
});
