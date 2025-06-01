import React, { useEffect, useState } from "react";
import { generatePnovOutput } from "../data/loadPnovData";
import styles from "./PnovTable.module.css";

interface PnovBridgeOutputProps {
  onLoad: (output: string) => void;
}

export default function PnovBridgeOutput({ onLoad }: PnovBridgeOutputProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<{
    dspTable: React.ReactNode;
    daMultipleTable: React.ReactNode;
    highValueTable: React.ReactNode;
    perfectMile: string;
    scanAudits: string;
    totalCount: number;
  }>({
    dspTable: null,
    daMultipleTable: null,
    highValueTable: null,
    perfectMile: "",
    scanAudits: "",
    totalCount: 0,
  });

  // Convert markdown-like table to JSX table component
  function markdownToTable(markdown: string): React.ReactElement {
    const lines = markdown.split("\n").filter(line => line.trim() !== "");
    const headerRow = lines[1].split("|").map(cell => cell.trim()).filter(cell => cell !== "");
    const rows = lines.slice(3).map(line => line.split("|").map(cell => cell.trim()).filter(cell => cell !== ""));

    return (
      <table className={styles.pnovTable}>
        <thead>
          <tr>
            {headerRow.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Process the output into tables and sections
  function processOutput(output: string) {
    const sections = output.split("\n\n");
    
    // Extract the three tables
    const dspTableText = sections[0];
    const daMultipleTableText = sections[1];
    const highValueTableText = sections[2];
    
    // Extract the total count
    const totalCountText = sections[3];
    const totalCount = parseInt(totalCountText.split(":")[1].trim()) || 0;
    
    // Extract the copy/paste formats
    const perfectMileText = sections.find(section => section.includes("Perfect Mile Copy/Paste Format")) || "";
    const perfectMileFormat = perfectMileText.split("Perfect Mile Copy/Paste Format:\n")[1] || "";
    
    const scanAuditsText = sections.find(section => section.includes("Scan Audits Copy/Paste Format")) || "";
    const scanAuditsFormat = scanAuditsText.split("Scan Audits Copy/Paste Format:\n")[1] || "";
    
    setTables({
      dspTable: markdownToTable(dspTableText),
      daMultipleTable: markdownToTable(daMultipleTableText),
      highValueTable: markdownToTable(highValueTableText),
      perfectMile: perfectMileFormat,
      scanAudits: scanAuditsFormat,
      totalCount,
    });
  }

  // Load data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const outputData = await generatePnovOutput();
        processOutput(outputData);
        onLoad(outputData);
      } catch (error) {
        console.error("Error loading PNOV data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [onLoad]);

  if (isLoading) {
    return <div className="text-center py-8">Loading PNOV data...</div>;
  }

  return (
    <div className="mt-6">
      <h3 className={styles.sectionTitle}>1. Total PNOV by DSP (sorted Z-A)</h3>
      {tables.dspTable}

      <h3 className={styles.sectionTitle}>2. DAs with Over 1 MM still missing</h3>
      {tables.daMultipleTable}

      <h3 className={styles.sectionTitle}>3. High Value MM still missing DAs (≥ $50)</h3>
      {tables.highValueTable}

      <div className={styles.totalCount}>
        Current PNOV Total: {tables.totalCount}
      </div>

      <h3 className={styles.sectionTitle}>Perfect Mile Copy/Paste Format</h3>
      <div className={styles.copyPasteSection}>
        {tables.perfectMile}
      </div>

      <h3 className={styles.sectionTitle}>Scan Audits Copy/Paste Format</h3>
      <div className={styles.copyPasteSection}>
        {tables.scanAudits}
      </div>
    </div>
  );
} 