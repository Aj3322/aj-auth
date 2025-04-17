import twilio from 'twilio';
import dotenv from 'dotenv';
import { ApiError } from './appError';

dotenv.config();

// Validate required env variables
const validateTwilioConfig = (): void => {
  const requiredVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'TWILIO_CONTENT_SID',
  ];

  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new ApiError(
      500,
      `Missing Twilio configuration: ${missingVars.join(', ')}`,
      [],
      'Twilio configuration error'
    );
  }
};

validateTwilioConfig();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN as string
);

export interface OtpResponse {
  sid: string;
  status: string;
  timestamp: string;
}

/**
 * Sends OTP via Twilio WhatsApp
 * @param phoneNumber Recipient's phone number in E.164 format
 * @param otp One-time password to send
 * @returns Promise with message SID, status, and timestamp
 */
export async function sendOtpViaTwilio(phoneNumber: string, otp: string): Promise<OtpResponse> {
  if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
    throw new ApiError(400, 'Invalid phone number format');
  }

  if (!/^\d{4,8}$/.test(otp)) {
    throw new ApiError(400, 'OTP must be 4-8 digits');
  }

  try {
    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      contentSid: process.env.TWILIO_CONTENT_SID,
      contentVariables: JSON.stringify({ 1: otp }),
      to: `whatsapp:${phoneNumber}`,
    });

    return {
      sid: message.sid,
      status: message.status,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    let errorMessage = 'Failed to send OTP';
    let statusCode = 500;

    if (error.code === 21211) {
      errorMessage = 'Invalid phone number';
      statusCode = 400;
    } else if (error.code === 21608) {
      errorMessage = 'Twilio account not authorized for WhatsApp';
      statusCode = 403;
    }

    throw new ApiError(
      statusCode,
      errorMessage,
      [error.message],
      'Twilio API Error'
    );
  }
}

// Named + Default Export for ESM and CommonJS compatibility
const exported = {
  sendOtpViaTwilio,
};

export default exported;

// For CommonJS support
if (typeof module !== 'undefined' && module.exports) {
  module.exports = exported;
  module.exports.default = exported;
}
