import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Form from "./Form";

// Mock the SelectInput component
vi.mock("./SelectInput", () => ({
  default: vi.fn(({ onSelect }) => {
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
  }),
}));

// Mock the PnovBridgeOutput component
vi.mock("./PnovBridgeOutput", () => ({
  default: vi.fn(({ onLoad }) => {
    // Call onLoad with mock data
    onLoad("Mocked PNOV Bridge output");
    return (
      <div data-testid="pnov-bridge-output">Mocked PNOV Bridge Output</div>
    );
  }),
}));

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ report: "Mocked report content" }),
  })
) as unknown as typeof fetch;

describe("Form Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form elements correctly", () => {
    render(<Form />);
    expect(screen.getByText("Try it out!")).toBeInTheDocument();
    expect(screen.getByText("Choose File")).toBeInTheDocument();
    expect(screen.getByText("No file chosen")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("ECD Date")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate" })
    ).toBeInTheDocument();
  });

  it("updates file name when file is selected", async () => {
    const user = userEvent.setup();
    render(<Form />);

    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const fileInput = screen.getByLabelText("Choose File");

    await user.upload(fileInput, file);

    expect(screen.getByText("test.csv")).toBeInTheDocument();
  });

  it("allows entering username", async () => {
    const user = userEvent.setup();
    render(<Form />);

    const usernameInput = screen.getByLabelText("Username");
    await user.type(usernameInput, "testuser");

    expect(usernameInput).toHaveValue("testuser");
  });

  it("allows selecting a date", async () => {
    const user = userEvent.setup();
    render(<Form />);

    const dateInput = screen.getByLabelText("ECD Date");
    await user.type(dateInput, "2025-06-30");

    expect(dateInput).toHaveValue("2025-06-30");
  });

  it("form submission triggers fetch request with all form data", async () => {
    const user = userEvent.setup();
    render(<Form />);

    // Set file
    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const fileInput = screen.getByLabelText("Choose File");
    await user.upload(fileInput, file);

    // Select template
    const templateSelect = screen.getByTestId("template-select");
    await user.selectOptions(templateSelect, "PNOV Bridge");

    // Enter username
    const usernameInput = screen.getByLabelText("Username");
    await user.type(usernameInput, "testuser");

    // Select date
    const dateInput = screen.getByLabelText("ECD Date");
    await user.type(dateInput, "2025-06-30");

    // Submit the form
    const generateButton = screen.getByRole("button", { name: "Generate" });
    await user.click(generateButton);

    expect(global.fetch).toHaveBeenCalled();

    // Check that FormData includes all required fields
    const fetchCall = (global.fetch as unknown as vi.Mock).mock.calls[0];
    const fetchBody = fetchCall[1].body;

    expect(fetchBody.has("file")).toBeTruthy();
    expect(fetchBody.has("templateName")).toBeTruthy();
    expect(fetchBody.has("username")).toBeTruthy();
    expect(fetchBody.has("date")).toBeTruthy();
    expect(fetchBody.get("username")).toBe("testuser");
    expect(fetchBody.get("date")).toBe("2025-06-30");
  });

  it("displays generated report after successful form submission", async () => {
    const user = userEvent.setup();
    render(<Form />);

    // Mock a successful form submission
    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const fileInput = screen.getByLabelText("Choose File");
    await user.upload(fileInput, file);

    // Select template
    const templateSelect = screen.getByTestId("template-select");
    await user.selectOptions(templateSelect, "PNOV Bridge");

    // Enter username and date
    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("ECD Date"), "2025-06-30");

    // Submit the form
    const generateButton = screen.getByRole("button", { name: "Generate" });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("Generated Report")).toBeInTheDocument();
    });
  });

  it("formats the date correctly in the output", async () => {
    const user = userEvent.setup();
    render(<Form />);

    // Setup form data
    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    await user.upload(screen.getByLabelText("Choose File"), file);
    await user.selectOptions(
      screen.getByTestId("template-select"),
      "PNOV Bridge"
    );
    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("ECD Date"), "2025-06-30");

    // Submit
    await user.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() => {
      const reportText = screen.getByText(/Owner: testuser, ECD:/);
      expect(reportText).toHaveTextContent("Owner: testuser, ECD: 06/30/2025");
    });
  });

  it("shows copy success message when copy button is clicked", async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(() =>
      Promise.resolve()
    );

    // Setup
    render(<Form />);

    // Mock report generation and form submission
    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const fileInput = screen.getByLabelText("Choose File");
    await user.upload(fileInput, file);
    await user.selectOptions(
      screen.getByTestId("template-select"),
      "PNOV Bridge"
    );
    await user.click(screen.getByRole("button", { name: "Generate" }));

    // Wait for report to display
    await waitFor(() => {
      expect(screen.getByText("Generated Report")).toBeInTheDocument();
    });

    // Find and click copy button
    const copyButton = screen.getByTitle("Copy to clipboard");
    await user.click(copyButton);

    // Verify "Copied!" message appears
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });
});
