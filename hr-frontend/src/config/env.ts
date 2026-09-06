const apiUrl = import.meta.env.VITE_API_URL?.trim();

export const env = {
  API_URL: apiUrl || "",
};