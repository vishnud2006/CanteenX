import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UserRole } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  collegeId?: string | null;
  studentId?: string | null;
  staffId?: string | null;
}

/**
 * Generate signed JWT access token
 */
export function generateToken(payload: TokenPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

/**
 * Verify JWT access token and extract payload
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

