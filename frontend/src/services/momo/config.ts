// MoMo Payment Configuration
// Get your MoMo API credentials from: https://business.momo.vn

export interface MoMoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  apiEndpoint: string;
  // For testing
  testMode?: boolean;
}

export const momoConfig: MoMoConfig = {
  partnerCode: import.meta.env.VITE_MOMO_PARTNER_CODE || '',
  accessKey: import.meta.env.VITE_MOMO_ACCESS_KEY || '',
  secretKey: import.meta.env.VITE_MOMO_SECRET_KEY || '',
  apiEndpoint: import.meta.env.VITE_MOMO_API_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  testMode: import.meta.env.VITE_MOMO_TEST_MODE !== 'false',
};

// Helper function to generate MoMo signature
export function generateMoMoSignature(params: Record<string, string>, secretKey: string): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // Use crypto-js for HMAC SHA256
  const CryptoJS = require('crypto-js');
  return CryptoJS.HmacSHA256(sortedParams, secretKey).toString(CryptoJS.enc.Hex);
}

// Helper function to generate order ID
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${timestamp}_${random}`;
}
