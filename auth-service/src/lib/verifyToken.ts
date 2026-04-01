import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const verifyToken = async (refreshToken: string) => {
  jwt.verify(refreshToken, JWT_SECRET);
};

export default verifyToken;
