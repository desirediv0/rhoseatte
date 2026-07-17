/**
 * Store Configuration Utility
 * Centralized configuration for store name, email, and other store-specific settings
 * All values can be overridden via environment variables
 */

export const getStoreConfig = () => {
  return {
    // Store Information
    storeName: process.env.STORE_NAME || "rhoseatte",
    storeEmail: process.env.STORE_EMAIL || "rhoseatte@gmail.com",
    storePhone: process.env.STORE_PHONE || "+91 95602 47619",
    storeAddress: process.env.STORE_ADDRESS || "India",

    // Store Description/Tagline
    storeTagline: process.env.STORE_TAGLINE || "Handcrafted Premium Jewellery",
    storeDescription:
      process.env.STORE_DESCRIPTION ||
      "Exquisite handcrafted jewellery designed to make you stand out. Browse our custom and handmade collections.",

    // Email Configuration
    fromName: process.env.FROM_NAME || process.env.STORE_NAME || "rhoseatte",
    fromEmail:
      process.env.FROM_EMAIL ||
      process.env.STORE_EMAIL ||
      process.env.SMTP_USER ||
      "rhoseatte@gmail.com",

    // Website Information
    websiteUrl: process.env.WEBSITE_URL || "https://rhoseatte.com",
    supportEmail:
      process.env.SUPPORT_EMAIL ||
      process.env.STORE_EMAIL ||
      "rhoseatte@gmail.com",

    // Social Media (optional)
    socialFacebook: process.env.SOCIAL_FACEBOOK || "",
    socialTwitter: process.env.SOCIAL_TWITTER || "",
    socialInstagram: process.env.SOCIAL_INSTAGRAM || "https://www.instagram.com/all_about_hair_accesories?igsh=MTJ6bXA2YnZ5M2k3Ng%3D%3D",
    socialYoutube: process.env.SOCIAL_YOUTUBE || "https://www.youtube.com/@rhoseattebypoojakhan",
    socialWhatsapp: process.env.SOCIAL_WHATSAPP || "919560247619",
  };
};

/**
 * Get store name
 */
export const getStoreName = () => {
  return getStoreConfig().storeName;
};

/**
 * Get store email
 */
export const getStoreEmail = () => {
  return getStoreConfig().storeEmail;
};

/**
 * Get from name for emails
 */
export const getFromName = () => {
  return getStoreConfig().fromName;
};

/**
 * Get from email for emails
 */
export const getFromEmail = () => {
  return getStoreConfig().fromEmail;
};

/**
 * Get full store information object
 */
export const getFullStoreInfo = () => {
  const config = getStoreConfig();
  return {
    name: config.storeName,
    email: config.storeEmail,
    phone: config.storePhone,
    address: config.storeAddress,
    tagline: config.storeTagline,
    description: config.storeDescription,
    websiteUrl: config.websiteUrl,
    supportEmail: config.supportEmail,
    fromName: config.fromName,
    fromEmail: config.fromEmail,
    social: {
      facebook: config.socialFacebook,
      twitter: config.socialTwitter,
      instagram: config.socialInstagram,
      youtube: config.socialYoutube,
    },
  };
};

export default getStoreConfig;
