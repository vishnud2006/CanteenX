import { prisma } from '../config/database.js';
import { ApiError } from '../utils/apiResponse.js';
import { isValidIndianMobile, normalizeIndianMobile } from '../utils/phone.js';
import { SafeUser } from './auth.service.js';

export interface UpdateStudentProfileDto {
  fullName?: string;
  mobileNumber?: string;
  profileImage?: string;
  dietaryPreference?: string;
  typicalBudget?: number;
  walletBalance?: number;
  favoriteCategories?: string[];
  // Any extra fields sent by malicious users are explicitly ignored
}

export class StudentService {
  /**
   * Get student profile by authenticated student's user ID
   */
  async getProfile(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        college: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'Student profile not found.');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      studentId: user.studentId,
      staffId: user.staffId,
      role: user.role,
      collegeId: user.collegeId,
      collegeName: user.college?.collegeName,
      profileImage: user.profileImage,
      dietaryPreference: user.dietaryPreference,
      typicalBudget: user.typicalBudget,
      walletBalance: user.walletBalance,
      favoriteCategories: user.favoriteCategories,
      createdAt: user.createdAt,
    };
  }

  /**
   * Update student profile.
   * STRICT SECURITY: Only allows modifying non-protected fields (fullName, mobileNumber, profileImage, dietaryPreference, typicalBudget, favoriteCategories, walletBalance).
   * Explicitly prevents changing studentId, collegeId, role, email, passwordHash.
   */
  async updateProfile(userId: string, dto: UpdateStudentProfileDto): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'Student profile not found.');
    }

    // Prepare update payload with strict field whitelisting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: Record<string, any> = {};

    // 1. Full Name
    if (dto.fullName !== undefined) {
      const trimmed = dto.fullName.trim();
      if (trimmed.length < 2) {
        throw new ApiError(400, 'Full name must be at least 2 characters.');
      }
      dataToUpdate.fullName = trimmed;
    }

    // 2. Mobile Number
    if (dto.mobileNumber !== undefined) {
      const rawMobile = dto.mobileNumber.trim();
      if (rawMobile) {
        if (!isValidIndianMobile(rawMobile)) {
          throw new ApiError(400, 'Please enter a valid 10-digit mobile number.');
        }
        const normalized = normalizeIndianMobile(rawMobile);

        // Check if phone belongs to another user
        const duplicate = await prisma.user.findFirst({
          where: {
            mobileNumber: normalized,
            id: { not: userId },
          },
        });
        if (duplicate) {
          throw new ApiError(409, 'This mobile number is already in use by another account.');
        }
        dataToUpdate.mobileNumber = normalized;
      }
    }

    // 3. Profile Image
    if (dto.profileImage !== undefined) {
      dataToUpdate.profileImage = dto.profileImage;
    }

    // 4. Dietary Preference
    if (dto.dietaryPreference !== undefined) {
      dataToUpdate.dietaryPreference = dto.dietaryPreference;
    }

    // 5. Typical Budget
    if (dto.typicalBudget !== undefined) {
      dataToUpdate.typicalBudget = Math.max(10, Number(dto.typicalBudget));
    }

    // 6. Wallet Balance (if simulated in student view)
    if (dto.walletBalance !== undefined) {
      dataToUpdate.walletBalance = Math.max(0, Number(dto.walletBalance));
    }

    // 7. Favorite Categories
    if (dto.favoriteCategories !== undefined && Array.isArray(dto.favoriteCategories)) {
      dataToUpdate.favoriteCategories = dto.favoriteCategories;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      include: {
        college: true,
      },
    });

    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      mobileNumber: updated.mobileNumber,
      studentId: updated.studentId,
      staffId: updated.staffId,
      role: updated.role,
      collegeId: updated.collegeId,
      collegeName: updated.college?.collegeName,
      profileImage: updated.profileImage,
      dietaryPreference: updated.dietaryPreference,
      typicalBudget: updated.typicalBudget,
      walletBalance: updated.walletBalance,
      favoriteCategories: updated.favoriteCategories,
      createdAt: updated.createdAt,
    };
  }
}

export const studentService = new StudentService();

