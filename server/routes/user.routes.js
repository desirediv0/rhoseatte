import express from "express";
import {
  registerUser,
  loginUser,
  guestCheckoutInit,
  guestCheckoutVerifyOtp,
  guestCheckoutResendOtp,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserAddresses,
  setDefaultAddress,
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  requestAccountDeletion,
  confirmAccountDeletion,
  getUserReviews,
  addReview,
  updateReview,
  deleteReview,
  resendVerificationEmail,
  verifyOtp,
} from "../controllers/user.controller.js";
import { verifyJWTToken } from "../middlewares/auth.middleware.js";
import { uploadFiles } from "../middlewares/multer.middlerware.js";
import otpRateLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

// Auth routes
// Apply otpRateLimiter to endpoints that generate or resend OTPs / reset links
router.post("/register", otpRateLimiter, registerUser);
router.post("/login", loginUser);
// Guest checkout: creates/logs into an account from the checkout form itself,
// no separate register/login screen. New details -> account created and
// signed in immediately. Details matching an existing account -> a one-time
// code is emailed to that account and must be verified before sign-in
// (guestCheckoutVerifyOtp) — this endpoint alone never logs into an existing
// account. All rate-limited like registration/OTP since they can create
// accounts or send emails.
router.post("/guest-checkout/init", otpRateLimiter, guestCheckoutInit);
router.post("/guest-checkout/verify", otpRateLimiter, guestCheckoutVerifyOtp);
router.post("/guest-checkout/resend-otp", otpRateLimiter, guestCheckoutResendOtp);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/verify-email/:token", verifyEmail); // legacy link-based, kept for backward compatibility
router.post("/verify-otp", verifyOtp);
router.post("/resend-verification", otpRateLimiter, resendVerificationEmail);
router.post("/forgot-password", otpRateLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", verifyJWTToken, changePassword);

// Profile routes
router.get("/me", verifyJWTToken, getCurrentUser);
router.patch(
  "/update-profile",
  verifyJWTToken,
  uploadFiles.single("profileImage"),
  updateUserProfile
);
router.post(
  "/request-account-deletion",
  verifyJWTToken,
  requestAccountDeletion
);
router.get("/confirm-account-deletion/:token", confirmAccountDeletion);

// Address routes
router.get("/addresses", verifyJWTToken, getUserAddresses);
router.post("/addresses", verifyJWTToken, addUserAddress);
router.patch("/addresses/:addressId", verifyJWTToken, updateUserAddress);
router.patch("/addresses/:addressId/default", verifyJWTToken, setDefaultAddress);
router.delete("/addresses/:addressId", verifyJWTToken, deleteUserAddress);

// Wishlist routes
router.get("/wishlist", verifyJWTToken, getUserWishlist);
router.post("/wishlist", verifyJWTToken, addToWishlist);
router.delete("/wishlist/:wishlistItemId", verifyJWTToken, removeFromWishlist);

// Order routes
router.get("/orders", verifyJWTToken, getUserOrders);
router.get("/orders/:orderId", verifyJWTToken, getOrderDetails);
router.post("/orders/:orderId/cancel", verifyJWTToken, cancelOrder);

// Review routes
router.get("/reviews", verifyJWTToken, getUserReviews);
router.post("/reviews", verifyJWTToken, addReview);
router.patch("/reviews/:reviewId", verifyJWTToken, updateReview);
router.delete("/reviews/:reviewId", verifyJWTToken, deleteReview);

export default router;
