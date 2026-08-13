import { addInquiryToSheet } from "./googleSheets.service.js";
import { sendInquiryEmail } from "./email.service.js";

export const createTravelInquiry = async (data) => {
  console.log("========== TRAVEL INQUIRY ==========");
  console.log("Data received:", data);

  try {
    console.log("STEP 1: Saving to Google Sheets...");

    await addInquiryToSheet(data);

    console.log("STEP 1 SUCCESS: Google Sheet saved");

    console.log("STEP 2: Sending email...");

    await sendInquiryEmail(data);

    console.log("STEP 2 SUCCESS: Email sent");

    console.log("========== SUCCESS ==========");

    return data;
  } catch (error) {
    console.error("========== TRAVEL INQUIRY FAILED ==========");
    console.error(error);
    console.error("Message:", error?.message);
    console.error("Response:", error?.response?.data);
    console.error("============================================");

    throw error;
  }
};
