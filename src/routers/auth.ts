import {
  signIn,
  create,
  generateForgetPasswordLink,
  grantValid,
  sendReVerificationToken,
  updatePassword,
  verifyEmail,
  updateProfile,
  sendProfile,
  logOut,
} from "#/controllers/auth";
import { isValidPasswordResetToken, mustAuth } from "#/middleware/auth";
import { validate } from "#/middleware/validator";
import {
  SignInValidationSchema,
  TokenAndIDValidation,
  UpdatePasswordSchema,
  createUserSchema,
} from "#/utils/validationSchema";
import { Router } from "express";
import fileParser from "#/middleware/fileParser";

const router = Router();

router.post("/create", validate(createUserSchema), create);
router.post("/verify-email", validate(TokenAndIDValidation), verifyEmail);
router.post("/re-verify-email", sendReVerificationToken);
router.post("/forget-password", generateForgetPasswordLink);
router.post(
  "/verify-pass-reset-token",
  validate(TokenAndIDValidation),
  isValidPasswordResetToken,
  grantValid
);
router.post(
  "/update-password",
  validate(UpdatePasswordSchema),
  isValidPasswordResetToken,
  updatePassword
);
router.post("/sign-in", validate(SignInValidationSchema), signIn);
router.get("/is-auth", mustAuth, sendProfile);

router.post("/update-profile",mustAuth, fileParser, updateProfile);
router.post("/log-out",mustAuth, logOut);

export default router;
