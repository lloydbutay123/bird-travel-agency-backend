import { addInquiryToSheet } from "./googleSheets.service.js";
import { sendInquiryEmail } from "./email.service.js";

export const createTravelInquiry = async (data) => {
  // 1. Save to spreadsheet
  await addInquiryToSheet(data);

  // 3. Send PDF through email
  await sendInquiryEmail(data);

  return data;
};
