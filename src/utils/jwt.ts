import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();


const JWT_SECRET :string = process.env.JWT_SECRET || '';
const JWT_ACCESS_TOKEN_EXPIRES_IN: string | number|undefined= process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
const JWT_REFRESH_TOKEN_EXPIRES_IN: string | number|undefined= process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('Missing environment variable: JWT_SECRET');
}

/**
 * Generate JWT access token using env secret and expiry
 */
export const generateAccessToken = (
  payload: JwtPayload
): string => {
  // Ensure that expiresIn is correctly typed
  const expiresIn: string | number = isNaN(Number(JWT_ACCESS_TOKEN_EXPIRES_IN))
    ? JWT_ACCESS_TOKEN_EXPIRES_IN
    : Number(JWT_ACCESS_TOKEN_EXPIRES_IN);

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  // Generate and return the token
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Generate JWT refresh token using env secret
 */
export const generateRefreshToken = (
  payload: JwtPayload
): string => {
  const refreshTokenExpiresIn: string | number = isNaN(Number(JWT_REFRESH_TOKEN_EXPIRES_IN))
    ? JWT_REFRESH_TOKEN_EXPIRES_IN
    : Number(JWT_REFRESH_TOKEN_EXPIRES_IN);
    const options: SignOptions = {
      expiresIn: refreshTokenExpiresIn as SignOptions['expiresIn'],
    };

  return jwt.sign(payload, JWT_SECRET,options );
};

/**
 * Verify JWT token using env secret
 */
export const verifyToken = (
  token: string
): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

/**
 * Decode JWT token without verification
 */
export const decodeToken = (
  token: string
): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};

// Export object for all formats
const jwtUtils = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};

// TypeScript / ESM default export
export default jwtUtils;

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = jwtUtils;
  module.exports.default = jwtUtils;
  module.exports.generateAccessToken = generateAccessToken;
  module.exports.generateRefreshToken = generateRefreshToken;
  module.exports.verifyToken = verifyToken;
  module.exports.decodeToken = decodeToken;
}
