import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Form from "./Form";

// Mock the SelectInput component
jest.mock("./SelectInput", () => {
  return jest.fn(({ onSelect }) => {
    return (
      <div>
        <select
          data-testid="template-select"
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="">Select template</option>
          <option value="PNOV Bridge">PNOV Bridge</option>
        </select>
      </div>
    );
  });
});

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ report: "Mocked report content" }),
  })
) as jest.Mock;

describe("Form Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form elements correctly", () => {
    render(<Form />);
    expect(screen.getByText("Try it out!")).toBeInTheDocument();
    expect(screen.getByText("Choose File")).toBeInTheDocument();
    expect(screen.getByText("No file chosen")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate" })
    ).toBeInTheDocument();
  });

  test("updates file name when file is selected", async () => {
    render(<Form />);

    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const fileInput = screen.getByLabelText("Choose File");

    await userEvent.upload(fileInput, file);

    expect(screen.getByText("test.csv")).toBeInTheDocument();
  });

  test("form submission triggers fetch request", async () => {
    render(<Form />);

    // Set file
    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const fileInput = screen.getByLabelText("Choose File");
    await userEvent.upload(fileInput, file);

    // Select template
    const templateSelect = screen.getByTestId("template-select");
    await userEvent.selectOptions(templateSelect, "PNOV Bridge");

    // Submit the form
    const generateButton = screen.getByRole("button", { name: "Generate" });
    await userEvent.click(generateButton);

    expect(fetch).toHaveBeenCalled();
  });

  test("displays generated report after successful form submission", async () => {
    render(<Form />);

    // Mock a successful form submission
    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const fileInput = screen.getByLabelText("Choose File");
    await userEvent.upload(fileInput, file);

    // Select template
    const templateSelect = screen.getByTestId("template-select");
    await userEvent.selectOptions(templateSelect, "PNOV Bridge");

    // Force the report to display by manipulating the component's state
    const formElement = screen.getByRole("form");
    fireEvent.submit(formElement);

    await waitFor(() => {
      expect(screen.queryByText("Generated Report")).toBeInTheDocument();
    });
  });

  test("copy functionality copies complete report text", async () => {
    // Setup
    render(<Form />);

    // Mock report generation
    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const fileInput = screen.getByLabelText("Choose File");
    await userEvent.upload(fileInput, file);

    // Select template
    const templateSelect = screen.getByTestId("template-select");
    await userEvent.selectOptions(templateSelect, "PNOV Bridge");

    // Force form submission
    const formElement = screen.getByRole("form");
    fireEvent.submit(formElement);

    // Wait for report to display
    await waitFor(() => {
      expect(screen.queryByText("Generated Report")).toBeInTheDocument();
    });

    // Find and click copy button
    const copyButton = document.querySelector(
      'button[title="Copy to clipboard"]'
    );
    expect(copyButton).not.toBeNull();
    if (copyButton) {
      await userEvent.click(copyButton);
    }

    // Verify clipboard was called with expected text content
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      const clipboardText = (navigator.clipboard.writeText as jest.Mock).mock
        .calls[0][0];

      // Verify text includes all required sections
      expect(clipboardText).toContain(
        "DMD6 Parcel NOV DPMO Bridge Root Cause Category"
      );
      expect(clipboardText).toContain("Behavior Root Cause");
      expect(clipboardText).toContain("Mocked report content");
      expect(clipboardText).toContain("Actions:");
    });

    // Verify "Copied!" message appears
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });
});
