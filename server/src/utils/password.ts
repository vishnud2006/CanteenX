import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

/**
 * Securely hash a plaintext password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plaintext password with stored bcrypt hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

