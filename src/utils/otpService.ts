import { AuthSystem } from "../AuthSystem";
import { ApiError } from "../utils/appError";
import crypto from 'crypto';
const auth = AuthSystem.getInstance();
/**
 * Interface for OTP Service
 */
export interface IOtpService {
  storeOtp(phone: string, otp: string): Promise<void>;
  verifyOtp(phone: string, otp: string): Promise<boolean>;
  invalidateOtp(phone: string): Promise<void>;
  resendOtp(phone: string): Promise<string>;
}

/**
 * OTP Service Implementation
 */
class OtpService implements IOtpService {
  private readonly otpLength: number;
  private readonly otpExpiry: number;

  constructor(config: { otpLength?: number; otpExpiry?: number } = {}) {
    this.otpLength = config.otpLength || 6;
    this.otpExpiry = config.otpExpiry || 300; // 5 minutes in seconds
  }

  /**
   * Generate a new OTP code
   * @returns {string} Generated OTP
   */
  private generateOtp(): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < this.otpLength; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  /**
   * Store or update OTP for a phone number
   */
  async storeOtp(phone: string, otp: string): Promise<void> {
    this.validatePhone(phone);
    this.validateOtp(otp);

    try {
      await auth.otp.findOneAndUpdate(
        { phone },
        { 
          otp,
          createdAt: new Date() // Reset TTL
        },
        { 
          upsert: true,
          new: true
        }
      );
    } catch (error: any) {
      throw new ApiError(500, "Failed to store OTP", [error.message]);
    }
  }

  /**
   * Verify OTP for a phone number
   */
  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    if (!phone || !otp) {
      throw new ApiError(400, "Phone and OTP are required");
    }

    try {
      const record = await auth.otp.findOne({ phone });
      if (!record) return false;
      
      const isValid = crypto.timingSafeEqual(
        Buffer.from(record.otp),
        Buffer.from(otp)
      );

      if (isValid) {
        await auth.otp.deleteOne({ phone });
        return true;
      }
      return false;
    } catch (error: any) {
      throw new ApiError(500, "OTP verification failed", [error.message]);
    }
  }

  /**
   * Invalidate OTP for a phone number
   */
  async invalidateOtp(phone: string): Promise<void> {
    this.validatePhone(phone);

    try {
      await auth.otp.deleteOne({ phone });
    } catch (error: any) {
      throw new ApiError(500, "Failed to invalidate OTP", [error.message]);
    }
  }

  /**
   * Resend OTP to a phone number
   */
  async resendOtp(phone: string): Promise<string> {
    this.validatePhone(phone);
    const newOtp = this.generateOtp();
    await this.storeOtp(phone, newOtp);
    return newOtp;
  }

  /**
   * Validate phone number format
   */
  private validatePhone(phone: string): void {
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      throw new ApiError(400, "Invalid phone number format");
    }
  }

  /**
   * Validate OTP format
   */
  private validateOtp(otp: string): void {
    if (!otp || otp.length !== this.otpLength || !/^\d+$/.test(otp)) {
      throw new ApiError(400, `OTP must be ${this.otpLength} digits`);
    }
  }
}

// Create singleton instance
const otpService = new OtpService();

// TypeScript exports
export default otpService;
export { OtpService };

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = otpService;
  module.exports.default = otpService;
  module.exports.IOtpService = {} as IOtpService;
  module.exports.OtpService = OtpService;
}