export const GEMINI_CONFIG = {
  API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  PREVIEW_ROWS: 5,
  TEMPERATURE: 0.7,
  TOP_P: 0.8,
  MAX_TOKENS: 2048,
  SUPPORTED_FILE_TYPES: [
    'text/csv'
  ],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};
