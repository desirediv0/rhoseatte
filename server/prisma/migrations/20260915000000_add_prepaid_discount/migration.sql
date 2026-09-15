-- Add prepaid (online payment) discount percent to PaymentSettings
ALTER TABLE "PaymentSettings" ADD COLUMN "prepaidDiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0;
