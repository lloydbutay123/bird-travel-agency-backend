import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

console.log("GOOGLE_CLIENT_EMAIL:", process.env.GOOGLE_CLIENT_EMAIL);
console.log("GOOGLE_PRIVATE_KEY exists:", !!process.env.GOOGLE_PRIVATE_KEY);
console.log("GOOGLE_SHEET_ID exists:", !!process.env.GOOGLE_SHEET_ID);

export const addInquiryToSheet = async (data) => {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,

    range: "Sheet1!A:H",

    valueInputOption: "USER_ENTERED",

    requestBody: {
      values: [
        [
          new Date().toISOString(),
          data.fullName,
          data.email,
          data.phone,
          data.address,
          data.inquiry || "",
        ],
      ],
    },
  });
};
