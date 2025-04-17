import { ApiError } from './appError';
import { ApiResponse } from './ApiResponse';
import catchAsync from './catchAsync';
import jwtUtils from './jwt';
import otpService from './otpService';
import { sendOtpViaTwilio } from './sendOtp';

const utils = {
  ApiError,
  ApiResponse,
  catchAsync,
  jwt: jwtUtils,
  otpService,
  sendOtpViaTwilio
};

export default utils;
export { 
  ApiError, 
  ApiResponse, 
  catchAsync, 
  jwtUtils as jwt, 
  otpService, 
  sendOtpViaTwilio 
};

// CommonJS compatibility
// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
    module.exports.default = utils;
    module.exports.ApiError = ApiError;
    module.exports.ApiResponse = ApiResponse;
    module.exports.catchAsync = catchAsync;
    module.exports.jwt = jwtUtils;
    module.exports.otpService = otpService;
    module.exports.sendOtpViaTwilio = sendOtpViaTwilio;
  }