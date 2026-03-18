import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }

    const token = authHeader.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decode.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
