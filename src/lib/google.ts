import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly',
];

const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || 'service-account.json';
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), serviceAccountPath), 'utf8')
);

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: SCOPES,
});

export const sheets = google.sheets({ version: 'v4', auth });
export const drive = google.drive({ version: 'v3', auth });

export async function getSheetRows(sheetId: string, range: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });
  return res.data.values || [];
}

export async function listDriveFiles(folderId: string) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
    pageSize: 100,
  });
  return res.data.files || [];
}

// Update the result/status in the Google Sheet for the given row (1-based index)
export async function updateSheetResult(sheetId: string, rowIndex: number, result: string) {
  // Adjust column and sheet name as needed. Here, H = 8th column, Sheet1 is assumed
  const range = `Sheet1!H${rowIndex+1}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [[result]] },
  });
}
