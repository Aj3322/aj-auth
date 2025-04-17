import { Router } from 'express';
import type { RequestHandler } from 'express';
import {
  verifyOtpAndCreate,
  sendOtp,
  sendOtpCreateAccount,
  verifyOtpAndLogin,
  logout
} from '../controllers/authController';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 */
router.post('/register', async (req, res, next) => {
  try {
    await verifyOtpAndCreate(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /auth/send-otp-login:
 *   post:
 *     tags: [Authentication]
 *     summary: Send OTP for login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendOtp'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid phone number
 *       404:
 *         description: User not found
 */
router.post('/send-otp-login', async (req, res, next) => {
  try {
    await sendOtp(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /auth/send-otp-create-account:
 *   post:
 *     tags: [Authentication]
 *     summary: Send OTP for account creation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendOtp'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid phone number
 *       409:
 *         description: User already exists
 */

router.post('/send-otp-create-account', async (req, res, next) => {
  try {
    await sendOtpCreateAccount(req, res);
  } catch (error) {
    next(error);
  }
});
/**
 * @openapi
 * /auth/verify-otp-login:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify OTP and login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtp'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid OTP
 *       404:
 *         description: User not found
 */
router.post('/verify-otp-login', async (req, res, next) => {
  try {
    await verifyOtpAndLogin(req, res);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /auth/logout:
 *   get:
 *     tags: [Authentication]
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: Logout successful
 *     security:
 *       - bearerAuth: []
 */
router.get('/logout', (req, res, next) => {
  try {
    logout(req, res);
    next();
  } catch (error) {
    next(error);
  }
});
// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = router;
  module.exports.default = router;
}
export default router;