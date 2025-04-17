import {AuthSystem} from "../AuthSystem"
import { ApiError } from "../utils/appError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import otpService from "../utils/otpService.js";
import { sendOtpViaTwilio } from "../utils/sendOtp.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import type { Request, Response } from "express";
const User = AuthSystem.getInstance().user;
interface IUserPayload {
  id: string;
  role: string;
}

interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Send OTP for login
 */
export const sendOtp = async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    throw new ApiError(400, "Phone number is required");
  }

  const user = await User.findOne({ phone });
  if (!user) {
    throw new ApiError(404, "User not registered with this phone number");
  }

  const otp = generateOtp();
  await Promise.all([
    otpService.storeOtp(phone, otp),
    sendOtpViaTwilio(phone, otp)
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
};

/**
 * Send OTP for account creation
 */
export const sendOtpCreateAccount = async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    throw new ApiError(400, "Phone number is required");
  }

  const user = await User.findOne({ phone });
  if (user) {
    throw new ApiError(409, "User already exists with this phone number");
  }

  const otp = generateOtp();
  await Promise.all([
    otpService.storeOtp(phone, otp),
    sendOtpViaTwilio(phone, otp)
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
};

/**
 * Verify OTP and create new account
 */
export const verifyOtpAndCreate = async (req: Request, res: Response) => {
  const { phone, otp, ...userData } = req.body;

  if (!phone || !otp) {
    throw new ApiError(400, "Phone and OTP are required");
  }

  // Validate OTP
  if (!await otpService.verifyOtp(phone, otp)) {
    throw new ApiError(401, "Invalid OTP");
  }

  // Check for existing user
  if (await User.exists({ phone })) {
    throw new ApiError(409, "User already exists with this phone number");
  }


  // Create user
  const newUser = await User.create({
    phone,
    ...userData
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    id: newUser._id,
    role: newUser.role
  });

  setRefreshTokenCookie(res, refreshToken);

  return res.status(201).json(
    new ApiResponse(
      201,
      { 
        accessToken,
        user: {
          _id: newUser._id,
          role: newUser.role
        }
      },
      "User registered and logged in successfully"
    )
  );
};

/**
 * Verify OTP and login
 */
export const verifyOtpAndLogin = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    throw new ApiError(400, "Phone and OTP are required");
  }

  if (!await otpService.verifyOtp(phone, otp)) {
    throw new ApiError(401, "Invalid OTP");
  }

  const user = await User.findOne({ phone });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { accessToken, refreshToken } = generateTokens({
    id: user._id,
    role: user.role
  });

  setRefreshTokenCookie(res, refreshToken);

  return res.status(200).json(
    new ApiResponse(
      200,
      { accessToken, role: user.role },
      "Logged in successfully"
    )
  );
};

/**
 * Logout user
 */
export const logout = (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
};

// Helper Functions

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateTokens = (payload: IUserPayload): IAuthTokens => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export default {
  sendOtp,
  sendOtpCreateAccount,
  verifyOtpAndCreate,
  verifyOtpAndLogin,
  logout
};