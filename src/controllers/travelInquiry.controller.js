import { createTravelInquiry } from "../services/travelInquiry.service.js";

export const submitTravelInquiry = async (req, res) => {
  try {
    const { fullName, email, phone, address, inquiry } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !address || !inquiry) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const result = await createTravelInquiry({
      fullName,
      email,
      phone,
      address,
      inquiry,
    });

    return res.status(201).json({
      success: true,
      message:
        "Travel inquiry submitted successfully. A confirmation PDF has been sent to your email.",
      data: result,
    });
  } catch (error) {
    console.error("Travel inquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit travel inquiry.",
    });
  }
};
