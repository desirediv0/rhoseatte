-- Separate OTP slot for re-authenticating an existing account during guest checkout
ALTER TABLE "User" ADD COLUMN "checkoutLoginOtp" TEXT;
ALTER TABLE "User" ADD COLUMN "checkoutLoginOtpExpiry" TIMESTAMP(3);
