import nodemailer from "nodemailer";
import { pdfPath } from "./pdf.service.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendInquiryEmail = async (data) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: data.email,
    subject: "Your Travel Inquiry Confirmation",

    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #3AA9DC;">
          Thank you for your inquiry, ${data.fullName}!
        </h2>

        <p>
          We have received your travel inquiry.
        </p>

        <p>
          Our travel team will review your request and contact you shortly.
        </p>

        <p>
          Your travel inquiry PDF is attached to this email.
        </p>

        <br />

        <p style="color: #777;">
          Thank you for choosing us for your travel needs.
        </p>
      </div>
    `,

    attachments: [
      {
        filename: "travel-inquiry.pdf",
        path: pdfPath,
        contentType: "application/pdf",
      },
    ],
  });
};
