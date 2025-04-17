import mongoose from 'mongoose';

interface IUser {
  phone: string;
  email?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserMethods {
  activate(): Promise<void>;
  deactivate(): Promise<void>;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

export function createUserModel(config:any): UserModel {
  const schema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
    {
      phone: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone),
          message: 'Invalid phone number format'
        }
      },
      isActive: { type: Boolean, default: true },
      lastLogin: { type: Date }
    },
    {
      timestamps: true,
      ...config.options
    }
  );

  // Add methods
  schema.method('activate', async function() {
    this.isActive = true;
    await this.save();
  });

  schema.method('deactivate', async function() {
    this.isActive = false;
    await this.save();
  });

  // Add statics
  schema.static('findByPhone', function(phone: string) {
    return this.findOne({ phone });
  });

  return mongoose.model<IUser, UserModel>('User', schema);
}

// Dual exports
export default createUserModel;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = createUserModel;
  module.exports.default = createUserModel;
}