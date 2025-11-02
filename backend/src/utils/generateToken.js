import jwt from "jsonwebtoken";
import "dotenv/config";

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE,
  });
};

export default generateToken;
