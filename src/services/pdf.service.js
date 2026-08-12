import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInquiryPDF = async () => {
  const pdfPath = path.join(__dirname, "../assets/pdf/travel-inquiry.pdf");

  return fs.promises.readFile(pdfPath);
};
