import mongoose from 'mongoose';
import { OtpConfig } from '../types/config';

interface IOtp {
  phone: string;
  otp: string;
  createdAt: Date;
}

export function createOtpModel(config: OtpConfig): mongoose.Model<IOtp> {
  const schema = new mongoose.Schema<IOtp>(
    {
      phone: {
        type: String,
        required: true,
        index: true,
        validate: {
          validator: (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone),
          message: 'Invalid phone number format'
        }
      },
      otp: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 8
      }
    },
    {
      timestamps: false,
      expires: config.expiresIn
    }
  );

  // Add index for faster queries
  schema.index({ phone: 1 }, { unique: false });

  return mongoose.model<IOtp>('Otp', schema);
}

// Dual exports
export default createOtpModel;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = createOtpModel;
  module.exports.default = createOtpModel;
}