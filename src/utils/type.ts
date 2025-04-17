// utils/types.ts

export interface IApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface IApiError extends Error {
  statusCode: number;
  data: null;
  success: false;
  errors: any[];
  timestamp: string;
}

export interface IJwtUtils {
  generateAccessToken: (payload: any) => string;
  generateRefreshToken: (payload: any) => string;
  verifyToken: (token: string) => any;
  decodeToken: (token: string) => any;
}

export interface IOtpService {
  storeOtp: (phone: string, otp: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  invalidateOtp: (phone: string) => Promise<void>;
}

export interface ISendOtpConfig {
  phoneNumber: string;
  otp: string;
  channel?: 'whatsapp' | 'sms';
}