import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { ApiError } from '../utils/apiResponse.js';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, mobileNumber, email, password, confirmPassword, collegeId } = req.body;
    const result = await authService.registerStudent({
      fullName,
      mobileNumber,
      email,
      password,
      confirmPassword,
      collegeId,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful! Welcome to CanteenX.',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { identifier, email, mobileNumber, password } = req.body;
    const idToUse = identifier || email || mobileNumber;

    const result = await authService.login(idToUse, password);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful!',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const user = await authService.getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // Stateless JWT logout is handled on client by discarding token
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

