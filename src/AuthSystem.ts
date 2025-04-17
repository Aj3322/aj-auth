// authSystem.ts
import express from 'express';
import { createUserModel } from './models/User';
import { createOtpModel } from './models/Otp';
import authRouter from './routes/auth.routes';
import defaultConfig from './config/config';
import  mongoose from 'mongoose';
class AuthSystem {
  private static instance: AuthSystem;
  private config: mongoose.SchemaDefinition | mongoose.SchemaOptions;
  private otpModel: any;
  private userModel: any;

  private constructor(userConfig = {}, userModel = {}) {
    this.userModel = createUserModel(userModel || defaultConfig.userModel);
    this.config = this.mergeConfigs(defaultConfig, userConfig);
    this.otpModel = createOtpModel(defaultConfig.otp);
  }

  public static getInstance(userConfig = {}, userModel = {}): AuthSystem {
    if (!AuthSystem.instance) {
      AuthSystem.instance = new AuthSystem(userConfig, userModel);
    }
    return AuthSystem.instance;
  }

  private mergeConfigs(defaultConfig: any, userConfig: any) {
    return {
      ...defaultConfig,
      ...userConfig,
      // Add deep merge for nested config objects if needed
    };
  }
  public get otp() {
    return this.otpModel;
  }
  public get user() {
    return this.userModel;
  }
  public get getConfig() {
    return this.config;
  }
  public get router() {
    const router = express.Router();
    router.use('/auth', authRouter);
    return router;
  }
}

export { AuthSystem }; 
