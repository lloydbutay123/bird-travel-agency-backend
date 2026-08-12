import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendInquiryEmail = async (data, pdfBuffer) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,

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
          Your inquiry confirmation PDF is attached to this email.
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
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
};
