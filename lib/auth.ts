import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

/**
 * Hash a password using bcrypt.
 * @param password The plain text password.
 * @returns The hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash.
 * @param password The plain text password.
 * @param hash The hashed password.
 * @returns True if they match, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user ID.
 * @param userId The ID of the user.
 * @returns The signed JWT token.
 */
export function generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify a JWT token.
 * @param token The JWT token to verify.
 * @returns The decoded payload if valid, null otherwise.
 */
export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}
