import type { NextApiRequest, NextApiResponse } from 'next';
import { getSheetRows } from '@/lib/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    // Adjust range as needed (e.g., 'Sheet1!A1:G')
    const range = 'Sheet1';
    const rows = await getSheetRows(sheetId, range);
    res.status(200).json({ rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
