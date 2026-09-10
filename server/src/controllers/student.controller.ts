import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/student.service.js';
import { ApiError } from '../utils/apiResponse.js';

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const profile = await studentService.getProfile(req.user.userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const updatedProfile = await studentService.updateProfile(req.user.userId, req.body);

    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

