import { addInquiryToSheet } from "./googleSheets.service.js";
import { generateInquiryPDF } from "./pdf.service.js";
import { sendInquiryEmail } from "./email.service.js";

export const createTravelInquiry = async (data) => {
  // 1. Save to spreadsheet
  await addInquiryToSheet(data);

  // 2. Generate PDF
  const pdfBuffer = await generateInquiryPDF(data);

  // 3. Send PDF through email
  await sendInquiryEmail(data, pdfBuffer);

  return data;
};
