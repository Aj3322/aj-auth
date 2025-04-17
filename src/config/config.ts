import { SchemaDefinition, SchemaOptions } from 'mongoose';

/**
 * OTP configuration interface
 */
export interface OtpConfig {
  expiresIn: number;
  length: number;
}

/**
 * JWT cookie options interface
 */
export interface JwtCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  domain?: string;
}

/**
 * JWT configuration interface
 */
export interface JwtConfig {
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  cookieOptions: JwtCookieOptions;
}

/**
 * Twilio configuration interface
 */
export interface TwilioConfig {
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  contentSid?: string;
}

/**
 * User model configuration interface
 */
export interface UserModelConfig {
  schemaDefinition: SchemaDefinition;
  options?: SchemaOptions;
}

/**
 * Default configuration interface
 */
export interface DefaultConfig {
  otp: OtpConfig;
  jwt: JwtConfig;
  twilio: TwilioConfig;
  userModel: UserModelConfig;
}

/**
 * Default configuration with environment variables
 */
const defaultConfig: DefaultConfig = {
  otp: {
    expiresIn: 300, // 5 minutes in seconds
    length: 6,
  },
  jwt: {
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    contentSid: process.env.TWILIO_CONTENT_SID,
  },
  userModel: {
    schemaDefinition: {
      phone: {
        type: String,
        required: true,
        unique: true,
        index: true,
        validate: {
          validator: (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone),
          message: 'Phone number must be in E.164 format',
        },
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      lastLogin: {
        type: Date,
        default: null,
      },
    },
    options: {
      timestamps: false, // manually handling createdAt/updatedAt
      toJSON: {
        virtuals: true,
        transform: (_doc: any, ret: any) => {
          delete ret.__v;
          delete ret._id;
          return ret;
        },
      },
    },
  },
};

/**
 * Validate the user-provided model schema
 */
export function validateUserModel(userSchema: Partial<UserModelConfig>): void {
  if (!userSchema) {
    throw new Error('User model schema must be provided');
  }

  if (!userSchema.schemaDefinition?.phone) {
    throw new Error('User model must contain a phone field');
  }

  const phoneDef = userSchema.schemaDefinition.phone;
  if (
    typeof phoneDef !== 'object' ||
    (phoneDef as any)?.type !== String ||
    !(phoneDef as any)?.required
  ) {
    throw new Error('Phone field must be a required String');
  }
}

// Default ES export
export default defaultConfig;

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    default: defaultConfig,
    validateUserModel,
    DefaultConfig: {} as DefaultConfig,
  };
}
