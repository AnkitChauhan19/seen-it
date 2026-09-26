/**
 * Backend base URL for local development.
 * Android emulator: use 10.0.2.2 instead of localhost.
 * Physical device: use your machine's LAN IP.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
