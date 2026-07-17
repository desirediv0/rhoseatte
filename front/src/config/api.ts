// API base URL configuration
export const API_URL =
  import.meta.env.MODE === "production"
    ? "https://www.rhoseatte.com/api"
    : "http://localhost:4004/api";
