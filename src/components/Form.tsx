"use client";
import { useState, type ChangeEvent, type FormEvent } from "react";
// use dummy data and functionality to make a dummy demo
import SelectInput from "./SelectInput";
import PnovBridgeOutput from "./PnovBridgeOutput";

export default function Form() {
  // access input file name
  const [fileName, setFileName] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showPnovBridge, setShowPnovBridge] = useState(false);

  // handler functions
  // handle setting file name
  function handleSetFileName(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  }

  // handle PNOV output being loaded
  function handlePnovOutputLoaded(output: string) {
    setGeneratedOutput(output);
  }

  // handle form submission
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      // output to be displayed
      if (fileName && templateName) {
        const formData = new FormData();
        const fileInput = document.getElementById(
          "dataFile"
        ) as HTMLInputElement;
        if (fileInput.files && fileInput.files[0]) {
          formData.append("file", fileInput.files[0]);
        }
        formData.append("templateName", templateName || "");
        const response = await fetch("http://127.0.0.1:5000/pnov-bridge", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to generate report");
        }
        const data = await response.json();

        setGeneratedOutput(data.report);
        //       if (templateName === "PNOV Bridge") {
        //         // Show the PNOV Bridge component
        //         setShowPnovBridge(true);
        //       } else {
        //         // Default dummy output for other templates
        //         setShowPnovBridge(false);
        //         const dummyTable = `
        // | Route ID | Packages | Late Deliveries |
        // |----------|----------|-----------------|
        // | RTE001   |   148    |       2         |
        // | RTE002   |   121    |       0         |
        // | RTE003   |   134    |       4         |
        // `;

        //         const dummyMessage = `Team,

        // Please find the ${templateName} report generated from ${fileName}. Summary is below:

        // - Total routes: 3
        // - Total packages: 403
        // - Late deliveries: 6

        // Let me know if there are any questions.

        // Thanks,
        // [Your Name]`;

        // setGeneratedOutput(`${dummyTable}\n\n${dummyMessage}`);
        // }
      }
    } catch (error) {
      console.error("Error generating output:", error);
      setGeneratedOutput("Error generating output. Please try again.");
    } finally {
      // reset values
      setFileName(null);
      setTemplateName(null); // this triggers reset
    }
  }

  return (
    <div className="relative px-6 py-32 sm:py-32 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute overflow-hidden inset-x-0 -top-40 -z-10 transform-gpu blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="relative left-1/2 -z-10 aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-288.75"
        />
      </div>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-100 sm:text-5xl">
          Try it out!
        </h2>
        <p className="mt-2 text-lg/8 text-gray-300">
          Upload an excel file, select the metric being evaluated, and click
          generate!
        </p>
      </div>
      {/* Start Form */}
      <form
        onSubmit={handleSubmit}
        method="POST"
        className="mx-auto mt-8 max-w-xl sm:mt-10"
        id="form"
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="company"
              className="block text-md font-semibold text-gray-100"
            >
              Excel file
            </label>
            <div className="mt-2.5">
              <div className="relative flex items-center w-full rounded-md bg-white border border-gray-300 px-3.5 py-2 text-base text-gray-900">
                <label
                  htmlFor="dataFile"
                  className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Choose File
                </label>
                <span className="mx-2 text-gray-300">|</span>
                <span className="truncate">{fileName || "No file chosen"}</span>
                <input
                  id="dataFile"
                  name="dataFile"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleSetFileName}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <div>
              <SelectInput selected={templateName} onSelect={setTemplateName} />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <button
            type="submit"
            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-2xl font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Generate
          </button>
        </div>
      </form>

      {/* Display output */}
      {(generatedOutput || showPnovBridge) && (
        <div className="mt-10 relative rounded-md bg-white text-gray-900 shadow-md">
          <div className="flex justify-between items-center px-4 pt-4">
            <h3 className="text-xl font-semibold">Generated Report</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const fullReport = `
DMD6 Parcel NOV DPMO Bridge Root Cause Category: OTR/DSP/ DA
Behavior Root Cause: Other - Packages missing still missing at EOS MM returned by same DA

${generatedOutput ?? ""}

Actions:
DAs with high value missing still missing packages requested for scan audits. PNOV Update sent during shift for Dispatchers to contact DAs and sweep van for packages marked missing before returning to station
    `;

                  navigator.clipboard.writeText(fullReport.trim());
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
                title="Copy to clipboard"
                className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-2 10h2a2 2 0 002-2v-8a2 2 0 00-2-2h-2m-8 8h8"
                  />
                </svg>
              </button>
              {copySuccess && (
                <span className="text-green-600 text-sm font-medium">
                  Copied!
                </span>
              )}
            </div>
          </div>

          <div className="px-4 pb-4 whitespace-pre-line overflow-auto max-h-[70vh]">
            {showPnovBridge ? (
              <PnovBridgeOutput onLoad={handlePnovOutputLoaded} />
            ) : (
              <div>
                <p className="text-sm font-semibold">
                  DMD6 Parcel NOV DPMO Bridge Root Cause Category: OTR/DSP/ DA
                </p>
                <p className="text-sm font-semibold">
                  Behavior Root Cause: Other- Packages missing still missing at
                  EOS MM returned by same DA
                </p>
                <br />
                <pre className="font-mono text-sm mt-2">{generatedOutput}</pre>
                <br />
                <p className="text-md font-semibold">Actions: </p>
                <p>
                  DAs with high value missing still missing packages requested
                  for scan audits PNOV Update sent during shift for Dispatchers
                  to contact DAs and sweep van for packages marked missing
                  before returning to station
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
