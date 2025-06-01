import { parsePnovData, generatePnovBridgeOutput, type PNOVItem } from './parsePnovData';
import csvData from './Current PNOV_0-28.csv';

// Function to load the CSV data
export async function loadPnovData(): Promise<PNOVItem[]> {
  try {
    return parsePnovData(csvData);
  } catch (error) {
    console.error('Failed to load PNOV data:', error);
    return [];
  }
}

// Function to generate PNOV Bridge output
export async function generatePnovOutput(): Promise<string> {
  const data = await loadPnovData();
  return generatePnovBridgeOutput(data);
} 