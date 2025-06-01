// Types for PNOV data
export interface PNOVItem {
  trackingId: string;
  status: string;
  reason: string;
  daName: string;
  dspName: string;
  route: string;
  latestAttempt: string;
  cost: number;
}

// Function to parse CSV data
export function parsePnovData(csvData: string): PNOVItem[] {
  const lines = csvData.split('\n');
  // Skip header row
  const dataRows = lines.slice(1);
  
  return dataRows
    .filter(line => line.trim() !== '')
    .map(line => {
      const cells = parseCSVLine(line);
      return {
        trackingId: cells[0].replace(/"/g, ''),
        status: cells[1].replace(/"/g, ''),
        reason: cells[2].replace(/"/g, ''),
        daName: cells[3].replace(/"/g, ''),
        dspName: cells[4].replace(/"/g, ''),
        route: cells[5].replace(/"/g, ''),
        latestAttempt: cells[6].replace(/"/g, ''),
        cost: parseFloat(cells[7].replace(/"/g, '')) || 0
      };
    });
}

// Helper function to properly parse CSV lines with commas in quoted fields
function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cell);
      cell = '';
    } else {
      cell += char;
    }
  }
  
  result.push(cell);
  return result;
}

// Generate PNOV by DSP pivot table (sort Z-A)
export function generatePnovByDsp(data: PNOVItem[]): { dspName: string, count: number }[] {
  const dspCounts: Record<string, number> = {};
  
  data.forEach(item => {
    if (item.dspName) {
      dspCounts[item.dspName] = (dspCounts[item.dspName] || 0) + 1;
    }
  });
  
  return Object.entries(dspCounts)
    .map(([dspName, count]) => ({ dspName, count }))
    .sort((a, b) => b.count - a.count); // Sort Z-A
}

// Generate DAs with Over 1 MM still missing
export function generateDasWithMultipleMissing(data: PNOVItem[]): { daName: string, count: number }[] {
  const daCounts: Record<string, number> = {};
  
  data.forEach(item => {
    if (item.daName && !item.daName.includes('SNOWPlatform')) {
      daCounts[item.daName] = (daCounts[item.daName] || 0) + 1;
    }
  });
  
  return Object.entries(daCounts)
    .filter(([, count]) => count > 1) // More than 1 missing item
    .map(([daName, count]) => ({ daName, count }))
    .sort((a, b) => b.count - a.count);
}

// Generate High Value MM still missing DAs
export function generateHighValueMissing(data: PNOVItem[]): { daName: string, trackingId: string, cost: number }[] {
  return data
    .filter(item => item.cost >= 50) // Filter for high value (>=50)
    .map(item => ({
      daName: item.daName,
      trackingId: item.trackingId,
      cost: item.cost
    }))
    .sort((a, b) => b.cost - a.cost);
}

// Format for Perfect Mile (routes instead of DA names)
export function formatForPerfectMile(data: PNOVItem[]): { route: string, trackingId: string }[] {
  return data.map(item => ({
    route: item.route,
    trackingId: item.trackingId
  }));
}

// Get total PNOV count
export function getTotalPnovCount(data: PNOVItem[]): number {
  return data.length;
}

// Generate formatted output for the tables
export function generatePnovBridgeOutput(data: PNOVItem[]): string {
  const dspPivot = generatePnovByDsp(data);
  const dasWithMultiple = generateDasWithMultipleMissing(data);
  const highValueMissing = generateHighValueMissing(data);
  const totalCount = getTotalPnovCount(data);
  
  // Format tables
  let output = `1. Total PNOV by DSP (sorted Z-A)\n`;
  output += `| DSP Name | Count |\n`;
  output += `|----------|-------|\n`;
  dspPivot.forEach(item => {
    output += `| ${item.dspName || 'Unknown'} | ${item.count} |\n`;
  });
  
  output += `\n2. DAs with Over 1 MM still missing\n`;
  output += `| DA Name | Count |\n`;
  output += `|---------|-------|\n`;
  dasWithMultiple.forEach(item => {
    output += `| ${item.daName} | ${item.count} |\n`;
  });
  
  output += `\n3. High Value MM still missing DAs (>= $50)\n`;
  output += `| DA Name | Tracking ID | Cost |\n`;
  output += `|---------|------------|------|\n`;
  highValueMissing.forEach(item => {
    output += `| ${item.daName} | ${item.trackingId} | $${item.cost.toFixed(2)} |\n`;
  });
  
  output += `\nCurrent PNOV Total: ${totalCount}\n`;
  
  // Perfect Mile Format
  output += `\nPerfect Mile Copy/Paste Format:\n`;
  data.forEach(item => {
    output += `${item.route} | ${item.trackingId}\n`;
  });
  
  // Scan Audits Format
  output += `\nScan Audits Copy/Paste Format:\n`;
  data.forEach(item => {
    if (item.daName && !item.daName.includes('SNOWPlatform')) {
      output += `${item.daName} | ${item.trackingId}\n`;
    }
  });
  
  return output;
} 