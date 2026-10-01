import { ApiError } from "./ApiError.js";
import { processAndUploadImage } from "../middlewares/multer.middlerware.js";
import { getFileUrl } from "./deleteFromS3.js";

export const MAX_REVIEW_IMAGES = 5;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

// Validates and uploads review photos; returns the stored keys.
export async function uploadReviewImages(files = []) {
  if (files.length > MAX_REVIEW_IMAGES) {
    throw new ApiError(400, `You can add at most ${MAX_REVIEW_IMAGES} photos`);
  }
  for (const f of files) {
    if (!ALLOWED.includes(f.mimetype)) throw new ApiError(400, "Photos must be JPG, PNG or WEBP");
    if (f.size > MAX_BYTES) throw new ApiError(400, "Each photo must be under 5 MB");
  }
  const keys = [];
  for (const f of files) keys.push(await processAndUploadImage(f, "review-images"));
  return keys;
}

export const reviewImageUrls = (keys) => (keys || []).map((k) => getFileUrl(k));
