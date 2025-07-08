import type { NextApiRequest, NextApiResponse } from 'next';

import { runBuildZoomAutomation } from '@/lib/automation';
import { updateSheetResult } from '@/lib/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { business, index } = req.body;

  if (!business) {
    return res.status(400).json({ error: 'Missing business data' });
  }

  try {
    // --- REAL AUTOMATION ---
    const result = await runBuildZoomAutomation(business);

    // Write result to Google Sheet (assume 8th column 'H', and Sheet1)
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    const rowIndex = index + 1; // Sheet is 1-based, header is row 1, data starts at row 2
    let resultText = result.success && result.profileUrl ? result.profileUrl : (result.error || 'Failed');
    await updateSheetResult(sheetId, rowIndex, resultText);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Automation failed' });
  }
}
