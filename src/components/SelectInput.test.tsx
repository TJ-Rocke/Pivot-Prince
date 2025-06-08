import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SelectInput from "./SelectInput";

describe("SelectInput Component", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with correct initial state", () => {
    render(<SelectInput selected={null} onSelect={mockOnSelect} />);

    // Check if the component renders correctly
    expect(screen.getByText("Template")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("calls onSelect with correct value when option is selected", async () => {
    render(<SelectInput selected={null} onSelect={mockOnSelect} />);

    // Open the dropdown
    const selectButton = screen.getByRole("button", { name: /template/i });
    await userEvent.click(selectButton);

    // Select "PNOV Bridge" option
    const pnovOption = screen.getByText("PNOV Bridge");
    await userEvent.click(pnovOption);

    // Verify that onSelect was called with "PNOV Bridge"
    expect(mockOnSelect).toHaveBeenCalledWith("PNOV Bridge");
  });

  test("displays selected value when provided", () => {
    render(<SelectInput selected="PNOV Bridge" onSelect={mockOnSelect} />);

    // Verify that the selected value is displayed
    expect(screen.getByText("PNOV Bridge")).toBeInTheDocument();
  });

  test("resets when selected becomes null", () => {
    const { rerender } = render(
      <SelectInput selected="PNOV Bridge" onSelect={mockOnSelect} />
    );

    // Initially shows PNOV Bridge
    expect(screen.getByText("PNOV Bridge")).toBeInTheDocument();

    // Rerender with selected as null
    rerender(<SelectInput selected={null} onSelect={mockOnSelect} />);

    // Should show placeholder text instead of selection
    expect(screen.getByText("Template")).toBeInTheDocument();
  });
});
