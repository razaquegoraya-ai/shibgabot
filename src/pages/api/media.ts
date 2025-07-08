import type { NextApiRequest, NextApiResponse } from 'next';
import { listDriveFiles } from '@/lib/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
    const files = await listDriveFiles(folderId);
    res.status(200).json({ files });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
