import { Request, Response, NextFunction } from 'express';
import { collegeService } from '../services/college.service.js';

export const getColleges = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const colleges = await collegeService.getActiveColleges();

    res.status(200).json({
      success: true,
      data: colleges,
    });
  } catch (error) {
    next(error);
  }
};

