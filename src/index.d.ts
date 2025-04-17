// types/index.d.ts

import { Router } from 'express';

/**
 * Core authentication types for the AJ Auth package
 */
declare module 'aj-auth' {
  
  /**
   * Extended Express Request with user context
   */
  namespace Express {
    interface Request {
      /**
       * Authenticated user payload
       */
      user?: UserPayload;
    }
  }

  /**
   * Standardized API response format
   * @template T - Type of the data payload
   */
  interface ApiResponse<T = any> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
    timestamp: string;
    toJSON(): Omit<this, 'toJSON'>;
  }

  /**
   * Standardized API error format
   */
  interface ApiError extends Error {
    statusCode: number;
    data: null;
    success: false;
    errors: any[];
    timestamp: string;
    toJSON(): Omit<this, 'toJSON'>;
  }

  /**
   * JWT payload structure
   */
  interface UserPayload {
    id: string;
    role: string;
    [key: string]: any;
  }

  /**
   * Authentication tokens
   */
  interface AuthTokens {
    accessToken: string;
    refreshToken: string;
  }

  /**
   * OTP configuration options
   */
  interface OtpConfig {
    expiresIn?: number;
    length?: number;
    maxAttempts?: number;
  }

  /**
   * JWT configuration options
   */
  interface JwtConfig {
    accessTokenExpiry?: string;
    refreshTokenExpiry?: string;
    secret?: string;
    cookieOptions?: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
      maxAge?: number;
      domain?: string;
    };
  }

  /**
   * Twilio SMS configuration
   */
  interface TwilioConfig {
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string;
    contentSid?: string;
    serviceSid?: string;
  }

  /**
   * User model configuration
   */
  interface UserModelConfig {
    schemaDefinition?: Record<string, any>;
    options?: {
      timestamps?: boolean;
      collection?: string;
      [key: string]: any;
    };
  }

  /**
   * Complete authentication system configuration
   */
  interface AuthSystemConfig {
    otp?: OtpConfig;
    jwt?: JwtConfig;
    twilio?: TwilioConfig;
    userModel?: UserModelConfig;
    [key: string]: any;
  }

  /**
   * Authentication system instance
   */
  interface AuthSystemInstance {
    router: Router;
    controllers: {
      authController: {
        sendOtp: (phone: string) => Promise<void>;
        verifyOtp: (phone: string, otp: string) => Promise<boolean>;
        // Add other controller methods
      };
    };
    models: {
      User: any; // Replace with proper Model type
      Otp: any;
    };
    utils: {
      jwt: {
        generateAccessToken: (payload: UserPayload) => string;
        generateRefreshToken: (payload: UserPayload) => string;
        verifyToken: (token: string) => UserPayload;
      };
      otpService: {
        storeOtp: (phone: string, otp: string) => Promise<void>;
        verifyOtp: (phone: string, otp: string) => Promise<boolean>;
        invalidateOtp: (phone: string) => Promise<void>;
      };
    };
  }

  /**
   * Initialize authentication system
   * @param config - Configuration options
   * @returns Configured authentication system instance
   */
  function AuthSystem(config?: AuthSystemConfig): AuthSystemInstance;

  export = AuthSystem;
  
}
export as namespace AJAuth;