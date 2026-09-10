import { prisma } from '../config/database.js';

export interface CollegeDto {
  collegeId: string;
  collegeName: string;
  location?: string;
  logo?: string;
}

export class CollegeService {
  /**
   * Fetch all active colleges
   */
  async getActiveColleges(): Promise<CollegeDto[]> {
    const colleges = await prisma.college.findMany({
      where: {
        isActive: true,
      },
      select: {
        collegeId: true,
        collegeName: true,
        location: true,
        logo: true,
      },
      orderBy: {
        collegeName: 'asc',
      },
    });

    return colleges;
  }

  /**
   * Fetch a single college by collegeId
   */
  async getCollegeById(collegeId: string) {
    return prisma.college.findUnique({
      where: {
        collegeId,
      },
    });
  }
}

export const collegeService = new CollegeService();

