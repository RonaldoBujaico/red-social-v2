import jwt, { JwtPayload } from "jsonwebtoken";
import { JwtUserPayload } from "../types/jwt";

const SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

export const generateAccessToken = (payload: JwtUserPayload) => {
    return jwt.sign(payload, SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: JwtUserPayload) => {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): JwtUserPayload => {
    return jwt.verify(token, SECRET) as JwtUserPayload;
};

export const verifyRefreshToken = (token: string): JwtUserPayload => {
    return jwt.verify(token, REFRESH_SECRET) as JwtUserPayload;
};
