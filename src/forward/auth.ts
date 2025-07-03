import { currentRuntimeConfig } from '@/config';

export async function isKeyAccepted(apiKey: string) {
  // modify this function to use your own auth logic
  if (currentRuntimeConfig.acceptedKeys === undefined) {
    return true;
  }

  return currentRuntimeConfig.acceptedKeys.includes(apiKey);
}
