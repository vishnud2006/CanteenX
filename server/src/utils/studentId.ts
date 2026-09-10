import { prisma } from '../config/database.js';

/**
 * Generate a unique, college-prefixed Student ID (e.g., BCE-STU-2048)
 * and ensure collision resistance in the database.
 */
export async function generateUniqueStudentId(collegeId: string): Promise<string> {
  const prefix = collegeId.replace(/[0-9]/g, '').toUpperCase() || 'STU';

  for (let attempt = 0; attempt < 10; attempt++) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const candidateId = `${prefix}-STU-${randomSuffix}`;

    const existing = await prisma.user.findUnique({
      where: { studentId: candidateId },
      select: { id: true },
    });

    if (!existing) {
      return candidateId;
    }
  }

  // Fallback with timestamp suffix if all random numbers had collision
  return `${prefix}-STU-${Date.now().toString().slice(-4)}`;
}

