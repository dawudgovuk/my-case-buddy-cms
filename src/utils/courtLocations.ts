// Utility to read court names from CSV
export async function getCourtNames(): Promise<string[]> {
  // Fetch the CSV from the public folder
  const response = await fetch('/courts-and-tribunals-data.csv');
  const text = await response.text();
  // Parse CSV: first line is header, subsequent lines are data
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const header = lines[0].split(',');
  const nameIdx = header.indexOf('name');
  if (nameIdx === -1) return [];
  return lines.slice(1).map(line => {
    // Handle quoted names and commas, and trim spaces
    const match = line.match(/^"([^\"]+)"/);
    if (match) return match[1].trim();
    const cols = line.split(',');
    return cols[nameIdx] ? cols[nameIdx].replace(/^"|"$/g, '').trim() : '';
  }).filter(name => name.length > 0);
}
